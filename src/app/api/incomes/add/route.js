import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Income from "@/models/Income";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    
    // ভ্যালিডেশন: নাম, এমাউন্ট এবং সোর্স টাইপ থাকতেই হবে
    if (!body.name || !body.amount || !body.sourceType) {
      return NextResponse.json(
        { error: "Name, Amount and Source Type are required" },
        { status: 400 }
      );
    }

    // ডাটাবেসে নতুন ইনকাম তৈরি করা
    const newIncome = await Income.create(body);

    return NextResponse.json({ success: true, data: newIncome }, { status: 201 });

  } catch (error) {
    console.error("Add Income Error:", error);
    return NextResponse.json(
      { error: "Failed to add income" }, 
      { status: 500 }
    );
  }
}