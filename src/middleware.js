import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth'; // ইম্পোর্ট করো

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // ১. ইন্সটল পেজ বা পাবলিক পেজ হলে ছেড়ে দাও
  if (path === '/install') {
    return NextResponse.next();
  }

  // ২. কুকি থেকে টোকেন নাও
  const token = request.cookies.get('session_token')?.value;

  // ৩. টোকেন ভেরিফাই করো (এখানেই আসল ম্যাজিক)
  // যদি পাসওয়ার্ড চেঞ্জ হয়ে থাকে, তাহলে verifyToken 'null' রিটার্ন করবে
  const payload = token ? await verifyToken(token) : null;

  // ৪. যদি লগিন পেজে থাকে
  if (path === '/login') {
    if (payload) {
      return NextResponse.redirect(new URL('/', request.url)); // অলরেডি লগিন থাকলে হোমে
    }
    return NextResponse.next(); // না থাকলে লগিনে থাক
  }

  // ৫. প্রোটেক্টেড রাউট (বাকি সব পেজ)
  if (!payload) {
    // টোকেন নাই অথবা পাসওয়ার্ড চেঞ্জ হওয়ায় টোকেন ইনভ্যালিড হয়ে গেছে
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // ভুয়া কুকি ডিলিট করে দিই যাতে ক্লিন থাকে
    response.cookies.delete('session_token');
    response.cookies.delete('app_role');
    
    return response;
  }

  // সব ঠিক থাকলে যেতে দাও
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};