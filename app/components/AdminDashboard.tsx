'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import SearchBar from '@/app/components/SearchBar';
import { User, Case, Physiotherapist, Patient, AdminStats } from '@/app/types';
import { getWorkExperienceText } from '@/app/lib/utils';
import { formatDate } from '@/app/lib/dateFormatter';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'physiotherapists' | 'patients' | 'cases'>('overview');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [assigningCase, setAssigningCase] = useState<Case | null>(null);
  const [selectedPhysioForAssignment, setSelectedPhysioForAssignment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [physioSearch, setPhysioSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [caseSearch, setCaseSearch] = useState('');

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

  const getPatientName = (patientId: string | any) => {
    // If patientId is already an object with name, use it directly
    if (typeof patientId === 'object' && patientId !== null && 'name' in patientId) {
      return patientId.name;
    }
    // Otherwise find the patient by ID
    const patient = patients.find((p) => (p.id || p._id) === patientId || (p.id || p._id)?.toString() === patientId?.toString());
    return patient ? patient.name : 'Unknown';
  };

  const getPhysioName = (physioId?: string | any) => {
    if (!physioId) return 'Unassigned';
    // If physioId is already an object with name, use it directly
    if (typeof physioId === 'object' && physioId !== null && 'name' in physioId) {
      return physioId.name;
    }
    // Otherwise find the physiotherapist by ID
    const physio = physiotherapists.find((p) => (p.id || p._id) === physioId || (p.id || p._id)?.toString() === physioId?.toString());
    return physio ? physio.name : 'Unknown';
  };

  const getMappedPatients = (physioId: string) => {
    return cases.filter((c) => {
      // Handle both object and string physiotherapistId
      if (typeof c.physiotherapistId === 'object' && c.physiotherapistId !== null) {
        return (c.physiotherapistId as any)._id === physioId || (c.physiotherapistId as any).id === physioId;
      }
      return c.physiotherapistId === physioId || c.physiotherapistId?.toString() === physioId?.toString();
    });
  };

  const handleAssignCase = async () => {
    if (!assigningCase || !selectedPhysioForAssignment) return;

    try {
      const caseId = assigningCase.id || assigningCase._id;
      const response = await fetch(`/api/cases/${caseId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physiotherapistId: selectedPhysioForAssignment }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh data
        fetchData();
        setAssigningCase(null);
        setSelectedPhysioForAssignment('');
        alert('Case assigned successfully!');
      } else {
        alert(data.error || 'Failed to assign case');
      }
    } catch (error) {
      console.error('Error assigning case:', error);
      alert('Error assigning case');
    }
  };

  const getEligiblePhysios = (caseItem: Case) => {
    return physiotherapists.filter(p => 
      p.citiesAvailable && p.citiesAvailable.includes(caseItem.city)
    );
  };

  // Get simple case number by index
  const getCaseNumber = (caseItem: Case) => {
    const index = cases.findIndex(c => (c.id || c._id) === (caseItem.id || caseItem._id));
    return index !== -1 ? index + 1 : 0;
  };

  // Filtered lists using useMemo for optimization
  const filteredPhysiotherapists = useMemo(() => {
    if (!physioSearch.trim()) return physiotherapists;
    const searchLower = physioSearch.toLowerCase();
    return physiotherapists.filter(p => 
      p.name.toLowerCase().includes(searchLower)
    );
  }, [physiotherapists, physioSearch]);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const searchLower = patientSearch.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchLower)
    );
  }, [patients, patientSearch]);

  const filteredCases = useMemo(() => {
    if (!caseSearch.trim()) return cases;
    const searchLower = caseSearch.toLowerCase();
    return cases.filter((c, index) => {
      const caseNumber = (index + 1).toString();
      const patientName = getPatientName(c.patientId).toLowerCase();
      return caseNumber.includes(searchLower) || patientName.includes(searchLower);
    });
  }, [cases, caseSearch, patients]);

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
              className={`px-6 py-3 rounded-xl font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
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
            <SearchBar
              value={physioSearch}
              onChange={setPhysioSearch}
              placeholder="Search physiotherapists by name..."
              className="mb-6"
            />
            {filteredPhysiotherapists.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                <p className="text-gray-400 text-lg">No physiotherapists found matching "{physioSearch}"</p>
              </div>
            ) : (
              filteredPhysiotherapists.map((physio) => {
              const physioId = (physio.id || physio._id) as string;
              const mappedCases = getMappedPatients(physioId);
              return (
                <div key={physioId} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur hover:border-[#3B82F6]/50 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <button
                        onClick={() => router.push(`/profile?userId=${physioId}`)}
                        className="text-2xl font-bold text-white hover:text-[#3B82F6] transition-colors cursor-pointer underline text-left"
                      >
                        {physio.name}
                      </button>
                      <p className="text-blue-300 text-sm mt-1">{physio.degrees?.join(', ') || 'No degrees listed'}</p>
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
                          <span key={c.id || c._id} className="bg-[#3B82F6]/20 text-[#3B82F6] text-xs px-3 py-1 rounded-full border border-[#3B82F6]/30">
                            {getPatientName(c.patientId)} ({c.status})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>
        )}

        {/* Patients */}
        {selectedView === 'patients' && (
          <div className="space-y-6">
            <SearchBar
              value={patientSearch}
              onChange={setPatientSearch}
              placeholder="Search patients by name..."
              className="mb-6"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.length === 0 ? (
              <div className="col-span-full bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                <p className="text-gray-400 text-lg">No patients found matching "{patientSearch}"</p>
              </div>
            ) : (
              filteredPatients.map((patient) => {
              const patientId = patient.id || patient._id;
              const patientCases = cases.filter((c) => {
                // Handle both object and string patientId
                if (typeof c.patientId === 'object' && c.patientId !== null) {
                  return (c.patientId as any)._id === patientId || (c.patientId as any).id === patientId;
                }
                return c.patientId === patientId || c.patientId?.toString() === patientId?.toString();
              });
              return (
                <div key={patientId} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur hover:border-[#06B6D4]/50 transition-all">
                  <button
                    onClick={() => router.push(`/profile?userId=${patientId}`)}
                    className="text-xl font-bold text-white hover:text-[#06B6D4] transition-colors cursor-pointer underline text-left"
                  >
                    {patient.name}
                  </button>
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
                        <div key={c.id || c._id} className="bg-[#3B82F6]/10 p-2 rounded border border-[#3B82F6]/20">
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
              })
            )}
            </div>
          </div>
        )}

        {/* Cases */}
        {selectedView === 'cases' && (
          <div className="space-y-6">
            <SearchBar
              value={caseSearch}
              onChange={setCaseSearch}
              placeholder="Search cases by number or patient name..."
              className="mb-6"
            />
            {filteredCases.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                <p className="text-gray-400 text-lg">No cases found matching "{caseSearch}"</p>
              </div>
            ) : (
              filteredCases.map((caseItem, index) => {
              const eligiblePhysios = getEligiblePhysios(caseItem);
              return (
              <div key={caseItem.id || caseItem._id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur hover:border-[#3B82F6]/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Case #{getCaseNumber(caseItem)}</h3>
                    <p className="text-gray-400 text-sm mt-1">Patient: {getPatientName(caseItem.patientId)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
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
                        ? 'Pending Closure' 
                        : caseItem.status === 'in_progress'
                        ? 'In Progress'
                        : caseItem.status === 'open'
                        ? 'Open'
                        : caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                    </span>
                    {!caseItem.physiotherapistId && eligiblePhysios.length > 0 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningCase(caseItem);
                        }}
                        className="bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-white px-4 py-2 rounded-lg"
                      >
                        Assign Physio
                      </Button>
                    )}
                  </div>
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
                    <p className="text-sm text-white mt-1">{caseItem.comments?.length || 0}</p>
                  </div>
                </div>

                {caseItem.comments && caseItem.comments.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-white mb-3">Latest Comments:</h4>
                    <div className="space-y-2">
                      {[...caseItem.comments].reverse().slice(0, 2).map((comment) => (
                        <div key={comment.id || comment._id} className="bg-white/5 p-3 rounded border border-white/10">
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
              );
            })
            )}

            {/* Assignment Modal */}
            {assigningCase && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-4">Assign Physiotherapist</h3>
                  <p className="text-gray-300 mb-6">
                    Case: {assigningCase.issueDetails.substring(0, 60)}...
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    City: <span className="text-[#06B6D4] font-semibold">{assigningCase.city}</span>
                  </p>
                  
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Physiotherapist
                  </label>
                  <select
                    value={selectedPhysioForAssignment}
                    onChange={(e) => setSelectedPhysioForAssignment(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white mb-6 focus:outline-none focus:border-[#06B6D4] appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="" className="bg-gray-800">Select a physiotherapist</option>
                    {getEligiblePhysios(assigningCase).map((physio) => {
                      const physioId = physio.id || physio._id;
                      return (
                        <option key={physioId} value={physioId} className="bg-gray-800">
                          {physio.name} - {physio.specialities?.join(', ')}
                        </option>
                      );
                    })}
                  </select>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setAssigningCase(null);
                        setSelectedPhysioForAssignment('');
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAssignCase}
                      disabled={!selectedPhysioForAssignment}
                      className="flex-1 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:shadow-lg text-white disabled:opacity-50"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
