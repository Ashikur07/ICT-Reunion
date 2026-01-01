'use client';

import { useEffect, useState } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  
  // 👇 নতুন স্টেট: সিলেক্ট করা খরচের ডিটেইলস রাখার জন্য
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchData = () => {
    fetch('/api/expenses')
      .then(res => res.json())
      .then(data => {
        setExpenses(data);
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalExpense(total);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 🛑 লিস্টে ক্লিক করা আটকাবে

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-4 py-2 font-bold',
        cancelButton: 'rounded-xl px-4 py-2 font-bold'
      }
    });

    if (result.isConfirmed) {
      setDeletingId(id);
      try {
        const res = await fetch(`/api/expenses/delete?id=${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          const newList = expenses.filter(item => item._id !== id);
          setExpenses(newList);
          setTotalExpense(newList.reduce((sum, item) => sum + item.amount, 0));
          
          // যদি ওপেন করা মডালের আইটেম ডিলিট হয়, মডাল বন্ধ হবে
          if(selectedExpense?._id === id) setSelectedExpense(null);

          Swal.fire({
            title: 'Deleted!',
            text: 'Expense has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-3xl' }
          });
        } else {
          Swal.fire({ title: 'Error', text: 'Failed to delete.', icon: 'error' });
        }
      } catch (error) {
        Swal.fire({ title: 'Error', text: 'Server Error', icon: 'error' });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  return (
    <MobileLayout title="All Expenses" showBack={false}>
      
      {/* 1. Header Card */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-3xl shadow-lg shadow-red-200 text-center mb-6 text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-rose-900 opacity-10 rounded-full blur-xl"></div>

        <p className="text-red-100 text-xs uppercase tracking-widest font-bold">Total Spent</p>
        <h2 className="text-3xl font-extrabold mt-2">
          {loading ? '...' : `৳ ${totalExpense.toLocaleString()}`}
        </h2>
        <div className="mt-3 inline-block bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold border border-white/30">
          {expenses.length} Records
        </div>
      </div>

      {/* 2. Expense List */}
      <div className="space-y-3 pb-24">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide">Expense History</h3>
            <Link href="/add" className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 active:scale-95 transition-transform">
                + Add New
            </Link>
        </div>
        
        {loading ? (
           <div className="text-center py-10 text-gray-400 animate-pulse">Loading expenses...</div>
        ) : (
          expenses.map((item, idx) => (
            <div 
                key={idx} 
                onClick={() => setSelectedExpense(item)} // 👈 ক্লিক করলে মডাল ওপেন হবে
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start transition-all hover:bg-gray-50 active:scale-[0.98] cursor-pointer group"
            >
              
              {/* Left Side */}
              <div className="flex gap-3 items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-lg shrink-0">
                  {item.category.charAt(0)}
                </div>
                
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{item.category}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                  
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded whitespace-nowrap">
                       {formatDate(item.date)}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded whitespace-nowrap">
                       To: {item.paidTo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="text-right pl-2 flex flex-col items-end">
                <span className="block font-bold text-red-600 text-sm whitespace-nowrap">
                  -৳{item.amount.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 font-medium mb-1">
                  {item.paymentMethod}
                </span>

                <div className="flex gap-2 items-center mt-1">
                    {/* Memo Link */}
                    {item.memoLink && (
                        <a 
                            href={item.memoLink} 
                            target="_blank" 
                            onClick={(e) => e.stopPropagation()} // 🛑 মডাল আটকাবে
                            className="text-blue-500 hover:text-blue-700 p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                        </a>
                    )}
                    
                    {/* Delete Button */}
                    <button 
                        onClick={(e) => handleDelete(e, item._id)} // 🛑 মডাল আটকাবে
                        disabled={deletingId === item._id}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                        {deletingId === item._id ? (
                             <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        )}
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 👇 3. EXPENSE DETAILS MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up">
                
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedExpense(null)}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Modal Header */}
                <div className="bg-red-50 p-6 text-center border-b border-red-100">
                    <p className="text-red-500 font-bold text-xs uppercase tracking-wider mb-1">Expense Details</p>
                    <h2 className="text-3xl font-extrabold text-gray-800">৳{selectedExpense.amount.toLocaleString()}</h2>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-500 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {selectedExpense.category}
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    
                    {/* Row: Date & Method */}
                    <div className="flex justify-between border-b border-gray-50 pb-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                            <p className="text-sm font-bold text-gray-700">{formatDate(selectedExpense.date)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Payment Via</p>
                            <p className="text-sm font-bold text-gray-700">{selectedExpense.paymentMethod}</p>
                        </div>
                    </div>

                    {/* Flow: Paid By -> Paid To */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between relative">
                            <div className="w-[45%]">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">From</p>
                                <p className="text-xs font-bold text-gray-800 truncate">{selectedExpense.paidBy}</p>
                            </div>
                            
                            {/* Arrow */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-sm text-gray-400 border border-gray-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>

                            <div className="w-[45%] text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">To</p>
                                <p className="text-xs font-bold text-gray-800 truncate">{selectedExpense.paidTo}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description & Bank */}
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Description</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-1">{selectedExpense.description}</p>
                        </div>
                        
                        {selectedExpense.bankName !== 'N/A' && (
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Bank Info</p>
                                <p className="text-sm font-medium text-gray-700">{selectedExpense.bankName}</p>
                            </div>
                        )}
                        
                        {selectedExpense.notes && (
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Notes</p>
                                <p className="text-xs text-gray-500 italic">"{selectedExpense.notes}"</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {selectedExpense.memoLink && (
                        <a 
                            href={selectedExpense.memoLink} 
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            View Memo / Receipt
                        </a>
                    )}

                </div>
            </div>
        </div>
      )}

    </MobileLayout>
  );
}