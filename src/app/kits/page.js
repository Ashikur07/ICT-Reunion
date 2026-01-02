'use client';

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function KitsDashboard() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalDistributed: 0, totalStudents: 0, recentRecipients: [] });
  const [loading, setLoading] = useState(true);

  // আইকন হেল্পার
  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('bag')) return '🎒';
    if (n.includes('pen')) return '🖊️';
    if (n.includes('shirt')) return '👕';
    if (n.includes('mug')) return '☕';
    return '📦';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // দুটি API প্যারালাল কল করছি যাতে ফাস্ট হয়
        const [itemsRes, statsRes] = await Promise.all([
            fetch('/api/kits/items'),
            fetch('/api/kits/stats')
        ]);

        const itemsData = await itemsRes.json();
        const statsData = await statsRes.json();

        setItems(itemsData);
        setStats(statsData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStockCount = (item) => {
    if (item.category === 'General') return item.stock || 0;
    return Object.values(item.sizeStock || {}).reduce((a, b) => a + b, 0);
  };

  // পার্সেন্টেজ হিসাব
  const progress = stats.totalStudents > 0 
    ? Math.round((stats.totalDistributed / stats.totalStudents) * 100) 
    : 0;

  return (
    <MobileLayout title="Kit Manager">
      
      {/* 1. Header & Stats Card (NEW DESIGN) */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 mb-6 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Total Distributed</p>
            <h1 className="text-4xl font-bold">{stats.totalDistributed} <span className="text-lg text-indigo-300 font-normal">/ {stats.totalStudents}</span></h1>
            
            {/* Progress Bar */}
            <div className="mt-4 w-full bg-indigo-900/50 h-2 rounded-full overflow-hidden w-48">
                <div className="bg-green-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-indigo-300 mt-1">{progress}% Completed</p>
          </div>
          
          <div className="text-right">
             <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                📈
             </div>
          </div>
        </div>
        
        {/* Decorative Circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* 2. Quick Links (History Added) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         <Link href="/kits/distribute" className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
            <span className="text-3xl mb-1">🎁</span>
            <span className="font-bold text-green-800 text-sm">Distribute Now</span>
         </Link>

         <Link href="/kits/history" className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
            <span className="text-3xl mb-1">📜</span>
            <span className="font-bold text-blue-800 text-sm">View History</span>
         </Link>
      </div>

      {/* 3. Recent Activity (NEW) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-gray-700 font-bold text-sm">Just Distributed</h3>
            <Link href="/kits/history" className="text-xs text-blue-600 font-semibold">See All</Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {stats.recentRecipients.length > 0 ? (
                stats.recentRecipients.map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">Roll: {student.roll}</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                            Size: {student.tShirtSize}
                        </span>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-gray-400 text-sm">No activity yet.</div>
            )}
        </div>
      </div>

      {/* 4. Inventory Stock */}
      <div className="mb-20">
        <div className="flex justify-between items-center mb-3 px-1">
             <h3 className="text-gray-700 font-bold text-sm">Inventory Status</h3>
             <Link href="/kits/inventory" className="text-xs text-blue-600 font-semibold">Manage</Link>
        </div>
        
        {loading ? (
            <div className="text-center py-6 text-gray-400">Loading stock...</div>
        ) : (
            <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
                const stock = getStockCount(item);
                const isLow = stock < 20;

                return (
                <div key={item._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">{getIcon(item.name)}</div>
                    <h4 className="font-bold text-gray-800 text-sm truncate w-full">{item.name}</h4>
                    <p className={`text-xl font-extrabold mt-1 ${isLow ? 'text-red-500' : 'text-blue-600'}`}>
                    {stock} <span className="text-[10px] text-gray-400 font-normal">pcs</span>
                    </p>
                </div>
                );
            })}
            </div>
        )}
      </div>

    </MobileLayout>
  );
}