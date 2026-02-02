'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/app/components/Input';
import Select from '@/app/components/Select';
import MultiSelect from '@/app/components/MultiSelect';
import Button from '@/app/components/Button';
import { User, Admin, Physiotherapist, Patient } from '@/app/types';
import { getWorkExperienceText } from '@/app/lib/utils';
import { formatDate } from '@/app/lib/dateFormatter';
import { findUserById } from '@/app/lib/mockData';
import { useAuthStore } from '@/app/store/useAuthStore';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewingUserId = searchParams.get('userId');
  
  const { user, updateUser } = useAuthStore();
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isViewingOther, setIsViewingOther] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // If viewing another user, load their profile
    if (viewingUserId) {
      const otherUser = findUserById(viewingUserId);
      if (otherUser) {
        setViewingUser(otherUser);
        setFormData(otherUser);
        setIsViewingOther(true);
      } else {
        // User not found, fallback to own profile
        setFormData(user);
        setViewingUser(user as any);
        setIsViewingOther(false);
      }
    } else {
      // Viewing own profile
      setFormData(user);
      setViewingUser(user as any);
      setIsViewingOther(false);
    }
  }, [router, viewingUserId, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (user?.role === 'physiotherapist') {
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.practicingSince)
        newErrors.practicingSince = 'Practicing since date is required';
      if (!formData.degrees || formData.degrees.length === 0)
        newErrors.degrees = 'At least one degree is required';
      if (!formData.specialities || formData.specialities.length === 0)
        newErrors.specialities = 'At least one speciality is required';
      if (!formData.workExperience)
        newErrors.workExperience = 'Work experience is required';
      if (!formData.citiesAvailable || formData.citiesAvailable.length === 0)
        newErrors.citiesAvailable = 'At least one city is required';
      if (!formData.clinicAddresses || formData.clinicAddresses.length === 0)
        newErrors.clinicAddresses = 'At least one clinic address is required';
      if (!formData.mobileNumber)
        newErrors.mobileNumber = 'Mobile number is required';
    }

    if (user?.role === 'patient') {
      if (!formData.age) newErrors.age = 'Age is required';
      else if (formData.age < 1 || formData.age > 120)
        newErrors.age = 'Invalid age';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.mobileNumber)
        newErrors.mobileNumber = 'Mobile number is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = user?._id || user?.id; // Support both MongoDB _id and legacy id
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: userId }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = {
          ...data.data,
          id: data.data._id || data.data.id, // Backward compatibility
        };
        updateUser(updatedUser);
        setFormData(updatedUser);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
      } else {
        setErrors({ submit: data.error || 'Update failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !viewingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] shadow-lg border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {isViewingOther ? `${viewingUser.name}'s Profile` : 'My Profile'}
            </h1>
            <p className="text-blue-100 mt-1 capitalize">{viewingUser.role}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all border border-white/30 backdrop-blur"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur">
          {/* Profile Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/10">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">{viewingUser.name}</h2>
              <p className="text-[#06B6D4] text-lg capitalize font-semibold">{viewingUser.role}</p>
            </div>
            {!isEditing && !isViewingOther && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-6 py-4 rounded-xl mb-8 backdrop-blur">
              ✓ {successMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <Input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Admin Profile */}
            {user.role === 'admin' && (
              <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20 p-6 rounded-xl border border-[#3B82F6]/30">
                <p className="text-gray-200">
                  <span className="text-[#06B6D4] font-bold">👔 Administrator</span> - You have full access to the platform.
                </p>
              </div>
            )}

            {/* Physiotherapist Fields */}
            {user.role === 'physiotherapist' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.dob || ''}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        error={errors.dob}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                        {formData.dob || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                    {isEditing ? (
                      <Select
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                        ]}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200 capitalize">
                        {formData.gender || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Practicing Since</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.practicingSince || ''}
                        onChange={(e) => handleInputChange('practicingSince', e.target.value)}
                        error={errors.practicingSince}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                        {formData.practicingSince ? formatDate(new Date(formData.practicingSince)) : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.mobileNumber || ''}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        error={errors.mobileNumber}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                        {formData.mobileNumber || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Degrees</label>
                  {isEditing ? (
                    <MultiSelect
                      value={formData.degrees || []}
                      onChange={(value) => handleInputChange('degrees', value)}
                      placeholder="Type degree and press Enter (e.g., BPT, MPT)"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                      {formData.degrees?.length ? formData.degrees.join(', ') : 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Specialities</label>
                  {isEditing ? (
                    <MultiSelect
                      value={formData.specialities || []}
                      onChange={(value) => handleInputChange('specialities', value)}
                      placeholder="Type speciality and press Enter (e.g., Sports Injury)"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                      {formData.specialities?.length ? formData.specialities.join(', ') : 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Available Cities</label>
                  {isEditing ? (
                    <MultiSelect
                      value={formData.citiesAvailable || []}
                      onChange={(value) => handleInputChange('citiesAvailable', value)}
                      placeholder="Type city and press Enter (e.g., Mumbai, Delhi)"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                      {formData.citiesAvailable?.length ? formData.citiesAvailable.join(', ') : 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient Fields */}
            {user.role === 'patient' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        error={errors.age}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                        {formData.age || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                    {isEditing ? (
                      <Select
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                        ]}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200 capitalize">
                        {formData.gender || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        error={errors.city}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                        {formData.city || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.mobileNumber || ''}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        error={errors.mobileNumber}
                      />
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-gray-200">
                        {formData.mobileNumber || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl backdrop-blur">
                ✕ {errors.submit}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(user);
                    setErrors({});
                    setSuccessMessage('');
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
