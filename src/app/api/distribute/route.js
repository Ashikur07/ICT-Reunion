import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitItem from '@/models/KitItem';
import Ticket from '@/models/Ticket'; // তোমার 'tickets' কালেকশন ওয়ালা মডেল

// ডাটাবেস কানেকশন (তোমার হেল্পার থাকলে সেটা ইমপোর্ট করো)
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

// 1. টিকেট ইনফো চেক করার জন্য (Lookup)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get('ticketNumber');

    if (!ticketNumber) {
      return NextResponse.json({ error: 'Ticket number required' }, { status: 400 });
    }

    const ticket = await Ticket.findOne({ ticketNumber });

    if (!ticket) {
      return NextResponse.json({ error: 'টিকেট পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ডিস্ট্রিবিউশন কনফার্ম করার জন্য (Inventory Update)
export async function POST(request) {
  try {
    await connectDB();
    const { ticketNumber } = await request.json();

    // ১. টিকেট আবার চেক করা
    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.isUsed) return NextResponse.json({ error: 'এই টিকেট ইতিমধ্যে ব্যবহার করা হয়েছে!' }, { status: 400 });

    // ২. ইনভেন্টরি আপডেট লজিক
    
    // A. Tshirt (Sized) কমানো
    const tshirtSize = ticket.tShirtSize; // টিকেটে যে সাইজ আছে (যেমন: 'L')
    const sizeField = `sizeStock.${tshirtSize}`;

    // Sized আইটেম (Tshirt) আপডেট
    const tshirtUpdate = await KitItem.updateOne(
      { category: 'Sized', [sizeField]: { $gt: 0 } }, // স্টক ০ এর বেশি থাকলেই কমবে
      { $inc: { [sizeField]: -1 } }
    );

    if (tshirtUpdate.modifiedCount === 0) {
      return NextResponse.json({ error: `স্টকে ${tshirtSize} সাইজের টি-শার্ট নেই!` }, { status: 400 });
    }

    // B. সব General আইটেম (Bag, Pen, etc.) ১ করে কমানো
    await KitItem.updateMany(
      { category: 'General', stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    );

    // ৩. টিকেট isUsed = true করা
    ticket.isUsed = true;
    await ticket.save();

    return NextResponse.json({ success: true, message: 'Kit distributed successfully!' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}