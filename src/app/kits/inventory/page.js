'use client';

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import Swal from 'sweetalert2';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // নতুন আইটেম ফর্মের স্টেট
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'General', // or 'Sized'
    icon: '📦'
  });

  // ১. সব আইটেম লোড করা
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/kits/items');
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ২. নতুন আইটেম অ্যাড করা
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kits/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        setShowModal(false);
        setNewItem({ name: '', category: 'General', icon: '📦' });
        fetchItems(); // লিস্ট রিফ্রেশ
        Swal.fire('Success', 'New item added!', 'success');
      } else {
        Swal.fire('Error', 'Failed to add item', 'error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ৩. স্টক আপডেট করা (বাড়ানো বা কমানো)
  const updateStock = async (id, type, amount, size = null) => {
    // type = 'add' or 'remove'
    try {
      const res = await fetch('/api/kits/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, amount, size }),
      });

      if (res.ok) {
        fetchItems(); // ডাটা রিফ্রেশ
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MobileLayout title="Kit Inventory">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-700 font-bold text-lg">Stock Manager</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform"
        >
          + Add Item
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading inventory...</div>
      ) : (
        <div className="space-y-4 pb-20">
          {items.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-3 border-b border-dashed border-gray-100 pb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.category === 'Sized' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Stock Controls */}
              {item.category === 'General' ? (
                // --- General Item (Simple Counter) ---
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <span className="text-sm font-bold text-gray-500">Total Stock</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => updateStock(item._id, 'remove', 1)} className="w-8 h-8 bg-white border rounded-full flex items-center justify-center text-red-500 font-bold shadow-sm active:scale-90">-</button>
                    <span className="text-xl font-bold text-gray-800 w-8 text-center">{item.stock}</span>
                    <button onClick={() => updateStock(item._id, 'add', 1)} className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md active:scale-90">+</button>
                  </div>
                </div>
              ) : (
                // --- Sized Item (Multiple Counters) ---
                <div className="grid grid-cols-2 gap-2">
                  {['M', 'L', 'XL', 'XXL'].map((size) => (
                    <div key={size} className="bg-gray-50 p-2 rounded-lg flex flex-col items-center">
                      <span className="text-xs font-bold text-gray-400 mb-1">Size {size}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStock(item._id, 'remove', 1, size)} className="w-6 h-6 bg-white border rounded text-red-500 flex items-center justify-center text-xs">-</button>
                        <span className="font-bold text-gray-800 min-w-[20px] text-center">{item.sizeStock?.[size] || 0}</span>
                        <button onClick={() => updateStock(item._id, 'add', 1, size)} className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No items found. Add your first kit item!
            </div>
          )}
        </div>
      )}

      {/* --- Add Item Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Item</h3>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. T-Shirt, Pen"
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewItem({...newItem, category: 'General'})}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border ${newItem.category === 'General' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}
                  >
                    General
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewItem({...newItem, category: 'Sized'})}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border ${newItem.category === 'Sized' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}
                  >
                    Sized (T-Shirt)
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  * General for Pen, Mug. Sized for T-shirts (M, L, XL...).
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </MobileLayout>
  );
}