'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileLayout({ children, title, showBack = false, backUrl = '/' }) {
  const pathname = usePathname();
  
  // একটি কমন ফাংশন যা চেক করবে পাথ মিলছে কিনা
  const isActive = (path) => {
    if (path === '/' && pathname === '/') return "text-blue-600 font-bold";
    // সাব-রাউটসহ চেক করার জন্য (যেমন /kits/inventory এবং /kits/inventory/add)
    if (path !== '/' && pathname.startsWith(path)) return "text-blue-600 font-bold";
    return "text-gray-400 font-medium hover:text-blue-400";
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 shadow-sm sticky top-0 z-20 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link href={backUrl} className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
          )}
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        {!showBack && (
           <div className="h-9 w-9 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-extrabold shadow-sm border border-indigo-100">
             A
           </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        {children}
      </div>

      {/* Bottom Navigation */}
      {!showBack && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-between items-end px-2 py-2 pb-safe z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
          
          {/* 1. HOME */}
          <Link href="/" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isActive('/')}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px]">Home</span>
          </Link>
          
          {/* 2. HISTORY */}
          <Link href="/kits/history" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isActive('/kits/history')}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[10px]">History</span>
          </Link>

          {/* 3. DISTRIBUTE (Middle Button) */}
          <div className="relative -top-5">
            <Link href="/kits/distribute">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 border-4 border-slate-50 transform active:scale-95 transition-transform hover:shadow-xl hover:-translate-y-1">
                {/* QR Code Icon for Scanning */}
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 6h6v6H6V6zm12 0h-6v6h6V6zm-6 12H6v-6h6v6z" /></svg>
              </div>
            </Link>
          </div>

          {/* 4. INVENTORY */}
          <Link href="/kits/inventory" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isActive('/kits/inventory')}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span className="text-[10px]">Stock</span>
          </Link>

          {/* 5. PROFILE */}
          <Link href="/profile" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isActive('/profile')}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      )}
    </div>
  );
}