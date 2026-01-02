import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  session: { type: String, required: true },
  roll: { type: String, required: true },
  tShirtSize: { 
    type: String, 
    required: true,
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] 
  },
  ticketNumber: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: true }
}, { 
  timestamps: true,
  collection: 'tickets' // এই লাইনটি নিশ্চিত করবে যেন সে ছোট হাতের 'tickets' কালেকশনই ব্যবহার করে
});

// আগে 'Ticket' ছিল, এখন ছোট হাতের 'tickets' দিলাম তোমার ডাটাবেস অনুযায়ী
export default mongoose.models.tickets || mongoose.model('tickets', TicketSchema);