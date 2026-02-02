'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to PhysioConnect
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your platform for physiotherapy care and management
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            Sign Up
          </a>
        </div>
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Who we serve:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-700 mb-1">Patients</div>
              <div>Get connected with physiotherapists</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-700 mb-1">Physiotherapists</div>
              <div>Manage your cases and patients</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-700 mb-1">Administrators</div>
              <div>Oversee platform operations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

