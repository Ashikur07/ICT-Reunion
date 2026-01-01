'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import Swal from 'sweetalert2'; 

export default function BatchDetails() {
  const params = useParams();
  const batchId = decodeURIComponent(params.id);
  
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = () => {
    fetch('/api/stats/details')
      .then(res => res.json())
      .then(data => {
        let filtered = [];
        if (batchId === 'External Sponsors') {
          filtered = data.filter(item => item.sourceType === 'EXTERNAL');
        } else {
          filtered = data.filter(item => item.batchName === batchId);
        }

        // 👇 DEBUG: কনসোলে ডাটা প্রিন্ট হবে, F12 চেপে Console চেক করুন
        console.log("Fetched Data Check:", filtered); 

        setDetails(filtered);
        setTotal(filtered.reduce((sum, item) => sum + item.amount, 0));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [batchId]);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${name}"? This cannot be undone.`,
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
        const res = await fetch(`/api/incomes/delete?id=${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          const newDetails = details.filter(item => item._id !== id);
          setDetails(newDetails);
          setTotal(newDetails.reduce((sum, item) => sum + item.amount, 0));
          
          Swal.fire({
            title: 'Deleted!',
            text: 'Record removed.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-3xl' }
          });
        } else {
          Swal.fire({ title: 'Error', text: 'Failed to delete.', icon: 'error', customClass: { popup: 'rounded-3xl' } });
        }
      } catch (error) {
        Swal.fire({ title: 'Error', text: 'Server error.', icon: 'error', customClass: { popup: 'rounded-3xl' } });
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <MobileLayout title={batchId} showBack={true}>
      
      {/* Header Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-lg shadow-blue-200 text-center mb-6 text-white">
        <p className="text-blue-100 text-xs uppercase tracking-widest font-bold">Total Collection</p>
        <h2 className="text-3xl font-extrabold mt-2">
          {loading ? '...' : `৳ ${total.toLocaleString()}`}
        </h2>
        <div className="mt-3 inline-block bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold border border-white/30">
          {details.length} Entries
        </div>
      </div>

      {/* Contributors List */}
      <div className="space-y-3 pb-10">
        <h3 className="text-gray-500 font-bold text-sm px-2 uppercase tracking-wide">Breakdown</h3>
        
        {loading ? (
           <div className="text-center py-10 text-gray-400">Loading details...</div>
        ) : (
          details.map((item, idx) => (
            <div key={idx} className={`relative group bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center transition-all ${
              item.name.toLowerCase().includes('total') ? 'border-orange-200 bg-orange-50' : 'border-gray-50'
            }`}>
              
              <div className="flex-1">
                <h4 className={`font-bold text-sm ${item.name.toLowerCase().includes('total') ? 'text-orange-700' : 'text-gray-800'}`}>
                  {item.name}
                </h4>
                
                {/* TAGS SECTION */}
                <div className="flex gap-2 mt-2 flex-wrap items-center">
                    {/* Payment Method */}
                    {item.paymentMethod && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                            {item.paymentMethod}
                        </span>
                    )}
                    
                    {/* Receipt No */}
                    {item.receiptNo && (
                        <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded border border-blue-100">
                            Rcpt: {item.receiptNo}
                        </span>
                    )}

                    {/* 👇 NEW: Account Info Logic (Checking multiple field names) */}
                    {(item.account || item.receivedBy || item.transferAccount || item.bankName) && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 001.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                            </svg>
                            {/* ডাটাবেসের ফিল্ড অনুযায়ী নাম শো করবে */}
                            {item.account || item.receivedBy || item.transferAccount || item.bankName}
                        </span>
                    )}
                </div>
              </div>

              <div className="text-right pl-4 flex flex-col items-end gap-1">
                <span className={`block font-bold ${item.name.toLowerCase().includes('total') ? 'text-orange-700' : 'text-gray-800'}`}>
                  ৳{item.amount.toLocaleString()}
                </span>
                
                {/* DELETE BUTTON */}
                <button 
                  onClick={() => handleDelete(item._id, item.name)}
                  disabled={deletingId === item._id}
                  className="mt-1 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition active:scale-90"
                >
                  {deletingId === item._id ? (
                    <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  )}
                </button>

              </div>

            </div>
          ))
        )}

        {!loading && details.length === 0 && (
            <div className="text-center text-gray-400 py-10">No records found.</div>
        )}
      </div>
    </MobileLayout>
  );
}