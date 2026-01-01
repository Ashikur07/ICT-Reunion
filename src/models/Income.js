import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema({
  // ১. সোর্স টাইপ (মেইন ক্যাটাগরি - যা দিয়ে আমরা ফিল্টার করবো)
  sourceType: {
    type: String,
    enum: ["BATCH", "EXTERNAL", "REGISTRATION"], 
    required: true,
  },

  // ২. কমন ফিল্ড (সবার জন্য)
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: "Cash" },
  receivedBy: { type: String },
  receiptNo: { type: String },

  // ৩. ব্যাচ কালেকশন স্পেশাল
  currentResidence: { type: String }, 
  batchName: { type: String },

  // ৪. এক্সটার্নাল স্পন্সর স্পেশাল
  reference: { type: String },

  // ৫. রেজিস্ট্রেশন স্পেশাল
  regSource: { type: String }, 
  
  date: { type: Date, default: Date.now },
}, { timestamps: true });

// যদি মডেল অলরেডি কম্পাইল করা থাকে সেটা ইউজ করবে, না থাকলে নতুন বানাবে
export default mongoose.models.Income || mongoose.model("Income", IncomeSchema);