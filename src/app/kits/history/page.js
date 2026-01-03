"use client";
import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import Swal from "sweetalert2"; // ⭐ SweetAlert2 ইম্পোর্ট
import { useRole } from "@/hooks/useRole";

export default function HistoryPage() {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState("distributed");
  const [items, setItems] = useState([]);
  const [historyData, setHistoryData] = useState({
    history: [],
    pagination: { page: 1, totalPages: 1 },
    stats: { distributedCount: 0, pendingCount: 0, sizes: {} },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState("");

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditingSize, setIsEditingSize] = useState(false);
  const [newSizeVal, setNewSizeVal] = useState("");

  // সেশন জেনারেটর
  const sessions = [];
  for (let i = 1998; i <= 2024; i++) {
    const nextYear = (i + 1).toString().slice(-2);
    sessions.push(`${i}-${nextYear}`);
  }
  sessions.reverse();

  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("bag")) return "🎒";
    if (n.includes("pen")) return "🖊️";
    if (n.includes("polo") || n.includes("tshirt") || n.includes("shirt"))
      return "👕";
    if (n.includes("jersey") || n.includes("fabric")) return "🎽";
    if (n.includes("mug") || n.includes("cup")) return "☕";
    if (n.includes("cap") || n.includes("hat")) return "🧢";
    if (n.includes("badge") || n.includes("id") || n.includes("card"))
      return "🪪";
    if (n.includes("food") || n.includes("box")) return "🍱";
    if (n.includes("souvenir") || n.includes("book")) return "📔";
    return "📦";
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, historyRes] = await Promise.all([
        fetch("/api/kits/items"),
        fetch(
          `/api/kits/history?page=${page}&limit=15&search=${search}&filter=${activeTab}&session=${selectedSession}`
        ),
      ]);
      const itemsData = await itemsRes.json();
      const hData = await historyRes.json();
      setItems(itemsData);
      setHistoryData(hData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAll();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, activeTab, selectedSession]);

  // --- ACTIONS ---

  // ১. Undo Distribution (with SweetAlert2)
  const handleUndo = async () => {
    // ⭐ ওয়ার্নিং পপআপ
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will revert the status to 'Pending' and return items to stock!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, return it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/kits/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "undo", id: selectedStudent._id }),
        });
        const data = await res.json();

        if (res.ok) {
          // সাকসেস মেসেজ
          Swal.fire({
            icon: "success",
            title: "Undo Successful!",
            text: "Kit returned to stock successfully.",
            timer: 1500,
            showConfirmButton: false,
          });
          setSelectedStudent(null);
          fetchAll(); // ডাটা রিফ্রেশ
        } else {
          Swal.fire("Error", data.error, "error");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  // ২. Update Size (with SweetAlert2)
  const handleUpdateSize = async () => {
    try {
      const res = await fetch("/api/kits/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_size",
          id: selectedStudent._id,
          newSize: newSizeVal,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        // UI তে লোডিং না দেখিয়ে সরাসরি আপডেট দেখানোর জন্য
        setSelectedStudent((prev) => ({ ...prev, tShirtSize: newSizeVal }));
        setIsEditingSize(false);

        // সাকসেস টোস্ট
        Swal.fire({
          icon: "success",
          title: "Size Updated!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        fetchAll();
      } else {
        Swal.fire("Error", data.error, "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Update failed!", "error");
    }
  };

  return (
    <MobileLayout title="History Log">
      {/* 1. Distributed Summary */}
      {activeTab === "distributed" && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-gray-700 font-bold text-sm mb-3 px-1">
            Distributed Items
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const isSized = item.category === "Sized";
              return (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-1">{getIcon(item.name)}</div>
                  <h4 className="font-bold text-gray-800 text-sm truncate w-full px-1">
                    {item.name}
                  </h4>
                  <p className="text-xl font-extrabold text-indigo-600">
                    {historyData.stats.distributedCount}{" "}
                    <span className="text-[10px] text-gray-400 font-normal">
                      sets
                    </span>
                  </p>
                  {isSized && (
                    <div className="absolute inset-0 bg-indigo-600/95 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs rounded-2xl cursor-help z-10">
                      <p className="font-bold mb-1 border-b border-white/20 pb-1 w-full">
                        Size Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
                        {Object.entries(historyData.stats.sizes || {}).map(
                          ([size, count]) => (
                            <span key={size}>
                              {size}: {count}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. List Area */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-1 min-h-[500px] relative flex flex-col">
        <div className="p-4 border-b border-gray-50 sticky top-0 bg-white z-10 rounded-t-[2rem] space-y-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("distributed");
                setPage(1);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === "distributed"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Distributed ({historyData.stats.distributedCount})
            </button>
            <button
              onClick={() => {
                setActiveTab("pending");
                setPage(1);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === "pending"
                  ? "bg-white text-red-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending ({historyData.stats.pendingCount})
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Name, Roll..."
                className="w-full bg-gray-50 text-gray-700 p-3 pl-10 rounded-xl border-none focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-gray-400 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 text-gray-700 p-3 rounded-xl border-none focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold w-28 appearance-none"
            >
              <option value="">All Batch</option>
              {sessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-2 space-y-2 pb-20 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Loading records...</p>
            </div>
          ) : historyData.history.length > 0 ? (
            historyData.history.map((record) => (
              <div
                key={record._id}
                onClick={() => {
                  setSelectedStudent(record);
                  setIsEditingSize(false);
                }}
                className="p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-indigo-100 group active:scale-[0.98]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                        activeTab === "distributed"
                          ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                          : "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                      }`}
                    >
                      {record.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm leading-tight">
                        {record.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-mono font-medium">
                          {record.roll}
                        </span>
                        <span className="text-[10px] text-indigo-500 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                          {record.session}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <svg
                      className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-400 text-sm">
              <p>No records found.</p>
            </div>
          )}
        </div>

        {/* Pagination Logic (Same as before) */}
        {historyData.pagination.totalPages > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex justify-between items-center rounded-b-[2rem]">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs font-medium text-gray-400">
              Page {page} / {historyData.pagination.totalPages}
            </span>
            <button
              disabled={page === historyData.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* --- UPDATED STUDENT DETAILS MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div
              className={`${
                selectedStudent.isUsed ? "bg-indigo-600" : "bg-red-500"
              } p-6 text-white text-center relative`}
            >
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div
                className={`w-16 h-16 bg-white ${
                  selectedStudent.isUsed ? "text-indigo-600" : "text-red-500"
                } rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-3 shadow-lg`}
              >
                {selectedStudent.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
              <p className="text-white/80 text-sm opacity-90">
                {selectedStudent.email || "No Email"}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Roll Number
                  </p>
                  <p className="text-gray-800 font-mono font-bold">
                    {selectedStudent.roll}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Session
                  </p>
                  <p className="text-gray-800 font-bold">
                    {selectedStudent.session}
                  </p>
                </div>
              </div>

              {/* Size Management Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👕</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      T-Shirt Size
                    </p>

                    {isEditingSize ? (
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={newSizeVal || selectedStudent.tShirtSize}
                          onChange={(e) => setNewSizeVal(e.target.value)}
                          className="bg-white border border-indigo-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-1"
                        >
                          {["S", "M", "L", "XL", "XXL", "XXXL"].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={handleUpdateSize}
                          className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                        >
                          ✓
                        </button>

                        <button
                          onClick={() => setIsEditingSize(false)}
                          className="bg-gray-300 text-gray-700 p-1 rounded hover:bg-gray-400"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-black text-gray-900">
                          {selectedStudent.tShirtSize}
                        </p>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setIsEditingSize(true);
                              setNewSizeVal(selectedStudent.tShirtSize);
                            }}
                            className="text-gray-400 hover:text-indigo-600 transition"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}

                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {selectedStudent.isUsed ? (
                    <span className="text-green-600 font-bold text-xs uppercase bg-green-100 px-2 py-1 rounded">
                      Received
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold text-xs uppercase bg-red-100 px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Undo Button (Only if Distributed) */}
              {selectedStudent.isUsed && isAdmin && (
                <button
                  onClick={handleUndo}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  Undo Distribution (Return Kit)
                </button>
              )}

              <div className="border-t border-gray-100 pt-4 mt-2">
                {selectedStudent.isUsed && (
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-500">Given At</span>
                    <span className="text-gray-800 font-medium">
                      {new Date(selectedStudent.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
