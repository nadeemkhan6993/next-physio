'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCityStore } from '@/app/store/useCityStore';
import { SignupFormData, UserRole } from '@/app/types';
import DateInput from '@/app/components/DateInput';

const ADMIN_SECRET_CODE = 'ZBK897';

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const cities = useCityStore((state) => state.cities);
  
  const [role, setRole] = useState<UserRole | ''>('');
  const [formData, setFormData] = useState<Partial<SignupFormData>>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const images = [
    '/assets/images/Physio1.png',
    '/assets/images/Physio2.png',
    '/assets/images/Physio3.png',
    '/assets/images/Physio4.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    if (showCityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCityDropdown]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole as UserRole | '');
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
    setSelectedCities([]);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData((prev) => {
      const currentArray = (prev[field as keyof SignupFormData] as string[]) || [''];
      const newArray = [...currentArray];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field: string) => {
    setFormData((prev) => {
      const currentArray = (prev[field as keyof SignupFormData] as string[]) || [];
      return { ...prev, [field]: [...currentArray, ''] };
    });
  };

  const removeArrayField = (field: string, index: number) => {
    setFormData((prev) => {
      const currentArray = (prev[field as keyof SignupFormData] as string[]) || [];
      return { ...prev, [field]: currentArray.filter((_, i) => i !== index) };
    });
  };

  const toggleCitySelection = (cityName: string) => {
    setSelectedCities(prev => {
      if (prev.includes(cityName)) {
        return prev.filter(c => c !== cityName);
      } else {
        return [...prev, cityName];
      }
    });
    setErrors((prev) => ({ ...prev, citiesAvailable: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (role === 'admin') {
      if (!formData.secretCode) newErrors.secretCode = 'Secret code is required';
      else if (formData.secretCode !== ADMIN_SECRET_CODE)
        newErrors.secretCode = 'Invalid secret code';
    }

    if (role === 'patient') {
      if (!formData.age) newErrors.age = 'Age is required';
      else if (formData.age < 1 || formData.age > 120)
        newErrors.age = 'Invalid age';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (role === 'physiotherapist') {
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.practicingSince) newErrors.practicingSince = 'Practicing since is required';
      if (!formData.degrees || (typeof formData.degrees === 'string' && !formData.degrees.trim())) 
        newErrors.degrees = 'Degrees are required';
      if (!formData.specialities || (typeof formData.specialities === 'string' && !formData.specialities.trim()))
        newErrors.specialities = 'Specialities are required';
      if (selectedCities.length === 0)
        newErrors.citiesAvailable = 'At least one city is required';
      if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare data for submission
      const cleanedData: any = { ...formData, role };
      
      if (role === 'physiotherapist') {
        // Convert comma-separated strings to arrays
        cleanedData.degrees = typeof formData.degrees === 'string' 
          ? formData.degrees.split(',').map((d: string) => d.trim()).filter((d: string) => d)
          : [];
        cleanedData.specialities = typeof formData.specialities === 'string'
          ? formData.specialities.split(',').map((s: string) => s.trim()).filter((s: string) => s)
          : [];
        cleanedData.citiesAvailable = selectedCities;
        
        // Handle clinic addresses - convert to array if provided, otherwise empty array
        if (formData.clinicAddresses && Array.isArray(formData.clinicAddresses)) {
          cleanedData.clinicAddresses = formData.clinicAddresses.filter(a => a && a.trim());
        } else {
          cleanedData.clinicAddresses = [];
        }
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (data.success) {
        // Store user with MongoDB _id in Zustand
        const userData = {
          ...data.data.user,
          id: data.data.user._id, // Backward compatibility
        };
        setUser(userData);
        router.push('/dashboard');
      } else {
        setErrors({ submit: data.error || 'Signup failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-6xl w-full h-[90vh] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="grid lg:grid-cols-2 gap-0 h-full">
          {/* Left Side - Image Slider */}
          <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] p-12">
            <div className="relative h-full flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Welcome to PhysioConnect
                </h2>
                <p className="text-white/90 text-lg">
                  Connecting patients with qualified physiotherapists
                </p>
              </div>
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-white/10">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Physiotherapy ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-white/20 flex items-center justify-center text-white text-2xl">PhysioConnect</div>';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 lg:p-12 flex flex-col h-full overflow-hidden">
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-white">Create Account</h1>
                <Link href="/login" className="text-sm text-gray-400 hover:text-[#06B6D4] transition-colors">
                  Already have an account? <span className="text-[#06B6D4] font-medium">Login</span>
                </Link>
              </div>
              <p className="text-gray-400">Choose your role and fill in the details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Role <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['patient', 'physiotherapist', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleChange(r)}
                      className={`py-3 px-4 rounded-lg font-medium transition-all cursor-pointer ${
                        role === r
                          ? 'bg-[#06B6D4] text-white shadow-lg shadow-[#06B6D4]/30'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {role && (
                <>
                  {/* Common Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                    />
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Admin Fields */}
                  {role === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Secret Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.secretCode || ''}
                        onChange={(e) => handleInputChange('secretCode', e.target.value)}
                        placeholder="Enter admin secret code"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                      />
                      {errors.secretCode && <p className="text-red-400 text-sm mt-1">{errors.secretCode}</p>}
                    </div>
                  )}

                  {/* Patient Fields */}
                  {role === 'patient' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Age <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            value={formData.age || ''}
                            onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                            placeholder="Enter age"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                          />
                          {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            City <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={formData.city || ''}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.mobileNumber || ''}
                          onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                          placeholder="Enter mobile number"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                        />
                        {errors.mobileNumber && <p className="text-red-400 text-sm mt-1">{errors.mobileNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Gender <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={formData.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                          }}
                        >
                          <option value="" className="bg-gray-800 text-white">Select gender</option>
                          <option value="male" className="bg-gray-800 text-white">Male</option>
                          <option value="female" className="bg-gray-800 text-white">Female</option>
                          <option value="other" className="bg-gray-800 text-white">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                      </div>
                    </div>
                  )}

                  {/* Physiotherapist Fields */}
                  {role === 'physiotherapist' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <DateInput
                          label="Date of Birth"
                          value={formData.dob || ''}
                          onChange={(value) => handleInputChange('dob', value)}
                          error={errors.dob}
                          required
                        />
                        <DateInput
                          label="Practicing Since"
                          value={formData.practicingSince || ''}
                          onChange={(value) => handleInputChange('practicingSince', value)}
                          error={errors.practicingSince}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Degrees <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.degrees || ''}
                          onChange={(e) => handleInputChange('degrees', e.target.value)}
                          placeholder="Enter degrees (comma separated, e.g., BPT, MPT, DPT)"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                        />
                        <p className="text-xs text-gray-400 mt-1">Separate multiple degrees with commas</p>
                        {errors.degrees && <p className="text-red-400 text-sm mt-1">{errors.degrees}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Specialities <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.specialities || ''}
                          onChange={(e) => handleInputChange('specialities', e.target.value)}
                          placeholder="Enter specialities (comma separated, e.g., Sports Injury, Orthopedic)"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                        />
                        <p className="text-xs text-gray-400 mt-1">Separate multiple specialities with commas</p>
                        {errors.specialities && <p className="text-red-400 text-sm mt-1">{errors.specialities}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cities Available <span className="text-red-400">*</span>
                        </label>
                        <div className="relative" ref={cityDropdownRef}>
                          <div
                            onClick={() => setShowCityDropdown(!showCityDropdown)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer focus:outline-none focus:border-[#06B6D4] transition-colors min-h-[3rem] flex items-center"
                          >
                            {selectedCities.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedCities.map((city) => (
                                  <span
                                    key={city}
                                    className="bg-[#06B6D4]/30 text-white px-2 py-1 rounded text-sm flex items-center gap-1"
                                  >
                                    {city}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCitySelection(city);
                                      }}
                                      className="text-white/70 hover:text-white cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">Select cities</span>
                            )}
                          </div>
                          {showCityDropdown && (
                            <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden">
                              <div className="max-h-64 overflow-y-auto p-2">
                                {cities.map((city) => (
                                  <div
                                    key={city.value}
                                    onClick={() => toggleCitySelection(city.value)}
                                    className={`px-4 py-2 cursor-pointer rounded transition-colors ${
                                      selectedCities.includes(city.value)
                                        ? 'bg-[#06B6D4]/30 text-white'
                                        : 'text-gray-300 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedCities.includes(city.value)}
                                        onChange={() => {}}
                                        className="w-4 h-4"
                                      />
                                      <span>{city.label}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {errors.citiesAvailable && <p className="text-red-400 text-sm mt-1">{errors.citiesAvailable}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Clinic Addresses (Optional)
                        </label>
                        {(formData.clinicAddresses || ['']).map((address, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={address}
                              onChange={(e) => handleArrayChange('clinicAddresses', index, e.target.value)}
                              placeholder="Enter clinic address"
                              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                            />
                            {(formData.clinicAddresses?.length || 0) > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArrayField('clinicAddresses', index)}
                                className="px-4 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayField('clinicAddresses')}
                          className="text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors cursor-pointer"
                        >
                          + Add Another Address
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.mobileNumber || ''}
                          onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                          placeholder="Enter mobile number"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                        />
                        {errors.mobileNumber && <p className="text-red-400 text-sm mt-1">{errors.mobileNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Gender <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={formData.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                          }}
                        >
                          <option value="" className="bg-gray-800 text-white">Select gender</option>
                          <option value="male" className="bg-gray-800 text-white">Male</option>
                          <option value="female" className="bg-gray-800 text-white">Female</option>
                          <option value="other" className="bg-gray-800 text-white">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="space-y-4">
                    {errors.submit && (
                      <p className="text-red-400 text-sm text-center">{errors.submit}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#06B6D4]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}} />
    </div>
  );
}
