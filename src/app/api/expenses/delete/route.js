import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";

export async function DELETE(req) {
  try {
    await dbConnect();
    
    // URL থেকে ID বের করা (যেমন: ?id=12345)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await Expense.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}