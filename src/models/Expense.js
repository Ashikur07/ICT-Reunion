import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      // এই লাইনটা যোগ করলে ফর্ম থেকে তারিখ না দিলেও অটো আজকের তারিখ সেভ হবে
      default: Date.now, 
      required: [true, "Please provide a date"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    amount: {
      type: Number,
      required: [true, "Please provide an amount"],
    },
    paidBy: {
      type: String, 
      required: true, 
    },
    paidTo: {
      type: String, 
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank", "bKash", "Nagad", "Other"],
      default: "Cash",
    },
    bankName: {
      type: String, 
      default: "N/A",
    },
    notes: {
      type: String,
      default: "",
    },
    memoLink: {
      type: String, 
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);