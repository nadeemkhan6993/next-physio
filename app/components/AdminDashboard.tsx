'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/app/components/Card';
import { User, Case, Physiotherapist, Patient, AdminStats } from '@/app/types';
import { getWorkExperienceText } from '@/app/lib/utils';
import { formatDate } from '@/app/lib/dateFormatter';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'physiotherapists' | 'patients' | 'cases'>('overview');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, physiosRes, patientsRes, casesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/users/physiotherapists'),
        fetch('/api/users/patients'),
        fetch('/api/cases'),
      ]);

      const statsData = await statsRes.json();
      const physiosData = await physiosRes.json();
      const patientsData = await patientsRes.json();
      const casesData = await casesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (physiosData.success) setPhysiotherapists(physiosData.data);
      if (patientsData.success) setPatients(patientsData.data);
      if (casesData.success) setCases(casesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : 'Unknown';
  };

  const getPhysioName = (physioId?: string) => {
    if (!physioId) return 'Unassigned';
    const physio = physiotherapists.find((p) => p.id === physioId);
    return physio ? physio.name : 'Unknown';
  };

  const getMappedPatients = (physioId: string) => {
    return cases.filter((c) => c.physiotherapistId === physioId);
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
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-blue-100 mt-1">Manage your physiotherapy platform</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {['overview', 'physiotherapists', 'patients', 'cases'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view as any)}
              className={`px-6 py-3 rounded-xl font-medium capitalize whitespace-nowrap transition-all ${
                selectedView === view
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Overview */}
        {selectedView === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20 rounded-2xl p-6 border border-[#3B82F6]/30 backdrop-blur">
              <div className="text-sm text-blue-200">Total Patients</div>
              <div className="text-4xl font-bold text-[#3B82F6] mt-2">{stats.totalPatients}</div>
            </div>
            <div className="bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 rounded-2xl p-6 border border-[#06B6D4]/30 backdrop-blur">
              <div className="text-sm text-cyan-200">Total Physiotherapists</div>
              <div className="text-4xl font-bold text-[#06B6D4] mt-2">{stats.totalPhysiotherapists}</div>
            </div>
            <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20 rounded-2xl p-6 border border-[#3B82F6]/30 backdrop-blur">
              <div className="text-sm text-blue-200">Total Cases</div>
              <div className="text-4xl font-bold text-[#3B82F6] mt-2">{stats.totalCases}</div>
            </div>
            <div className="bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 rounded-2xl p-6 border border-[#06B6D4]/30 backdrop-blur">
              <div className="text-sm text-cyan-200">Active Cases</div>
              <div className="text-4xl font-bold text-[#06B6D4] mt-2">{stats.activeCases}</div>
            </div>
            <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20 rounded-2xl p-6 border border-[#3B82F6]/30 backdrop-blur">
              <div className="text-sm text-blue-200">Closed Cases</div>
              <div className="text-4xl font-bold text-[#3B82F6] mt-2">{stats.closedCases}</div>
            </div>
          </div>
        )}

        {/* Physiotherapists */}
        {selectedView === 'physiotherapists' && (
          <div className="space-y-6">
            {physiotherapists.map((physio) => {
              const mappedCases = getMappedPatients(physio.id);
              return (
                <div key={physio.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur hover:border-[#3B82F6]/50 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white">{physio.name}</h3>
                      <p className="text-blue-300 text-sm mt-1">ID: {physio.id}</p>
                    </div>
                    <div className="text-right bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] rounded-xl p-4">
                      <div className="text-3xl font-bold text-white">{mappedCases.length}</div>
                      <div className="text-sm text-blue-100">Patients</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm text-white mt-1">{physio.email}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-gray-400">Mobile</p>
                      <p className="text-sm text-white mt-1">{physio.mobileNumber}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-gray-400">Cities Available</p>
                      <p className="text-sm text-white mt-1">{physio.citiesAvailable.join(', ')}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-xs text-gray-400">Specialities</p>
                      <p className="text-sm text-white mt-1">{physio.specialities[0] || 'N/A'}</p>
                    </div>
                  </div>

                  {mappedCases.length > 0 && (
                    <div className="pt-6 border-t border-white/10">
                      <h4 className="font-semibold text-white mb-3">Assigned Patients:</h4>
                      <div className="flex flex-wrap gap-2">
                        {mappedCases.map((c) => (
                          <span key={c.id} className="bg-[#3B82F6]/20 text-[#3B82F6] text-xs px-3 py-1 rounded-full border border-[#3B82F6]/30">
                            {getPatientName(c.patientId)} ({c.status})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Patients */}
        {selectedView === 'patients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => {
              const patientCases = cases.filter((c) => c.patientId === patient.id);
              return (
                <div key={patient.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur hover:border-[#06B6D4]/50 transition-all">
                  <h3 className="text-xl font-bold text-white">{patient.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{patient.email}</p>
                  
                  <div className="space-y-3 mt-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Age</span>
                      <span className="text-[#3B82F6]">{patient.age} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">City</span>
                      <span className="text-[#06B6D4]">{patient.city}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Gender</span>
                      <span className="text-white capitalize">{patient.gender}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Cases</span>
                      <span className="text-white font-bold">{patientCases.length}</span>
                    </div>
                  </div>

                  {patientCases.length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      {patientCases.map((c) => (
                        <div key={c.id} className="bg-[#3B82F6]/10 p-2 rounded border border-[#3B82F6]/20">
                          <p className="text-xs text-gray-300">
                            <span className="text-[#3B82F6] font-medium">Status:</span> {c.status}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            <span className="text-[#06B6D4] font-medium">Physio:</span> {getPhysioName(c.physiotherapistId)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Cases */}
        {selectedView === 'cases' && (
          <div className="space-y-6">
            {cases.map((caseItem) => (
              <div key={caseItem.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur hover:border-[#3B82F6]/50 transition-all cursor-pointer" onClick={() => setSelectedCase(caseItem)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Case #{caseItem.id}</h3>
                    <p className="text-gray-400 text-sm mt-1">Patient: {getPatientName(caseItem.patientId)}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      caseItem.status === 'open'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : caseItem.status === 'pending_closure'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {caseItem.status === 'pending_closure' 
                      ? 'Pending Closure' 
                      : caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-300 mb-4">{caseItem.issueDetails}</p>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-gray-400">Physiotherapist</p>
                    <p className="text-sm text-white mt-1">{getPhysioName(caseItem.physiotherapistId)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-gray-400">City</p>
                    <p className="text-sm text-[#3B82F6] mt-1">{caseItem.city}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-gray-400">Can Travel</p>
                    <p className="text-sm text-[#06B6D4] mt-1">{caseItem.canTravel ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-gray-400">Comments</p>
                    <p className="text-sm text-white mt-1">{caseItem.comments.length}</p>
                  </div>
                </div>

                {caseItem.comments.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-white mb-3">Latest Comments:</h4>
                    <div className="space-y-2">
                      {[...caseItem.comments].reverse().slice(0, 2).map((comment) => (
                        <div key={comment.id} className="bg-white/5 p-3 rounded border border-white/10">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="text-sm font-medium text-[#3B82F6]">{comment.userName}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({comment.userRole === 'admin' ? '👔' : comment.userRole === 'patient' ? '👤' : '👨‍⚕️'})
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
