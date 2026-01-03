import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitItem from '@/models/KitItem';

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

// GET: সব আইটেম লিস্ট
export async function GET() {
  try {
    await connectDB();
    const items = await KitItem.find({}).sort({ createdAt: 1 }); 
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: নতুন আইটেম অ্যাড
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const existing = await KitItem.findOne({ name: body.name });
    if (existing) {
      return NextResponse.json({ error: 'Item already exists!' }, { status: 400 });
    }

    const newItem = await KitItem.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: স্টক আপডেট
export async function PUT(request) {
  try {
    await connectDB();
    const { id, type, amount, size } = await request.json(); 
    // type = 'set' (সরাসরি ইনপুট) OR 'add'/'remove' (বাটন ক্লিক)

    const item = await KitItem.findById(id);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const val = parseInt(amount);

    if (type === 'set') {
        // সরাসরি ভ্যালু সেট করা
        if (item.category === 'General') {
            item.stock = val;
        } else {
            if (size) {
                if (!item.sizeStock) item.sizeStock = {};
                item.sizeStock[size] = val;
                item.markModified('sizeStock'); // Mongoose কে জানানো যে অবজেক্ট চেঞ্জ হয়েছে
            }
        }
    } else {
        // যোগ বা বিয়োগ
        const increment = type === 'add' ? val : -val;
        if (item.category === 'General') {
            item.stock = (item.stock || 0) + increment;
        } else {
            if (size) {
                if (!item.sizeStock) item.sizeStock = {};
                const current = item.sizeStock[size] || 0;
                item.sizeStock[size] = current + increment;
                item.markModified('sizeStock');
            }
        }
    }

    await item.save();
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}