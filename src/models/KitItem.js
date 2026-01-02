import mongoose from 'mongoose';

const KitItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide item name'],
    unique: true 
  },
  category: { 
    type: String, 
    enum: ['General', 'Sized'], // 'General' = Pen, Mug | 'Sized' = T-Shirt
    default: 'General' 
  },
  // সাধারণ আইটেমের জন্য (যেমন: 500 কলম)
  stock: { 
    type: Number, 
    default: 0 
  },
  // সাইজ ওয়ালা আইটেমের জন্য (যেমন: T-Shirt)
  sizeStock: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    XXL: { type: Number, default: 0 },
    XXXL: { type: Number, default: 0 }
  },
  icon: { type: String, default: '📦' } // দেখার সৌন্দর্যের জন্য ইমোজি
}, { 
  timestamps: true 
});

export default mongoose.models.KitItem || mongoose.model('KitItem', KitItemSchema);