import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'distributed'; // 'distributed' or 'pending'

  try {
    // ১. ফিল্টার লজিক
    const query = {};
    
    // স্ট্যাটাস অনুযায়ী কুয়েরি সেট করা
    if (filter === 'pending') {
        query.isUsed = false;
    } else {
        query.isUsed = true;
    }

    // সার্চ লজিক
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roll: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // ২. পেজিনেশন
    const skip = (page - 1) * limit;
    
    const history = await Ticket.find(query)
      .sort({ updatedAt: -1 }) 
      .skip(skip)
      .limit(limit);
    
    const totalDocs = await Ticket.countDocuments(query);

    // ৩. স্ট্যাটাস কাউন্ট (ট্যাবের জন্য)
    const totalDistributed = await Ticket.countDocuments({ isUsed: true });
    const totalPending = await Ticket.countDocuments({ isUsed: false });
    
    // সাইজ ব্রেকডাউন (শুধু Distributed দের জন্য)
    const sizeStats = await Ticket.aggregate([
      { $match: { isUsed: true } },
      { $group: { _id: '$tShirtSize', count: { $sum: 1 } } }
    ]);
    
    const sizeBreakdown = sizeStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});

    return NextResponse.json({
      history,
      pagination: {
        totalDocs,
        limit,
        page,
        totalPages: Math.ceil(totalDocs / limit)
      },
      stats: {
        distributedCount: totalDistributed,
        pendingCount: totalPending,
        sizes: sizeBreakdown
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}