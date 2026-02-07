'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import Select from '@/app/components/Select';
import TextArea from '@/app/components/TextArea';
import { Case, Patient, Physiotherapist, CaseFormData } from '@/app/types';
import { formatTimestamp } from '@/app/lib/dateFormatter';
import { useCityStore } from '@/app/store/useCityStore';

interface PatientDashboardProps {
  user: Patient;
}

export default function PatientDashboard({ user }: PatientDashboardProps) {
  const router = useRouter();
  const cities = useCityStore((state) => state.cities);
  
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [closedCases, setClosedCases] = useState<Case[]>([]);
  const [assignedPhysio, setAssignedPhysio] = useState<Physiotherapist | null>(null);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState<CaseFormData>({
    issueDetails: '',
    city: '',
    canTravel: false,
    preferredGender: 'no-preference',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [showPhysioSelection, setShowPhysioSelection] = useState(false);
  const [assigningPhysio, setAssigningPhysio] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = user._id || user.id; // Support both MongoDB _id and legacy id
      const response = await fetch(`/api/cases/patient/${userId}`);
      const data = await response.json();

      console.log('API Response:', data);
      console.log('User ID:', userId);

      if (data.success && data.data.length > 0) {
        // Separate active and closed cases
        const active = data.data.find((c: Case) => 
          c.status === 'open' || c.status === 'in_progress' || c.status === 'pending_closure'
        );
        const closed = data.data.filter((c: Case) => c.status === 'closed').sort((a: Case, b: Case) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        console.log('Active case found:', active);
        console.log('Active case physiotherapistId:', active?.physiotherapistId);
        console.log('Closed cases:', closed);
        
        setActiveCase(active || null);
        setClosedCases(closed);
        setAllCases(data.data);

        // Fetch assigned physiotherapist details if case has one
        if (active?.physiotherapistId) {
          console.log('Fetching physiotherapist details for ID:', active.physiotherapistId);
          
          // Check if physiotherapistId is already populated (object) or just an ID (string)
          if (typeof active.physiotherapistId === 'object' && active.physiotherapistId !== null) {
            // Already populated, use it directly
            console.log('Physiotherapist already populated:', active.physiotherapistId);
            setAssignedPhysio(active.physiotherapistId as Physiotherapist);
          } else {
            // It's just an ID, fetch the physiotherapist details
            const physioResponse = await fetch(`/api/users/physiotherapists`);
            const physioData = await physioResponse.json();
            if (physioData.success) {
              const assignedPhysiotherapist = physioData.data.find(
                (p: Physiotherapist) => (p.id || p._id) === active.physiotherapistId || (p.id || p._id)?.toString() === active.physiotherapistId?.toString()
              );
              console.log('Found assigned physiotherapist:', assignedPhysiotherapist);
              setAssignedPhysio(assignedPhysiotherapist || null);
            }
          }
          
          // Clear warning message when physiotherapist is assigned
          setWarningMessage('');
          setShowPhysioSelection(false);
          setPhysiotherapists([]);
        } else {
          setAssignedPhysio(null);
          // Also clear warning if no active case or no physiotherapist needed
          if (!active) {
            setWarningMessage('');
            setShowPhysioSelection(false);
            setPhysiotherapists([]);
          }
        }
      } else {
        console.log('No cases found or API error');
        // Clear all states when no cases
        setActiveCase(null);
        setAssignedPhysio(null);
        setWarningMessage('');
        setShowPhysioSelection(false);
        setPhysiotherapists([]);
      }
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhysiotherapists = async (city: string) => {
    try {
      const response = await fetch(`/api/users/physiotherapists?city=${city}`);
      const data = await response.json();
      if (data.success) {
        setPhysiotherapists(data.data);
      }
    } catch (error) {
      console.error('Error fetching physiotherapists:', error);
      setPhysiotherapists([]);
    }
  };

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({ ...prev, city, preferredPhysiotherapistId: undefined }));
    setPhysiotherapists([]);
    if (city) {
      fetchPhysiotherapists(city);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.issueDetails.trim())
      newErrors.issueDetails = 'Please describe your issue';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userId = user._id || user.id; // Support both MongoDB _id and legacy id
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId: userId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Immediately update UI states
        setShowCreateForm(false);
        setFormData({
          issueDetails: '',
          city: '',
          canTravel: false,
          preferredGender: 'no-preference',
        });
        setPhysiotherapists([]);
        
        // Check for warning (no matching gender physiotherapist)
        if (data.warning) {
          setWarningMessage(data.warning);
          // Fetch available physiotherapists in case city for manual selection
          if (data.data && data.data.city) {
            fetchPhysiotherapists(data.data.city);
            setShowPhysioSelection(true);
          }
        } else {
          setWarningMessage('');
          setShowPhysioSelection(false);
        }
        
        // Refresh data to get updated case with populated physiotherapist details
        await fetchData();
        
        // Scroll to top to show active case or warning
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        setErrors({ submit: data.error || 'Failed to create case' });
      }
    } catch (error) {
      console.error('Error creating case:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  const handleManualAssignment = async (physioId: string) => {
    if (!activeCase || assigningPhysio) return;
    
    setAssigningPhysio(true);
    try {
      const caseId = activeCase.id || activeCase._id;
      const response = await fetch(`/api/cases/${caseId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physiotherapistId: physioId }),
      });

      const data = await response.json();
      if (data.success) {
        setWarningMessage('');
        setShowPhysioSelection(false);
        setPhysiotherapists([]);
        fetchData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to assign physiotherapist');
      }
    } catch (error) {
      console.error('Error assigning physiotherapist:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setAssigningPhysio(false);
    }
  };

  const handleAddComment = async () => {
    if (!activeCase || !newComment.trim()) return;

    try {
      const userId = user._id || user.id; // Support both MongoDB _id and legacy id
      const caseId = activeCase.id || activeCase._id;
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
        // Refresh all cases to update
        fetchData();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCloseCase = async () => {
    if (!activeCase || !reviewComment.trim()) return;

    try {
      const caseId = activeCase.id || activeCase._id;
      const response = await fetch(`/api/cases/${caseId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: {
            rating,
            comment: reviewComment,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReviewComment('');
        setRating(5);
        // Refresh to move case to history
        fetchData();
      }
    } catch (error) {
      console.error('Error closing case:', error);
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
          <h1 className="text-4xl font-bold text-white">My Health Journey</h1>
          <p className="text-blue-100 mt-1">Welcome, {user.name}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Warning Banner - Only show if no physiotherapist is assigned */}
        {warningMessage && activeCase && !assignedPhysio && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-2xl p-6 mb-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">Action Needed</h3>
                <p className="text-yellow-100 mb-4">{warningMessage}</p>
                
                {showPhysioSelection && physiotherapists.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-bold text-yellow-200 mb-3">Available Physiotherapists in {activeCase.city}:</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-4">
                      {physiotherapists.map((physio) => {
                        const physioId = physio._id || physio.id;
                        return (
                          <div
                            key={physioId}
                            className="bg-white/10 border border-white/20 rounded-lg p-4 hover:border-yellow-400 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-white font-bold text-lg">{physio.name}</p>
                                {physio.gender && (
                                  <p className="text-gray-300 text-sm mt-1 capitalize">
                                    👤 {physio.gender}
                                  </p>
                                )}
                                {physio.degrees && physio.degrees.length > 0 && (
                                  <p className="text-gray-300 text-sm mt-1">🎓 {physio.degrees.join(', ')}</p>
                                )}
                                {physio.specialities && physio.specialities.length > 0 && (
                                  <p className="text-gray-300 text-sm mt-1">🏥 {physio.specialities.join(', ')}</p>
                                )}
                                {physio.practicingSince && (
                                  <p className="text-gray-400 text-sm mt-1">
                                    ⏱️ Practicing since {new Date(physio.practicingSince).getFullYear()}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleManualAssignment(physioId)}
                                disabled={assigningPhysio}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ml-4"
                              >
                                {assigningPhysio ? 'Assigning...' : 'Select'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        setWarningMessage('');
                        setShowPhysioSelection(false);
                        setPhysiotherapists([]);
                      }}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/30 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (activeCase.city) {
                          fetchPhysiotherapists(activeCase.city);
                          setShowPhysioSelection(true);
                        }
                      }}
                      className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Select Physiotherapist
                    </button>
                    <button
                      onClick={() => setWarningMessage('')}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/30 transition-all cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeCase && !showCreateForm ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">Your Active Case</h2>
                <p className="text-gray-400 mt-1">Stay updated with your treatment progress</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm cursor-pointer"
                >
                  + Create New Case
                </button>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    activeCase.status === 'open'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : activeCase.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : activeCase.status === 'pending_closure'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}
                >
                  {activeCase.status === 'pending_closure' 
                    ? 'Pending Closure' 
                    : activeCase.status === 'in_progress'
                    ? 'In Progress'
                    : activeCase.status === 'open'
                    ? 'Open'
                    : activeCase.status.charAt(0).toUpperCase() + activeCase.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Issue Details */}
            <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20 p-6 rounded-xl mb-8 border border-[#3B82F6]/30">
              <h3 className="font-bold text-white mb-3 text-lg">📋 Your Issue</h3>
              <p className="text-gray-200 leading-relaxed">{activeCase.issueDetails}</p>
              <div className="mt-4 text-sm text-gray-300">
                <p>
                  <span className="text-[#3B82F6] font-medium">📍 Location:</span> {activeCase.city}
                </p>
              </div>
            </div>

            {/* Assigned Physiotherapist */}
            {assignedPhysio ? (
              <div className="bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 p-6 rounded-xl mb-8 border border-[#06B6D4]/30">
                <h3 className="font-bold text-white mb-3 text-lg">👨‍⚕️ Your Physiotherapist</h3>
                <button
                  onClick={() => router.push(`/profile?userId=${assignedPhysio.id || assignedPhysio._id}`)}
                  className="text-gray-200 text-xl font-semibold mb-2 hover:text-[#06B6D4] transition-colors cursor-pointer underline text-left"
                >
                  {assignedPhysio.name}
                </button>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>📧 {assignedPhysio.email}</p>
                  <p>📱 {assignedPhysio.mobileNumber}</p>
                  <p>🎓 {assignedPhysio.degrees.join(', ')}</p>
                  <p>🏥 {assignedPhysio.specialities.join(', ')}</p>
                </div>
                <p className="text-gray-300 text-sm mt-4">Your therapist is actively working on your case. Check the messages below for updates!</p>
              </div>
            ) : (
              <div className="bg-yellow-500/20 border border-yellow-500/30 p-6 rounded-xl mb-8 backdrop-blur">
                <p className="text-yellow-200 font-medium">
                  ⏳ Your case is waiting to be assigned to a physiotherapist. We'll notify you once a therapist picks your case.
                </p>
              </div>
            )}

            {/* Communication Section */}
            <div className="border-t border-white/10 pt-8">
              <h3 className="font-bold text-white mb-6 text-2xl">💬 Messages & Progress Updates</h3>
              
              {/* Add Comment - Positioned at Top */}
              {(activeCase.status === 'open' || activeCase.status === 'in_progress') && (
                <div className="space-y-4 mb-8 pb-6 border-b border-white/10">
                  <TextArea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your progress, ask questions, or add updates..."
                    rows={4}
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
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activeCase.comments && activeCase.comments.length > 0 ? (
                  [...activeCase.comments].reverse().map((comment) => (
                    <div
                      key={comment.id || comment._id}
                      className={`p-5 rounded-xl border ${
                        comment.userRole === 'patient' 
                          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30' 
                          : comment.userRole === 'admin'
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-[#06B6D4]/10 border-[#06B6D4]/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{comment.userName}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                            {comment.userRole === 'patient' ? '👤 You' : comment.userRole === 'admin' ? '👔 Admin' : '👨‍⚕️ Therapist'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-200">{comment.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
                    <p className="text-gray-400">No messages yet. Your physiotherapist will send updates here soon!</p>
                  </div>
                )}
              </div>

              {/* Pending Closure */}
              {activeCase.status === 'pending_closure' && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 p-8 rounded-xl mt-8 backdrop-blur">
                  <h4 className="font-bold text-yellow-300 mb-4 text-xl">
                    ⭐ Case Closure Requested
                  </h4>
                  <p className="text-yellow-100 mb-6">
                    Your physiotherapist has requested to close this case. Please provide your feedback and rating to complete the process.
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-yellow-200 mb-3">
                      How was your treatment experience? (1-5)
                    </label>
                    <Select
                      value={rating.toString()}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      options={[
                        { value: '5', label: '⭐⭐⭐⭐⭐ Excellent' },
                        { value: '4', label: '⭐⭐⭐⭐ Very Good' },
                        { value: '3', label: '⭐⭐⭐ Good' },
                        { value: '2', label: '⭐⭐ Fair' },
                        { value: '1', label: '⭐ Poor' },
                      ]}
                    />
                  </div>

                  <TextArea
                    label="Your Review"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience and feedback about the treatment..."
                    rows={4}
                    className="mb-6 bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-lg"
                  />

                  <button
                    onClick={handleCloseCase}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all cursor-pointer"
                  >
                    ✓ Confirm and Close Case
                  </button>
                </div>
              )}

              {/* Case Closed */}
              {activeCase.status === 'closed' && activeCase.review && (
                <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20 p-8 rounded-xl mt-8 border border-[#3B82F6]/30">
                  <h4 className="font-bold text-white mb-4 text-xl">✓ Case Completed</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{'⭐'.repeat(activeCase.review.rating)}</span>
                    <span className="text-gray-300">{activeCase.review.rating}/5</span>
                  </div>
                  <p className="text-gray-200">{activeCase.review.comment}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur">
            <h2 className="text-3xl font-bold text-white mb-2">
              {closedCases.length > 0 ? 'Start New Treatment' : 'Create Your First Case'}
            </h2>
            <p className="text-gray-300 mb-8">
              Describe your issue and we'll help you find the perfect physiotherapist
            </p>

            <form onSubmit={handleSubmitCase} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2">Describe Your Issue</label>
                <textarea
                  value={formData.issueDetails}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, issueDetails: e.target.value }))
                  }
                  placeholder="Describe your symptoms, pain, or physical issue in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                {errors.issueDetails && <p className="text-red-400 text-sm mt-1">{errors.issueDetails}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2">Your City</label>
                <select
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#3B82F6] transition-colors appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="" className="bg-gray-800 text-white">Select city</option>
                  {cities.map((city) => (
                    <option key={city.value} value={city.value} className="bg-gray-800 text-white">{city.label}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="canTravel"
                  checked={formData.canTravel}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, canTravel: e.target.checked }))
                  }
                  className="w-5 h-5 text-[#3B82F6] rounded"
                />
                <label htmlFor="canTravel" className="text-gray-200 font-medium">
                  I can travel to the physiotherapist's clinic
                </label>
              </div>

              {formData.city && physiotherapists.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-200 mb-2">
                    Choose Physiotherapist (Optional)
                  </label>
                  <p className="text-gray-400 text-sm mb-3">
                    {physiotherapists.length} physiotherapist{physiotherapists.length !== 1 ? 's' : ''} available in {formData.city}
                  </p>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    <div
                      onClick={() => setFormData((prev) => ({ ...prev, preferredPhysiotherapistId: undefined }))}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        !formData.preferredPhysiotherapistId
                          ? 'bg-[#3B82F6]/20 border-[#3B82F6] ring-2 ring-[#3B82F6]/50'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          !formData.preferredPhysiotherapistId ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-gray-400'
                        }`}>
                          {!formData.preferredPhysiotherapistId && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold">No Preference (Auto-assign)</p>
                          <p className="text-gray-400 text-sm">Let the system match you with an available therapist</p>
                        </div>
                      </div>
                    </div>
                    {physiotherapists.map((physio) => {
                      const userId = physio._id || physio.id;
                      const isSelected = formData.preferredPhysiotherapistId === userId;
                      return (
                        <div
                          key={userId}
                          onClick={() => setFormData((prev) => ({ ...prev, preferredPhysiotherapistId: userId }))}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#3B82F6]/20 border-[#3B82F6] ring-2 ring-[#3B82F6]/50'
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                              isSelected ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-gray-400'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold text-lg">{physio.name}</p>
                              {physio.degrees && physio.degrees.length > 0 && (
                                <p className="text-gray-300 text-sm mt-1">🎓 {physio.degrees.join(', ')}</p>
                              )}
                              {physio.specialities && physio.specialities.length > 0 && (
                                <p className="text-gray-300 text-sm mt-1">🏥 {physio.specialities.join(', ')}</p>
                              )}
                              {physio.practicingSince && (
                                <p className="text-gray-400 text-sm mt-1">
                                  ⏱️ Practicing since {new Date(physio.practicingSince).getFullYear()}
                                </p>
                              )}
                              {physio.gender && (
                                <p className="text-gray-400 text-sm mt-1 capitalize">
                                  👤 {physio.gender}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!formData.preferredPhysiotherapistId && (
                <div>
                  <label className="block text-sm font-bold text-gray-200 mb-2">Gender Preference (Optional)</label>
                  <select
                    value={formData.preferredGender || 'no-preference'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredGender: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#3B82F6] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="no-preference" className="bg-gray-800">No preference</option>
                    <option value="male" className="bg-gray-800">Prefer Male Therapist</option>
                    <option value="female" className="bg-gray-800">Prefer Female Therapist</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                {activeCase && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        issueDetails: '',
                        city: '',
                        canTravel: false,
                        preferredGender: 'no-preference',
                      });
                      setPhysiotherapists([]);
                    }}
                    className="w-1/3 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`${activeCase ? 'w-2/3' : 'w-full'} py-4 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-bold rounded-lg hover:shadow-lg transition-all cursor-pointer`}
                >
                  Submit Case
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Case History Section */}
        {closedCases.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold text-white mb-6">📚 Treatment History</h2>
            <div className="space-y-6">
              {closedCases.map((caseItem, index) => (
                <div key={caseItem.id || caseItem._id} className="bg-gradient-to-br from-white/5 to-white/3 rounded-2xl p-6 border border-white/10 backdrop-blur">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Case #{index + 1}</h3>
                      <p className="text-gray-400 text-sm mt-1">{new Date(caseItem.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      ✓ Completed
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300">{caseItem.issueDetails}</p>
                  </div>

                  {caseItem.review && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{'⭐'.repeat(caseItem.review.rating)}</span>
                        <span className="text-gray-400 text-sm">{caseItem.review.rating}/5</span>
                      </div>
                      <p className="text-gray-300 text-sm">{caseItem.review.comment}</p>
                    </div>
                  )}

                  {/* Collapsed comments - show count */}
                  {caseItem.comments && caseItem.comments.length > 0 && (
                    <div className="mt-4 text-sm text-gray-400">
                      💬 {caseItem.comments.length} messages
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
