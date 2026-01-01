'use client';

import { useEffect, useState } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState('batch');
  const [data, setData] = useState({ batchStats: [], topContributors: [], summary: { total: 0, external: 0 } });
  const [loading, setLoading] = useState(true);

  // Colorful Gradients Array
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
  ];

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(result => {
        // Fix Sorting (1, 2, 3...)
        const sortedBatches = result.batchStats.sort((a, b) => {
          const numA = parseInt(a._id.replace(/\D/g, '')) || 0;
          const numB = parseInt(b._id.replace(/\D/g, '')) || 0;
          return numA - numB;
        });
        
        setData({ ...result, batchStats: sortedBatches });
        setLoading(false);
      });
  }, []);

  return (
    <MobileLayout title="Collections">
      
      {/* 1. Header Card (Blue Gradient for Income) - NEW ADDITION */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-lg shadow-blue-200 text-center mb-6 text-white relative overflow-hidden">
        {/* Abstract Circle Design */}
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-indigo-900 opacity-10 rounded-full blur-xl"></div>

        <p className="text-blue-100 text-xs uppercase tracking-widest font-bold">Total Collection</p>
        <h2 className="text-3xl font-extrabold mt-2">
          {loading ? '...' : `৳ ${data.summary.total.toLocaleString()}`}
        </h2>
        <div className="mt-3 inline-block bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold border border-white/30">
          {/* Total entries count logic can be added here if available, currently showing "All Sources" */}
          All Sources
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white p-1 rounded-xl flex mb-6 shadow-sm border border-gray-100">
        <button 
          onClick={() => setActiveTab('batch')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'batch' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Batches
        </button>
        <button 
          onClick={() => setActiveTab('sponsor')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'sponsor' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Sponsors
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
           {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid gap-3 pb-24">
          {activeTab === 'batch' ? (
            // --- BATCH LIST ---
            data.batchStats.map((batch, idx) => {
              // Apply Gradient based on index
              const gradientClass = gradients[idx % gradients.length];

              return (
                <Link key={idx} href={`/batches/${batch._id}`}>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-95 transition-transform">
                    <div className="flex items-center gap-4">
                      {/* Colorful Icon */}
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-lg text-white shadow-md`}>
                        {batch._id.replace(/\D/g, '')}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-base">{batch._id}</h4>
                        <p className="text-xs text-gray-400 font-medium">Click for details</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800 text-lg">৳{batch.total.toLocaleString()}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            // --- SPONSOR LIST ---
            <Link href="/batches/External Sponsors">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex justify-between items-center active:scale-95 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      $
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">External Sponsors</h4>
                      <p className="text-xs text-gray-400">View all partners</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800 text-lg">৳{data.summary.external.toLocaleString()}</span>
                  </div>
               </div>
            </Link>
          )}
        </div>
      )}
    </MobileLayout>
  );
}