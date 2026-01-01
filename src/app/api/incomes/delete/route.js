import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Income from "@/models/Income";

export async function DELETE(req) {
  await dbConnect();

  try {
    // URL থেকে আইডি নেওয়া (Example: /api/incomes/delete?id=123...)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // ডাটাবেস থেকে রিমুভ করা
    const deletedItem = await Income.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}