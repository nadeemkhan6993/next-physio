'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import AdminDashboard from '@/app/components/AdminDashboard';
import PhysiotherapistDashboard from '@/app/components/PhysiotherapistDashboard';
import PatientDashboard from '@/app/components/PatientDashboard';
import UserMenu from '@/app/components/UserMenu';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="absolute top-4 right-4 z-10">
        <UserMenu user={user as any} />
      </div>

      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'physiotherapist' && <PhysiotherapistDashboard user={user as any} />}
      {user.role === 'patient' && <PatientDashboard user={user as any} />}
    </div>
  );
}
