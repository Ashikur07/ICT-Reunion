import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Ticket from '@/models/Ticket';

const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

export async function GET() {
  await connectDB();
  
  try {
    const totalDistributed = await Ticket.countDocuments({ isUsed: true });
    const totalStudents = await Ticket.countDocuments({});

    // লেটেস্ট ৩ জন রিসিভার (প্রিভিউ এর জন্য)
    const recentRecipients = await Ticket.find({ isUsed: true })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('name roll tShirtSize updatedAt')
      .lean();

    return NextResponse.json({ 
      totalDistributed, 
      totalStudents,
      recentRecipients 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}