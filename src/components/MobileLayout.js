'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// এখানে backUrl যোগ করা হয়েছে (ডিফল্ট '/' বা হোম)
export default function MobileLayout({ children, title, showBack = false, backUrl = '/' }) {
  const pathname = usePathname();
  
  const isActive = (path) => pathname === path ? "text-blue-600 font-bold" : "text-gray-400 font-medium hover:text-blue-400";
  const isExpenseActive = () => pathname === '/expenses' ? "text-red-600 font-bold" : "text-gray-400 font-medium hover:text-red-400";
  const isKitsActive = () => pathname.startsWith('/kits') ? "text-blue-600 font-bold" : "text-gray-400 font-medium hover:text-blue-400";

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 shadow-sm sticky top-0 z-20 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          {showBack && (
            // ফিক্স: এখানে ডাইনামিক backUrl ব্যবহার করা হলো
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
          <Link href="/" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isActive('/')}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="text-[10px]">Home</span>
          </Link>
          
          <Link href="/batches" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isActive('/batches')}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <span className="text-[10px]">Income</span>
          </Link>

          <div className="relative -top-5">
            <Link href="/add">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 border-4 border-slate-50 transform active:scale-95 transition-transform hover:shadow-xl">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
            </Link>
          </div>

          <Link href="/expenses" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isExpenseActive()}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <span className="text-[10px]">Expense</span>
          </Link>

          <Link href="/kits" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${isKitsActive()}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span className="text-[10px]">Kits</span>
          </Link>
        </div>
      )}
    </div>
  );
}