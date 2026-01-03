"use client";

import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import Swal from "sweetalert2";
import { useRole } from "@/hooks/useRole";

export default function InventoryPage() {
  const { isAdmin, canDistribute } = useRole();
  
  // ১. সব Hooks (useState) উপরে থাকবে
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "General",
    icon: "📦",
  });

  // ফাংশনগুলো হুকের মতো ব্যবহার না করলেও উপরে ডিফাইন করা ভালো
  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("bag")) return "🎒";
    if (n.includes("pen")) return "🖊️";
    if (n.includes("shirt") || n.includes("tshirt") || n.includes("polo"))
      return "👕";
    if (n.includes("jersey") || n.includes("fabric")) return "🎽";
    if (n.includes("mug") || n.includes("cup")) return "☕";
    if (n.includes("cap") || n.includes("hat")) return "🧢";
    if (n.includes("book") || n.includes("magazine") || n.includes("souvenir"))
      return "📔";
    if (n.includes("crest") || n.includes("gift") || n.includes("award"))
      return "🏆";
    if (n.includes("id") || n.includes("card")) return "🪪";
    return "📦";
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/kits/items");
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // ২. useEffect অবশ্যই return এর উপরে থাকতে হবে
  useEffect(() => {
    // যদি এক্সেস থাকে তবেই ফেচ করবে, নাহলে এরর এড়াতে শুধু লোডিং বন্ধ
    if (canDistribute) {
        fetchItems();
    } else {
        setLoading(false);
    }
  }, [canDistribute]); // canDistribute ডিপেন্ডেন্সি হিসেবে দিলাম

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/kits/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        setShowModal(false);
        setNewItem({ name: "", category: "General", icon: "📦" });
        fetchItems();
        Swal.fire({
          icon: "success",
          title: "Added!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStockChange = async (id, newAmount, size = null) => {
    if (!isAdmin) return;
    const updatedItems = items.map((item) => {
      if (item._id === id) {
        if (item.category === "General") {
          return { ...item, stock: parseInt(newAmount) || 0 };
        } else if (size) {
          return {
            ...item,
            sizeStock: { ...item.sizeStock, [size]: parseInt(newAmount) || 0 },
          };
        }
      }
      return item;
    });
    setItems(updatedItems);

    try {
      await fetch("/api/kits/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "set", amount: newAmount, size }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateStock = async (id, type, amount, size = null) => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/kits/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, amount, size }),
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  // ৩. এখন এক্সেস চেক করে Return করা যাবে (সব হুক ডিক্লেয়ার করার পর)
  if (canDistribute === false) {
    return (
      <MobileLayout title="Restricted">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 text-gray-400">
          <div className="text-6xl mb-4 bg-gray-100 p-6 rounded-full">🔒</div>
          <h2 className="text-xl font-bold text-gray-600 mb-2">Access Denied</h2>
          <p className="text-sm">Inventory data is restricted to authorized personnel only.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Inventory" showBack={true} backUrl="/kits">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-700 font-bold text-lg">Manage Stock</h2>

        {/* শুধুমাত্র এডমিন বাটন দেখবে */}
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform"
          >
            + Add Item
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4 pb-20">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3 border-b border-dashed border-gray-100 pb-3">
                <div className="text-2xl">{getIcon(item.name)}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.category === "Sized"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-green-100 text-green-600"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              {item.category === "General" ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <span className="text-sm font-bold text-gray-500">
                    Total Stock
                  </span>
                  <div className="flex items-center gap-2">
                    
                    {/* Admin হলে বাটন, না হলে শুধু টেক্সট */}
                    {isAdmin ? (
                        <>
                            <button
                            onClick={() => updateStock(item._id, "remove", 1)}
                            className="w-8 h-8 bg-white border rounded-lg text-red-500 shadow-sm active:scale-90"
                            >
                            -
                            </button>

                            <input
                            type="number"
                            value={item.stock}
                            onChange={(e) =>
                                handleStockChange(item._id, e.target.value)
                            }
                            className="w-16 h-8 text-center bg-white border border-gray-200 rounded-lg font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                            />

                            <button
                            onClick={() => updateStock(item._id, "add", 1)}
                            className="w-8 h-8 bg-blue-600 text-white rounded-lg shadow-sm active:scale-90"
                            >
                            +
                            </button>
                        </>
                    ) : (
                        <span className="text-xl font-bold text-gray-700 px-4">{item.stock}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                    <div
                      key={size}
                      className="bg-gray-50 p-2 rounded-lg flex flex-col items-center"
                    >
                      <span className="text-xs font-bold text-gray-400 mb-1">
                        Size {size}
                      </span>
                      <div className="flex items-center gap-1">
                        
                        {/* Admin হলে বাটন, না হলে শুধু টেক্সট */}
                        {isAdmin ? (
                            <>
                                <button
                                onClick={() =>
                                    updateStock(item._id, "remove", 1, size)
                                }
                                className="w-6 h-6 bg-white border rounded text-red-500 flex items-center justify-center active:scale-90"
                                >
                                -
                                </button>

                                <input
                                type="number"
                                value={item.sizeStock?.[size] || 0}
                                onChange={(e) =>
                                    handleStockChange(item._id, e.target.value, size)
                                }
                                className="w-10 h-6 text-center text-sm bg-white border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                                />

                                <button
                                onClick={() => updateStock(item._id, "add", 1, size)}
                                className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center active:scale-90"
                                >
                                +
                                </button>
                            </>
                        ) : (
                            <span className="font-bold text-gray-800 px-2">{item.sizeStock?.[size] || 0}</span>
                        )}
                        
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal - Only for Admin */}
      {isAdmin && showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Add New Item
            </h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bag, Pen"
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNewItem({ ...newItem, category: "General" })
                  }
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border ${
                    newItem.category === "General"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-500"
                  }`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setNewItem({ ...newItem, category: "Sized" })}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border ${
                    newItem.category === "Sized"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-500"
                  }`}
                >
                  Sized
                </button>
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
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}