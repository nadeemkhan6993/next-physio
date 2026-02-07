'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import TextArea from '@/app/components/TextArea';
import { Case, Physiotherapist } from '@/app/types';
import { formatTimestamp } from '@/app/lib/dateFormatter';

interface PhysiotherapistDashboardProps {
  user: Physiotherapist;
}

export default function PhysiotherapistDashboard({ user }: PhysiotherapistDashboardProps) {
  const router = useRouter();
  const [myCases, setMyCases] = useState<Case[]>([]);
  const [unmappedCases, setUnmappedCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'my-cases' | 'available-cases'>('my-cases');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const userId = user._id || user.id; // Support both MongoDB _id and legacy id
      const [myRes, unmappedRes] = await Promise.all([
        fetch(`/api/cases/physiotherapist/${userId}`),
        fetch(`/api/cases/unmapped?cities=${user.citiesAvailable.join(',')}`),
      ]);

      const myData = await myRes.json();
      const unmappedData = await unmappedRes.json();

      if (myData.success) setMyCases(myData.data);
      if (unmappedData.success) setUnmappedCases(unmappedData.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedCase || !newComment.trim()) return;

    try {
      const userId = user._id || user.id; // Support both MongoDB _id and legacy id
      const caseId = selectedCase._id || selectedCase.id; // Support both MongoDB _id and legacy id
      const response = await fetch(`/api/cases/${caseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: newComment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchCases();
        setSelectedCase(data.data);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleRequestClosure = async () => {
    if (!selectedCase) return;

    try {
      const userId = user._id || user.id; // Support both MongoDB _id and legacy id
      const response = await fetch(`/api/cases/${selectedCase.id}/request-closure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      const data = await response.json();
      if (data.success) {
        fetchCases();
        setSelectedCase(data.data);
      }
    } catch (error) {
      console.error('Error requesting closure:', error);
    }
  };

  const handlePickCase = async (caseId: string) => {
    try {
      const userId = user._id || user.id; // Support both MongoDB _id and legacy id
      const response = await fetch(`/api/cases/${caseId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physiotherapistId: userId }),
      });

      const data = await response.json();
      if (data.success) {
        fetchCases();
      }
    } catch (error) {
      console.error('Error picking case:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white">My Cases</h1>
          <p className="text-blue-100 mt-1">{user.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setView('my-cases')}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              view === 'my-cases'
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white shadow-lg scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
            }`}
          >
            My Cases ({myCases.length})
          </button>
          <button
            onClick={() => setView('available-cases')}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              view === 'available-cases'
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white shadow-lg scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
            }`}
          >
            Available Cases ({unmappedCases.length})
          </button>
        </div>

        {view === 'my-cases' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cases List */}
            <div className="lg:col-span-1 space-y-4">
              {myCases.length === 0 ? (
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur text-center">
                  <p className="text-gray-400">No assigned cases yet</p>
                </div>
              ) : (
                myCases.map((caseItem, index) => (
                  <div
                    key={caseItem.id || caseItem._id}
                    onClick={() => setSelectedCase(caseItem)}
                    className={`bg-gradient-to-br rounded-xl p-4 border cursor-pointer transition-all ${
                      selectedCase?.id === caseItem.id || selectedCase?._id === caseItem._id
                        ? 'from-[#3B82F6]/30 to-[#06B6D4]/30 border-[#3B82F6] shadow-lg scale-105'
                        : 'from-white/10 to-white/5 border-white/10 hover:border-[#3B82F6]/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">Case #{index + 1}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          caseItem.status === 'open'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : caseItem.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : caseItem.status === 'pending_closure'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}
                      >
                        {caseItem.status === 'pending_closure' 
                          ? 'Pending' 
                          : caseItem.status === 'in_progress'
                          ? 'In Progress'
                          : caseItem.status === 'open'
                          ? 'Open'
                          : caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{caseItem.issueDetails}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      💬 {caseItem.comments?.length || 0} comments
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Case Details */}
            <div className="lg:col-span-2">
              {selectedCase ? (
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-white">Case Details</h2>
                    <span
                      className={`px-4 py-2 rounded-full font-medium ${
                        selectedCase.status === 'open'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : selectedCase.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : selectedCase.status === 'pending_closure'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}
                    >
                      {selectedCase.status === 'pending_closure' 
                        ? 'Pending Closure' 
                        : selectedCase.status === 'in_progress'
                        ? 'In Progress'
                        : selectedCase.status === 'open'
                        ? 'Open'
                        : selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                    <div>
                      <span className="text-sm font-medium text-gray-400">Issue Description</span>
                      <p className="text-white mt-2">{selectedCase.issueDetails}</p>
                    </div>
                    
                    {/* Patient Information */}
                    {selectedCase.patientId && typeof selectedCase.patientId === 'object' && 'name' in selectedCase.patientId && (
                      <div className="bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 p-4 rounded-xl border border-[#06B6D4]/30">
                        <h4 className="font-bold text-white mb-2 text-sm">👤 Patient Information</h4>
                        <button
                          onClick={() => {
                            const patientData = selectedCase.patientId as any;
                            router.push(`/profile?userId=${patientData._id || patientData.id}`);
                          }}
                          className="text-[#06B6D4] text-lg font-semibold hover:text-[#22D3EE] transition-colors cursor-pointer underline text-left"
                        >
                          {(selectedCase.patientId as any).name}
                        </button>
                        <div className="text-sm text-gray-300 space-y-1 mt-2">
                          <p>📧 {(selectedCase.patientId as any).email}</p>
                          {(selectedCase.patientId as any).mobileNumber && (
                            <p>📱 {(selectedCase.patientId as any).mobileNumber}</p>
                          )}
                          {(selectedCase.patientId as any).age && (
                            <p>🎂 Age: {(selectedCase.patientId as any).age}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-400 uppercase">City</span>
                        <p className="text-lg font-semibold text-[#3B82F6] mt-1">{selectedCase.city}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase">Can Travel</span>
                        <p className="text-lg font-semibold text-[#06B6D4] mt-1">{selectedCase.canTravel ? '✓ Yes' : '✗ No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="mb-6">
                    <h3 className="font-bold text-white mb-4 text-lg">Comments & Progress</h3>
                    
                    {/* Add Comment - Positioned at Top */}
                    {selectedCase.status !== 'closed' && (
                      <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                        <TextArea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment about the patient's progress..."
                          rows={3}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-lg"
                        />
                        <button
                          onClick={handleAddComment}
                          className="w-full py-3 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-bold rounded-lg hover:shadow-lg transition-all cursor-pointer"
                        >
                          Send Message
                        </button>
                      </div>
                    )}

                    {/* Comments Display - Latest First */}
                    <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                      {!selectedCase.comments || selectedCase.comments.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No comments yet. Add one to start tracking progress!</p>
                      ) : (
                        [...selectedCase.comments].reverse().map((comment) => (
                          <div key={comment.id || comment._id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium text-[#3B82F6]">{comment.userName}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ({comment.userRole === 'admin' ? '👔 Admin' : comment.userRole === 'patient' ? '👤 Patient' : '👨‍⚕️ Physio'})
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-300">{comment.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {selectedCase.status !== 'closed' && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddComment}
                          disabled
                          className="px-6 py-2 bg-gray-600 text-gray-400 font-medium rounded-lg cursor-not-allowed opacity-50"
                          title="Use the message box above to add comments"
                        >
                          Add Comment
                        </button>
                        {(selectedCase.status === 'open' || selectedCase.status === 'in_progress') && (
                          <button
                            onClick={handleRequestClosure}
                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all cursor-pointer"
                          >
                            Request Closure
                          </button>
                        )}
                        {selectedCase.status === 'pending_closure' && (
                          <div className="text-sm text-yellow-300 bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/30">
                            ⏳ Awaiting patient confirmation to close
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-12 border border-white/10 backdrop-blur text-center">
                  <p className="text-gray-400 text-lg">
                    👈 Select a case to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'available-cases' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unmappedCases.length === 0 ? (
              <div className="col-span-full bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-12 border border-white/10 backdrop-blur text-center">
                <p className="text-gray-400 text-lg">
                  No available cases in your cities right now
                </p>
              </div>
            ) : (
              unmappedCases.map((caseItem) => (
                <div key={caseItem.id || caseItem._id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur hover:border-[#3B82F6]/50 transition-all">
                  <h3 className="font-bold text-white mb-3 text-lg">New Case</h3>
                  <div className="space-y-3 text-sm mb-6">
                    <p className="text-gray-300">{caseItem.issueDetails}</p>
                    <div className="flex justify-between items-center py-2 border-t border-white/10">
                      <span className="text-gray-400">📍 City</span>
                      <span className="text-[#3B82F6] font-medium">{caseItem.city}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">🚗 Can Travel</span>
                      <span className="text-[#06B6D4] font-medium">{caseItem.canTravel ? 'Yes' : 'No'}</span>
                    </div>
                    {caseItem.preferredGender && (
                      <div className="flex justify-between items-center py-2 border-t border-white/10">
                        <span className="text-gray-400">👤 Preferred Gender</span>
                        <span className="text-[#3B82F6] font-medium capitalize">{caseItem.preferredGender}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handlePickCase((caseItem.id || caseItem._id) as string)}
                    className="w-full py-3 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-bold rounded-lg hover:shadow-lg transition-all cursor-pointer"
                  >
                    Pick This Case
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
