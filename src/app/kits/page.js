'use client';

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function KitsDashboard() {
  const [items, setItems] = useState([]);
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
    return '📦'; // ডিফল্ট
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/kits/items');
        const data = await res.json();
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // স্টক কাউন্ট করার হেল্পার
  const getStockCount = (item) => {
    if (item.category === 'General') return item.stock || 0;
    return Object.values(item.sizeStock || {}).reduce((a, b) => a + b, 0);
  };

  return (
    <MobileLayout title="Kit Manager">
      
      {/* 1. Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Distribution Hub</h1>
          <p className="text-blue-100 text-sm">Manage gifts & inventory.</p>
        </div>
        {/* Background Pattern */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11z"/></svg>
        </div>
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
                <div key={item._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">{getIcon(item.name)}</div>
                    <h4 className="font-bold text-gray-800 text-sm truncate w-full">{item.name}</h4>
                    <p className={`text-xl font-extrabold mt-1 ${isLow ? 'text-red-500' : 'text-blue-600'}`}>
                    {stock} <span className="text-[10px] text-gray-400 font-normal">pcs</span>
                    </p>
                </div>
                );
            })}
            
            {/* Add New Placeholder */}
            <Link href="/kits/inventory" className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                <span className="text-2xl">+</span>
                <span className="text-xs font-bold mt-1">Add Item</span>
            </Link>
            </div>
        )}
      </div>

      {/* 3. Actions (Updated with Arrows) */}
      <h3 className="text-gray-700 font-bold text-sm mb-4 px-1">Quick Actions</h3>
      <div className="space-y-4">
        
        <Link href="/kits/inventory" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Update Inventory</h3>
                <p className="text-xs text-gray-500">Edit stock numbers manually</p>
              </div>
            </div>
            {/* Arrow Icon */}
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

        <Link href="/kits/distribute" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
                🎁
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Start Distribution</h3>
                <p className="text-xs text-gray-500">Handout kits to members</p>
              </div>
            </div>
            {/* Arrow Icon */}
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

      </div>

    </MobileLayout>
  );
}