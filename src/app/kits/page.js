'use client';

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function KitsDashboard() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalDistributed: 0, totalStudents: 0, recentRecipients: [] });
  const [loading, setLoading] = useState(true);

  // ডাইনামিক আইকন ফাংশন
  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('bag')) return '🎒';
    if (n.includes('pen')) return '🖊️';
    if (n.includes('shirt') || n.includes('tshirt')) return '👕';
    if (n.includes('mug') || n.includes('cup')) return '☕';
    if (n.includes('cap') || n.includes('hat')) return '🧢';
    if (n.includes('badge') || n.includes('id')) return '🪪';
    if (n.includes('food') || n.includes('box')) return '🍱';
    return '📦'; 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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


      {/* 2. Stock Overview */}
      <div className="mb-8">
        <h3 className="text-gray-700 font-bold text-sm mb-3 px-1">Current Stock</h3>
        
        {loading ? (
            <div className="text-center py-6 text-gray-400">Loading stock...</div>
        ) : (
            <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
                const stock = getStockCount(item);
                const isLow = stock < 20;

                return (
                <div key={item._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-indigo-100 transition-colors">
                    <div className="text-3xl mb-2">{getIcon(item.name)}</div>
                    <h4 className="font-bold text-gray-800 text-sm truncate w-full">{item.name}</h4>
                    <p className={`text-xl font-extrabold mt-1 ${isLow ? 'text-red-500' : 'text-blue-600'}`}>
                    {stock} <span className="text-[10px] text-gray-400 font-normal">pcs</span>
                    </p>
                </div>
                );
            })}
            
            {/* Add Item Button */}
            <Link href="/kits/inventory" className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                <span className="text-2xl">+</span>
                <span className="text-xs font-bold mt-1">Add Item</span>
            </Link>
            </div>
        )}
      </div>

      {/* 3. Quick Actions */}
      <h3 className="text-gray-700 font-bold text-sm mb-4 px-1">Quick Actions</h3>
      <div className="space-y-4 mb-20">
        
        {/* Update Inventory */}
        <Link href="/kits/inventory" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-purple-300 group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
              <div>
                <h3 className="font-bold text-gray-800">Update Inventory</h3>
                <p className="text-xs text-gray-500">Edit stock numbers manually</p>
              </div>
            </div>
            {/* Arrow with Hover Effect */}
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

        {/* Start Distribution */}
        <Link href="/kits/distribute" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-green-300 group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎁</div>
              <div>
                <h3 className="font-bold text-gray-800">Start Distribution</h3>
                <p className="text-xs text-gray-500">Handout kits to members</p>
              </div>
            </div>
            {/* Arrow with Hover Effect */}
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-green-600 group-hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

        {/* Distribution History */}
        <Link href="/kits/history" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-blue-300 group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📜</div>
              <div>
                <h3 className="font-bold text-gray-800">Distribution History</h3>
                <p className="text-xs text-gray-500">See who received kits</p>
              </div>
            </div>
            {/* Arrow with Hover Effect */}
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

      </div>

    </MobileLayout>
  );
}



