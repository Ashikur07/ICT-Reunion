import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Income from "@/models/Income";

export async function GET() {
  await dbConnect();

  try {
    // আগে এখানে filter ছিল, এখন সব ডাটা পাঠাচ্ছি
    // Frontend এ গিয়ে ফিল্টার হবে ব্যাচ অনুযায়ী
    const data = await Income.find({}).sort({ amount: -1 });

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}