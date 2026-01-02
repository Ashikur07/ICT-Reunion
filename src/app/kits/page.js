'use client';

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function KitsDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ড্যাশবোর্ডের জন্য ডাটা ক্যালকুলেট করা
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/kits/items');
        const items = await res.json();

        let totalStockCount = 0;
        let lowStockCount = 0;

        items.forEach(item => {
          // ১. টোটাল স্টক হিসাব করা
          let currentItemStock = 0;
          if (item.category === 'General') {
            currentItemStock = item.stock || 0;
          } else {
            // Sized আইটেমের সব সাইজের যোগফল
            currentItemStock = Object.values(item.sizeStock || {}).reduce((a, b) => a + b, 0);
          }
          
          totalStockCount += currentItemStock;

          // ২. লো স্টক ওয়ার্নিং (যদি ২০ এর কম থাকে)
          if (currentItemStock < 20) {
            lowStockCount += 1;
          }
        });

        setStats({
          totalItems: items.length,
          totalStock: totalStockCount,
          lowStockItems: lowStockCount
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <MobileLayout title="Kit Manager">
      
      {/* 1. Hero / Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Distribution Hub</h1>
          <p className="text-blue-100 text-sm">Manage gifts, t-shirts & snacks.</p>
        </div>
        {/* Background Icon */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11z"/></svg>
        </div>
      </div>

      {/* 2. Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Unique Items</p>
          <p className="text-xl font-extrabold text-gray-800">{loading ? '-' : stats.totalItems}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Stock</p>
          <p className="text-xl font-extrabold text-blue-600">{loading ? '-' : stats.totalStock}</p>
        </div>
        <div className={`p-3 rounded-2xl shadow-sm border text-center ${stats.lowStockItems > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Low Stock</p>
          <p className={`text-xl font-extrabold ${stats.lowStockItems > 0 ? 'text-red-500' : 'text-gray-800'}`}>
            {loading ? '-' : stats.lowStockItems}
          </p>
        </div>
      </div>

      {/* 3. Main Actions (Navigation) */}
      <h3 className="text-gray-700 font-bold text-sm mb-4 px-1">Actions</h3>
      
      <div className="space-y-4">
        
        {/* Button: Inventory Manager */}
        <Link href="/kits/inventory" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-transform active:scale-95 group-hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Inventory</h3>
                <p className="text-xs text-gray-500">Add items, update stock & sizes</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

        {/* Button: Distribution Desk (Coming Soon) */}
        <Link href="/kits/distribution" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-transform active:scale-95 group-hover:border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
                🎁
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Distribution</h3>
                <p className="text-xs text-gray-500">Give kits to members</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

      </div>

      {/* 4. Quick Help / Note */}
      <div className="mt-8 bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Tip:</strong> Always update the inventory <em>before</em> starting distribution. Ensure T-Shirt sizes are counted correctly.
        </p>
      </div>

    </MobileLayout>
  );
}