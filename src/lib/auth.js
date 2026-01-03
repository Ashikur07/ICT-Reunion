import { SignJWT, jwtVerify } from 'jose';

// তোমার এনভায়রনমেন্ট ভেরিয়েবল বা হার্ডকোডেড পাসওয়ার্ডগুলো এখানে আনো
// .env ফাইল থেকে আনাটাই বেস্ট
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123"; 
const MODERATOR_PASS = process.env.MOD_PASS || "mod123";

// সিক্রেট কি পাওয়ার ফাংশন (রোল অনুযায়ী পাসওয়ার্ড রিটার্ন করবে)
const getSecretKey = (role) => {
  if (role === 'admin') return new TextEncoder().encode(ADMIN_PASS);
  if (role === 'moderator') return new TextEncoder().encode(MODERATOR_PASS);
  return new TextEncoder().encode("guest_secret"); // ফলব্যাক
};

// টোকেন তৈরি করা (লগিন এর সময় কল হবে)
export async function createToken(payload) {
  const secret = getSecretKey(payload.role);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10d') // ১০ দিনের মেয়াদ
    .sign(secret);
}

// টোকেন ভেরিফাই করা (মিডলওয়্যার এ কল হবে)
export async function verifyToken(token) {
  try {
    // প্রথমে ডিকোড করে রোলটা বের করি (ভেরিফাই ছাড়া)
    // jose তে ডাইরেক্ট ডিকোড একটু ট্রিকি, তাই আমরা আগে ট্রাই-ক্যাচ দিয়ে চেক করব
    
    // আমরা জানি না কোন পাসওয়ার্ড দিয়ে সাইন করা, তাই দুইটা দিয়েই ট্রাই করব
    // যদি এডমিন পাসওয়ার্ড দিয়ে ভেরিফাই হয়, গুড। না হলে মডারেটর দিয়ে দেখব।
    
    try {
      const { payload } = await jwtVerify(token, getSecretKey('admin'));
      return payload; // এডমিন পাসওয়ার্ড ঠিক আছে
    } catch (e) {
      // এডমিন দিয়ে না হলে মডারেটর দিয়ে ট্রাই
      const { payload } = await jwtVerify(token, getSecretKey('moderator'));
      return payload; // মডারেটর পাসওয়ার্ড ঠিক আছে
    }

  } catch (error) {
    // কোনো পাসওয়ার্ড দিয়েই মেলেনি (তার মানে পাসওয়ার্ড চেঞ্জ হয়েছে অথবা টোকেন ভুয়া)
    return null;
  }
}