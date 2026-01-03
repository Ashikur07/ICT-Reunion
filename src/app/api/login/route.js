import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth'; // আগের স্টেপে বানানো হেল্পার ইম্পোর্ট

export async function POST(request) {
  const { password, type } = await request.json();

  let role = null;

  // ১. ভিউয়ার হলে পাসওয়ার্ড লাগবে না
  if (type === 'viewer') {
    role = 'viewer';
  } 
  // ২. পাসওয়ার্ড চেক (Admin)
  else if (password === process.env.ADMIN_PASS) {
    role = 'admin';
  } 
  // ৩. পাসওয়ার্ড চেক (Moderator)
  else if (password === process.env.MOD_PASS) {
    role = 'moderator';
  } 
  // ৪. পাসওয়ার্ড ভুল হলে
  else {
    return NextResponse.json({ error: 'Wrong Password!' }, { status: 401 });
  }

  // ৫. ✅ সিকিউর টোকেন তৈরি করা (পাসওয়ার্ডের সিগনেচার সহ)
  const token = await createToken({ role });

  const response = NextResponse.json({ success: true, role });

  // ৬. কুকি ১: সিকিউর টোকেন (মিডলওয়্যার এর জন্য)
  // এটা HttpOnly, তাই ব্রাউজারে JS দিয়ে দেখা যাবে না
  response.cookies.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 10 // ১০ দিন
  });

  // ৭. কুকি ২: রোল (ফ্রন্টএন্ড UI এর জন্য)
  // এটা ক্লায়েন্ট সাইড থেকে রিড করা যাবে
  response.cookies.set('app_role', role, {
    httpOnly: false, 
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 10 // ১০ দিন
  });

  return response;
}