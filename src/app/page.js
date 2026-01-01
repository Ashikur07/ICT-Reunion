'use client';

import { useEffect, useState } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    recentTransactions: [],
    topContributors: [],
    fundSource: []
  });

  useEffect(() => {
    // একসাথে Income এবং Expense ডাটা লোড করছি
    const loadDashboardData = async () => {
      try {
        const [statsRes, expenseRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/expenses')
        ]);

        const statsData = await statsRes.json();
        const expenseData = await expenseRes.json();

        // 1. Calculate Totals
        const totalIncome = statsData.summary.total || 0;
        const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
        const netBalance = totalIncome - totalExpense;

        // 2. Merge & Sort Recent Activity (Income + Expense)
        // Income ডাটা আসছে statsData.recentActivity থেকে
        const incomes = (statsData.recentActivity || []).map(item => ({ ...item, type: 'INCOME' }));
        
        // Expense ডাটা আসছে expenseData থেকে (পুরোটা বা লেটেস্ট ১০টা)
        const expenses = expenseData.map(item => ({
          _id: item._id,
          name: item.category, // খরচের ক্যাটাগরিই নাম হিসেবে দেখাবো
          amount: item.amount,
          date: item.date,
          sourceType: item.paymentMethod, // মেথডটা সোর্স হিসেবে
          description: item.description,
          type: 'EXPENSE'
        }));

        // দুইটা অ্যারে মার্জ করে ডেট অনুযায়ী সর্ট (Latest First)
        const combinedActivity = [...incomes, ...expenses]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10); // টপ ১০টা দেখাবো

        setDashboard({
          income: totalIncome,
          expense: totalExpense,
          balance: netBalance,
          recentTransactions: combinedActivity,
          topContributors: statsData.topContributors || [],
          fundSource: [
            { name: 'Income', value: totalIncome, color: '#10B981' }, // Green
            { name: 'Expense', value: totalExpense, color: '#EF4444' }  // Red
          ]
        });

        setLoading(false);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return (
    <MobileLayout title="Dashboard">
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Calculating Net Worth...</p>
      </div>
    </MobileLayout>
  );

  return (
    <MobileLayout title="Overview">
      
      {/* 1. Net Balance Card (New Design) */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 overflow-hidden mb-6">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>

        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Net Balance</p>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            ৳ {dashboard.balance.toLocaleString()}
          </h1>

          {/* Income vs Expense Pills */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/10 flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
               </div>
               <div>
                 <p className="text-[10px] text-slate-400">Income</p>
                 <p className="text-sm font-bold text-green-400">৳{dashboard.income.toLocaleString()}</p>
               </div>
            </div>

            <div className="flex-1 bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/10 flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
               </div>
               <div>
                 <p className="text-[10px] text-slate-400">Expense</p>
                 <p className="text-sm font-bold text-red-400">৳{dashboard.expense.toLocaleString()}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/add" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-transform active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span className="font-bold text-sm">Add Income</span>
        </Link>
        <Link href="/add" className="bg-white hover:bg-red-50 text-red-500 border border-red-100 p-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          <span className="font-bold text-sm">Add Expense</span>
        </Link>
      </div>

      {/* 3. Cash Flow Chart (FIXED SIZE) */}
      <div className="mb-8 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wide mb-4">Cash Flow Ratio</h3>
        <div className="flex items-center">
          {/* Chart Container Fix */}
          <div className="w-1/2 h-48 min-h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.fundSource}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dashboard.fundSource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `৳ ${value.toLocaleString()}`} contentStyle={{borderRadius: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-1/2 space-y-3 pl-4">
             {dashboard.fundSource.map((item, idx) => (
                <div key={idx}>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-xs font-bold text-gray-600">{item.name}</span>
                   </div>
                   <div className="text-sm font-bold text-gray-800">
                     {((item.value / ((dashboard.income + dashboard.expense) || 1)) * 100).toFixed(0)}%
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-gray-800 font-bold text-lg">Recent Activity</h3>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2">
          {dashboard.recentTransactions.length > 0 ? (
            dashboard.recentTransactions.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-b last:border-0 border-gray-50 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  {/* Icon Logic Based on Type */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.type === 'INCOME' 
                      ? (item.sourceType === 'BATCH' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600')
                      : 'bg-red-50 text-red-500'
                  }`}>
                      {item.type === 'INCOME' 
                        ? (item.sourceType === 'BATCH' ? 'B' : 'S') 
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      }
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Just now'} 
                      {' • '} 
                      <span className={`${
                          item.type === 'INCOME' 
                            ? (item.sourceType === 'BATCH' ? 'text-blue-500' : 'text-green-500')
                            : 'text-red-400'
                      }`}>
                        {item.type === 'INCOME' 
                            ? (item.sourceType === 'BATCH' ? item.batchName : 'Sponsor') 
                            : item.sourceType}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold text-sm block ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'INCOME' ? '+' : '-'}৳{item.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {item.type === 'INCOME' ? 'Received' : 'Spent'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 text-xs">
              No recent transactions found.
            </div>
          )}
        </div>
      </div>

      {/* 5. Top Contributors */}
      <div className="mb-20">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-gray-800 font-bold text-lg">Top Heroes</h3>
          <Link href="/batches" className="text-blue-600 text-xs font-bold">View All</Link>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2">
          {dashboard.topContributors.map((person, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  idx === 1 ? 'bg-gray-100 text-gray-700' : 
                  idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{person.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">
                    {person.sourceType === 'BATCH' ? person.batchName : 'External Sponsor'}
                  </p>
                </div>
              </div>
              <span className="font-bold text-gray-800 text-sm">৳{person.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

    </MobileLayout>
  );
}