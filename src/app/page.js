'use client';

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalDistributed: 0, totalStudents: 0, recentRecipients: [] });
  const [loading, setLoading] = useState(true);
  
  // মোডাল হ্যান্ডেল করার জন্য স্টেট
  const [selectedItem, setSelectedItem] = useState(null);

  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('bag')) return '🎒';
    if (n.includes('pen')) return '🖊️';
    if (n.includes('shirt') || n.includes('tshirt') || n.includes('polo')) return '👕';
    if (n.includes('jersey') || n.includes('fabric')) return '🎽';
    if (n.includes('mug') || n.includes('cup')) return '☕';
    if (n.includes('cap') || n.includes('hat')) return '🧢';
    if (n.includes('badge') || n.includes('id') || n.includes('card')) return '🪪';
    if (n.includes('food') || n.includes('box')) return '🍱';
    if (n.includes('souvenir') || n.includes('book')) return '📔';
    if (n.includes('crest') || n.includes('gift') || n.includes('award')) return '🏆';
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

   const progress = stats.totalStudents > 0 
   ? Math.round((stats.totalDistributed / stats.totalStudents) * 100) 
   : 0;

  return (
    <MobileLayout title="Kit Manager">
      
       {/* 1. Header & Stats Card */}
       <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Total Distributed</p>
            <h1 className="text-4xl font-bold">{stats.totalDistributed} <span className="text-lg text-indigo-300 font-normal">/ {stats.totalStudents}</span></h1>
            
            <div className="mt-4 bg-indigo-900/50 h-2 rounded-full overflow-hidden w-48">
                <div className="bg-green-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-indigo-300 mt-1">{progress}% Completed</p>
          </div>
          
          <div className="text-right">
             <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm animate-pulse">
                📈
             </div>
          </div>
        </div>
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
                const isSized = item.category === 'Sized';

                return (
                <div 
                    key={item._id} 
                    // শুধুমাত্র Sized আইটেমে ক্লিক করলে মোডাল ওপেন হবে
                    onClick={() => isSized && setSelectedItem(item)}
                    className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md relative group
                        ${isSized ? 'cursor-pointer hover:border-indigo-300 active:scale-95' : ''}
                    `}
                >
                    {/* Sized আইটেমের জন্য ইন্ডিকেটর */}
                    {isSized && (
                        <div className="absolute top-2 right-2 text-indigo-200 group-hover:text-indigo-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}

                    <div className="text-3xl mb-2">{getIcon(item.name)}</div>
                    <h4 className="font-bold text-gray-800 text-sm truncate w-full px-1" title={item.name}>{item.name}</h4>
                    <p className={`text-xl font-extrabold mt-1 ${isLow ? 'text-red-500' : 'text-blue-600'}`}>
                        {stock} <span className="text-[10px] text-gray-400 font-normal">pcs</span>
                    </p>
                    
                    {/* Sized হলে নিচে ছোট্ট টেক্সট */}
                    {isSized && <p className="text-[10px] text-gray-400 mt-1">Tap for sizes</p>}
                </div>
                );
            })}
            
            <Link href="/kits/inventory" className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all active:scale-95">
                <span className="text-2xl">+</span>
                <span className="text-xs font-bold mt-1">Add Item</span>
            </Link>
            </div>
        )}
      </div>

      {/* 3. Quick Actions */}
      <h3 className="text-gray-700 font-bold text-sm mb-4 px-1">Quick Actions</h3>
      <div className="space-y-4 mb-20">
        
        <Link href="/kits/inventory" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-purple-300 group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
              <div>
                <h3 className="font-bold text-gray-800">Update Inventory</h3>
                <p className="text-xs text-gray-500">Edit stock numbers manually</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

        <Link href="/kits/distribute" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-green-300 group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎁</div>
              <div>
                <h3 className="font-bold text-gray-800">Start Distribution</h3>
                <p className="text-xs text-gray-500">Handout kits to members</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-green-600 group-hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

        <Link href="/kits/history" className="block group">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform group-hover:border-blue-300 group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📜</div>
              <div>
                <h3 className="font-bold text-gray-800">Distribution History</h3>
                <p className="text-xs text-gray-500">See who received kits</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>
      </div>

      {/* --- STOCK DETAILS MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}></div>
            
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white text-center relative">
                    <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-1 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="w-16 h-16 bg-white text-indigo-600 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg mb-3">
                        {getIcon(selectedItem.name)}
                    </div>
                    <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                    <p className="text-indigo-200 text-sm">Stock Breakdown</p>
                </div>

                {/* Body: Size Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(selectedItem.sizeStock || {}).map(([size, count]) => (
                            <div key={size} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-500 text-sm">Size {size}</span>
                                <span className={`font-mono font-bold text-lg ${count < 10 ? 'text-red-500' : 'text-gray-800'}`}>
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Total Stock</span>
                        <span className="text-2xl font-bold text-indigo-600">{getStockCount(selectedItem)}</span>
                    </div>

                    <button onClick={() => setSelectedItem(null)} className="w-full mt-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

    </MobileLayout>
  );
}