import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Ticket from '@/models/Ticket';
import KitItem from '@/models/KitItem';

const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

export async function POST(request) {
  try {
    await connectDB();
    const { action, id, newSize } = await request.json(); 

    const ticket = await Ticket.findById(id);
    if (!ticket) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // --- CASE 1: UNDO DISTRIBUTION (Return Kit) ---
    if (action === 'undo') {
        if (!ticket.isUsed) {
            return NextResponse.json({ error: 'Already pending!' }, { status: 400 });
        }

        // ১. Sized আইটেমের স্টক ফেরত দেওয়া
        const sizeField = `sizeStock.${ticket.tShirtSize}`;
        await KitItem.updateMany(
            { category: 'Sized' },
            { $inc: { [sizeField]: 1 } } 
        );

        // ⭐ ২. General আইটেমের স্টক ফেরত দেওয়া (Bag লজিক সহ)
        let generalQuery = { category: 'General' };

        // লজিক: Current Student হলে ব্যাগের স্টক বাড়বে না (কারণ সে ব্যাগ নেয়নি)
        if (ticket.participantType === 'Current Student') {
             generalQuery.name = { $not: { $regex: 'Bag', $options: 'i' } };
        }

        await KitItem.updateMany(
            generalQuery,
            { $inc: { stock: 1 } } 
        );

        // ৩. টিকেট স্ট্যাটাস আপডেট
        ticket.isUsed = false;
        await ticket.save();

        return NextResponse.json({ success: true, message: 'Distribution reverted successfully!' });
    }

    // --- CASE 2: UPDATE T-SHIRT SIZE (আগের মতোই) ---
    if (action === 'update_size') {
        const oldSize = ticket.tShirtSize;
        
        if (oldSize === newSize) {
            return NextResponse.json({ success: true, message: 'Same size, no change.' });
        }

        if (ticket.isUsed) {
            const oldSizeField = `sizeStock.${oldSize}`;
            const newSizeField = `sizeStock.${newSize}`;

            const checkStock = await KitItem.findOne({ 
                category: 'Sized', 
                [newSizeField]: { $lte: 0 } 
            });

            if (checkStock) {
                return NextResponse.json({ error: `Stock out for new size ${newSize}!` }, { status: 400 });
            }

            await KitItem.updateMany(
                { category: 'Sized' },
                { $inc: { [newSizeField]: -1, [oldSizeField]: 1 } }
            );
        }

        ticket.tShirtSize = newSize;
        await ticket.save();

        return NextResponse.json({ success: true, message: 'Size updated successfully!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}