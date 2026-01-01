'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export default function AddExpenseForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], 
    category: 'General',
    customCategory: '', // নতুন ক্যাটাগরি লেখার জন্য
    description: '',
    amount: '',
    paidBy: 'Tarek Sir',
    paidTo: '',
    paymentMethod: 'Cash',
    bankName: '',
    notes: '',
    memoLink: ''
  });

  const [loading, setLoading] = useState(false);

  // ক্যাটাগরি লিস্টে 'Other' যোগ করা হয়েছে
  const categories = ["Flexi", "Snacks", "Decor", "Kits", "Paint", "Souvenir", "Colors", "Concert", "Transport", "General", "Other"];
  const paymentMethods = ["Cash", "Bank", "bKash", "Nagad"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ক্যাটাগরি লজিক: যদি 'Other' সিলেক্ট করে, তাহলে customCategory এর ভ্যালু নিবে
    const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;

    // ভ্যালিডেশন: Other সিলেক্ট করেছে কিন্তু কিছু লেখে নাই
    if (formData.category === 'Other' && !finalCategory.trim()) {
        Swal.fire({ title: 'Missing Info', text: 'Please type a category name.', icon: 'warning' });
        setLoading(false);
        return;
    }

    const payload = { ...formData, category: finalCategory }; // payload এ সঠিক ক্যাটাগরি বসানো হলো

    try {
      const res = await fetch('/api/expenses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          title: 'Added!',
          text: 'Expense record saved successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        // ফর্ম রিসেট
        setFormData({
            date: new Date().toISOString().split('T')[0],
            category: 'General',
            customCategory: '',
            description: '',
            amount: '',
            paidBy: 'Tarek Sir',
            paidTo: '',
            paymentMethod: 'Cash',
            bankName: '',
            notes: '',
            memoLink: ''
        });
      } else {
        Swal.fire({ title: 'Error', text: 'Failed to save expense.', icon: 'error' });
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Server Error', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
      
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-50 rounded-full text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800">New Expense</h2>
            <p className="text-xs text-gray-400">Record a new payment</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Row 1: Amount & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount</label>
            <input 
                type="number" 
                name="amount" 
                placeholder="0.00" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-lg text-gray-800" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
            <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
            />
          </div>
        </div>

        {/* Row 2: Category & Method */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Method</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
            </select>
          </div>
        </div>

        {/* 👇 NEW: Custom Category Input (Only shows if 'Other' is selected) */}
        {formData.category === 'Other' && (
            <div className="animate-fade-in-down">
                <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Type New Category</label>
                <input 
                    type="text" 
                    name="customCategory" 
                    placeholder="e.g. Printing, Gift" 
                    value={formData.customCategory} 
                    onChange={handleChange} 
                    required 
                    autoFocus
                    className="w-full p-3 bg-blue-50 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-blue-700" 
                />
            </div>
        )}

        {/* Row 3: Description */}
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
           <input 
            type="text" 
            name="description" 
            placeholder="What was this for?" 
            value={formData.description} 
            onChange={handleChange} 
            required 
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
           />
        </div>

        {/* Row 4: Persons (Paid By -> Paid To) */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
                <div className="w-[45%]">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Paid By</label>
                    <input type="text" name="paidBy" placeholder="Tarek Sir" value={formData.paidBy} onChange={handleChange} className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm" />
                </div>
                
                {/* Arrow Icon */}
                <div className="text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </div>

                <div className="w-[45%]">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Paid To</label>
                    <input type="text" name="paidTo" placeholder="Recipient" value={formData.paidTo} onChange={handleChange} className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm" />
                </div>
            </div>
        </div>

        {/* Advanced / Optional Fields */}
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bank Name</label>
                <input type="text" name="bankName" placeholder="N/A" value={formData.bankName} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Memo Link</label>
                <input type="url" name="memoLink" placeholder="Google Drive Link" value={formData.memoLink} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-blue-500" />
             </div>
        </div>

        {/* Submit Button */}
        <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
             </>
          ) : (
             <>
                <span>Confirm Expense</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
             </>
          )}
        </button>

      </form>
    </div>
  );
}