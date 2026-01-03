import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false }, // ইমেইল সব সময় নাও থাকতে পারে
  session: { type: String, required: true },
  
  // তোমার ডাটাবেসে 'ticketNumber' নেই, আছে 'roll'
  roll: { type: String, required: true }, 

  tShirtSize: { 
    type: String, 
    required: true,
    // ডাটাবেসে যদি XXXL থাকে, তাই enum একটু বাড়িয়ে দিলাম বা সেফটির জন্য enum বাদও দিতে পারো
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] 
  },

  // নতুন ফিল্ড (স্ক্রিনশট অনুযায়ী)
  participantType: { type: String, required: false }, // Alumni নাকি Student চেনার জন্য
  gender: { type: String, required: false },

  // শুরুতে এই ফিল্ড ডাটাবেসে নেই, তাই ডিফল্ট false ধরা হবে।
  // যখন ডিস্ট্রিবিউশন হবে, তখন true হয়ে সেভ হবে।
  isUsed: { type: Boolean, default: false }

}, { 
  timestamps: true,
  collection: 'tickets', // তোমার কালেকশনের নাম
  strict: false // ডাটাবেসে এক্সট্রা ফিল্ড থাকলে ইগনোর করবে, এরর দিবে না
});

export default mongoose.models.tickets || mongoose.model('tickets', TicketSchema);