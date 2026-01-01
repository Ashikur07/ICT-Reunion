import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";

export async function POST(req) {
  try {
    // ১. ডাটাবেস কানেক্ট করা
    await dbConnect();

    // ২. ফ্রন্টএন্ড থেকে পাঠানো ডাটা ধরা
    const body = await req.json();

    // ৩. নতুন খরচ তৈরি করা
    const newExpense = new Expense({
      date: body.date,
      category: body.category,
      description: body.description,
      amount: Number(body.amount), // নাম্বার হিসেবে সেভ হবে
      paidBy: body.paidBy,
      paidTo: body.paidTo,
      paymentMethod: body.paymentMethod,
      bankName: body.bankName,
      notes: body.notes,
      memoLink: body.memoLink,
    });

    // ৪. ডাটাবেসে সেভ করা
    await newExpense.save();

    return NextResponse.json(
      { message: "Expense added successfully", expense: newExpense }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Expense Add Error:", error);
    return NextResponse.json(
      { error: "Failed to add expense", details: error.message }, 
      { status: 500 }
    );
  }
}