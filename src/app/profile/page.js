'use client';
import MobileLayout from '@/components/MobileLayout';
import { useRole } from '@/hooks/useRole';
// Cookies import আর লাগবে না, কারণ সার্ভার এটা হ্যান্ডেল করবে
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const { role } = useRole();
  const router = useRouter();

  const handleLogout = async () => {
    Swal.fire({
        title: 'Logout?',
        text: "You will be returned to the login screen.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Logout',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // ১. সার্ভারকে বলা কুকি ডিলিট করতে
                await fetch('/api/logout', { method: 'POST' });

                // ২. লোকাল স্টোরেজ ক্লিয়ার (ক্লায়েন্ট সাইড ক্লিনআপ)
                localStorage.removeItem('user_role');

                // ৩. লগিন পেজে রিডাইরেক্ট (Full Reload সহ)
                window.location.href = '/login';
                
            } catch (error) {
                console.error("Logout failed", error);
                Swal.fire('Error', 'Logout failed. Please try again.', 'error');
            }
        }
    });
  };

  return (
    <MobileLayout title="My Profile">
      <div className="flex flex-col items-center py-10">
        
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300">
            {role ? role.charAt(0).toUpperCase() : 'U'}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 capitalize">{role || 'User'}</h2>
        <p className="text-gray-400 text-sm mb-8 font-medium">Access Level</p>

        {/* Info Cards */}
        <div className="w-full space-y-3 px-4 mb-10">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                <span className="text-gray-500 font-medium">System Status</span>
                <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                <span className="text-gray-500 font-medium">App Version</span>
                <span className="text-gray-800 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full">v1.0.0</span>
            </div>
        </div>

        {/* Logout Button */}
        <button 
            onClick={handleLogout}
            className="w-11/12 bg-red-50 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm border border-red-100"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
        </button>

      </div>
    </MobileLayout>
  );
}