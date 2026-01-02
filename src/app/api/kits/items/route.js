import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitItem from '@/models/KitItem';

// ডাটাবেস কানেকশন হেল্পার (যদি তোমার আলাদা dbConnect ফাইল থাকে সেটা ইম্পোর্ট করো, না থাকলে এটা কাজ করবে)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// 1. GET: সব আইটেম দেখার জন্য
export async function GET() {
  try {
    await dbConnect();
    const items = await KitItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: নতুন আইটেম অ্যাড করার জন্য
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // ডুপ্লিকেট নাম চেক করা
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

// 3. PUT: স্টক আপডেট করার জন্য
export async function PUT(request) {
  try {
    await dbConnect();
    const { id, type, amount, size } = await request.json(); 
    // type = 'add' or 'remove'
    // size = 'M', 'L' (optional for General items)

    const item = await KitItem.findById(id);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const increment = type === 'add' ? amount : -amount;

    if (item.category === 'General') {
      item.stock = (item.stock || 0) + increment;
    } else {
      // Sized Item Logic
      if (size && item.sizeStock[size] !== undefined) {
        item.sizeStock[size] += increment;
      }
    }

    await item.save();
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}