import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitItem from '@/models/KitItem';
import Ticket from '@/models/Ticket'; 

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

// 1. টিকেট চেক করা (GET) - আগের মতোই থাকছে
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const ticketInput = searchParams.get('ticketNumber'); 

    if (!ticketInput) return NextResponse.json({ error: 'Ticket number required' }, { status: 400 });

    const ticket = await Ticket.findOne({ roll: ticketInput }).lean();

    if (!ticket) return NextResponse.json({ error: 'Ticket not found!' }, { status: 404 });

    const responseData = {
        ...ticket,
        isUsed: ticket.isUsed === true 
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ডিস্ট্রিবিউশন কনফার্ম (POST) - ⭐ এখানে লজিক চেঞ্জ হয়েছে
export async function POST(request) {
  try {
    await connectDB();
    const { ticketNumber } = await request.json(); 

    const ticket = await Ticket.findOne({ roll: ticketNumber });
    
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    
    if (ticket.isUsed) {
      return NextResponse.json({ error: 'This ticket has already been used!' }, { status: 400 });
    }

    // --- ইনভেন্টরি আপডেট লজিক ---
    const tshirtSize = ticket.tShirtSize; 
    const sizeField = `sizeStock.${tshirtSize}`;

    // ১. আগে চেক করি Sized আইটেম (Polo/Jersey) স্টক আছে কিনা
    const lowStockItems = await KitItem.find({ 
        category: 'Sized', 
        [sizeField]: { $lte: 0 } 
    });

    if (lowStockItems.length > 0) {
        const names = lowStockItems.map(i => i.name).join(', ');
        return NextResponse.json({ error: `Stock out for size ${tshirtSize} in: ${names}!` }, { status: 400 });
    }

    // ২. সব Sized আইটেম আপডেট (১ করে কমানো)
    await KitItem.updateMany(
      { category: 'Sized' }, 
      { $inc: { [sizeField]: -1 } }
    );

    // ⭐ ৩. General আইটেম আপডেট (Bag লজিক সহ)
    let generalQuery = { category: 'General', stock: { $gt: 0 } };

    // লজিক: যদি Current Student হয়, তবে সে Bag পাবে না
    if (ticket.participantType === 'Current Student') {
        // নামের মধ্যে 'Bag' থাকলে সেটা বাদ দিয়ে বাকিগুলো আপডেট করবে
        generalQuery.name = { $not: { $regex: 'Bag', $options: 'i' } };
    }

    await KitItem.updateMany(
      generalQuery,
      { $inc: { stock: -1 } }
    );

    // --- টিকেট স্ট্যাটাস আপডেট ---
    await Ticket.updateOne(
        { roll: ticketNumber },
        { $set: { isUsed: true } }
    );

    return NextResponse.json({ success: true, message: 'Kit distributed successfully!' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}