import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function GET() {
  await dbConnect();
  
  try {
    // ১. মোট কতজন কিট নিয়েছে
    const totalDistributed = await Ticket.countDocuments({ isUsed: true });
    
    // ২. মোট স্টুডেন্ট সংখ্যা (অপশনাল, পার্সেন্টেজ দেখানোর জন্য)
    const totalStudents = await Ticket.countDocuments({});

    // ৩. সর্বশেষ ৫ জন যারা পেয়েছে (Preview এর জন্য)
    const recentRecipients = await Ticket.find({ isUsed: true })
      .sort({ updatedAt: -1 }) // একদম লেটেস্ট আগে আসবে
      .limit(3)
      .select('name roll tShirtSize updatedAt');

    return NextResponse.json({ 
      totalDistributed, 
      totalStudents,
      recentRecipients 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}