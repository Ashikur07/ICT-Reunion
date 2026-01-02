'use client';
import { useState, useRef, useEffect } from 'react';

export default function DistributePage() {
  const [inputTicket, setInputTicket] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const inputRef = useRef(null);

  // অটো ফোকাস রাখার জন্য (বারকোড স্ক্যানারের জন্য ভালো)
  useEffect(() => {
    inputRef.current?.focus();
  }, [ticketData, isModalOpen]);

  // ১. টিকেট চেক করা
  const checkTicket = async (e) => {
    e?.preventDefault();
    if (!inputTicket) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setTicketData(null);

    try {
      const res = await fetch(`/api/distribute?ticketNumber=${inputTicket}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setTicketData(data);
      setIsModalOpen(true); // ডাটা পেলে মোডাল ওপেন হবে
    } catch (err) {
      setError(err.message);
      // ভুল হলে ইনপুট ক্লিয়ার করে আবার ফোকাস দেওয়া
      setTimeout(() => {
        setInputTicket('');
        inputRef.current?.focus();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // ২. কনফার্ম এবং ইনভেন্টরি আপডেট
  const confirmDistribute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNumber: ticketData.ticketNumber }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`🎉 ${ticketData.name}-কে কিট দেওয়া সম্পন্ন হয়েছে!`);
      setIsModalOpen(false); // মোডাল বন্ধ
      setInputTicket(''); // ইনপুট রিসেট
      setTicketData(null);
      
      // ৩ সেকেন্ড পর সাকসেস মেসেজ গায়েব
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err) {
      alert(err.message); // মোডালের উপর এলার্ট
    } finally {
      setLoading(false);
      // আবার নতুন স্ক্যান করার জন্য রেডি
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ক্যানসেল করলে
  const handleCancel = () => {
    setIsModalOpen(false);
    setInputTicket('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📦 Kit Distribution Point</h1>

      {/* Input Section */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <label className="block text-gray-600 font-semibold mb-2 text-center">
          Scan QR Code or Enter Ticket Number
        </label>
        
        <form onSubmit={checkTicket} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputTicket}
            onChange={(e) => setInputTicket(e.target.value)}
            placeholder="Ex: 2300"
            className="w-full px-4 py-3 text-lg border-2 border-dashed border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-0 outline-none text-center tracking-widest font-mono uppercase transition-all"
            autoFocus
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Go'}
          </button>
        </form>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center animate-pulse">
            ❌ {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center font-bold text-lg">
            {successMsg}
          </div>
        )}
      </div>

      {/* --- CONFIRMATION POPUP MODAL --- */}
      {isModalOpen && ticketData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className={`p-6 text-center ${ticketData.isUsed ? 'bg-red-50' : 'bg-indigo-50'}`}>
              <h2 className={`text-2xl font-bold ${ticketData.isUsed ? 'text-red-600' : 'text-indigo-800'}`}>
                {ticketData.isUsed ? '⚠️ Already Distributed!' : 'Student Details Found'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Ticket No: <span className="font-mono font-bold">{ticketData.ticketNumber}</span></p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Name</span>
                <span className="font-bold text-gray-800 text-lg">{ticketData.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Roll No</span>
                <span className="font-mono font-bold text-gray-800">{ticketData.roll}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Session</span>
                <span className="font-bold text-gray-800">{ticketData.session}</span>
              </div>
              
              {/* T-Shirt Highlight */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👕</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Requested Size</p>
                    <p className="text-xl font-black text-gray-800">{ticketData.tShirtSize}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${ticketData.isUsed ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                    {ticketData.isUsed ? 'DELIVERED' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer (Buttons) */}
            <div className="p-4 bg-gray-50 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
              >
                Cancel / Close
              </button>
              
              {!ticketData.isUsed && (
                <button
                  onClick={confirmDistribute}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition flex justify-center items-center gap-2"
                >
                  {loading ? 'Processing...' : '✅ Confirm & Distribute'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}