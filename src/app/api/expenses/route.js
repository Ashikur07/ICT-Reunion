import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";

export async function GET() {
  await dbConnect();

  try {
    // তারিখ অনুযায়ী সর্ট করা (নতুন আগে)
    const expenses = await Expense.find({}).sort({ date: -1 });

    return NextResponse.json(expenses, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}