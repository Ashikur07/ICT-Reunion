import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // ১. HttpOnly কুকি ডিলিট (মেইন কাজ)
  response.cookies.delete('session_token');
  
  // ২. সাধারণ কুকি ডিলিট
  response.cookies.delete('app_role');

  return response;
}