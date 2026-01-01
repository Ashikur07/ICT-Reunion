import dbConnect from "@/lib/db";
import Income from "@/models/Income";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const newIncome = await Income.create(body);
    return NextResponse.json({ success: true, data: newIncome });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  await dbConnect();
  try {
    const incomes = await Income.find({}).sort({ date: -1 });

    // --- 📊 অটোমেটিক রিপোর্ট জেনারেশন লজিক ---

    // ১. Batch wise Total Amount
    const batchWiseTotal = {};
    incomes.forEach(item => {
      if (item.sourceType === "BATCH" && item.batchName) {
        batchWiseTotal[item.batchName] = (batchWiseTotal[item.batchName] || 0) + item.amount;
      }
    });

    // ২. Account wise Total (Bkash, Cash, Bank)
    const accountWiseTotal = {};
    incomes.forEach(item => {
      accountWiseTotal[item.paymentMethod] = (accountWiseTotal[item.paymentMethod] || 0) + item.amount;
    });

    // ৩. Top 5 Contributors (Based on Amount)
    // আমরা ধরে নিচ্ছি Sponsor Name টাই ইউনিক আইডেন্টিফায়ার
    const topContributors = incomes
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(item => ({ name: item.sponsorName, amount: item.amount, type: item.sourceType }));

    // ৪. Alumni (Batch) vs External Sponsor Breakdown
    let totalAlumniSponsor = 0;
    let totalExternalSponsor = 0;
    
    incomes.forEach(item => {
      if (item.sourceType === "BATCH") totalAlumniSponsor += item.amount;
      if (item.sourceType === "EXTERNAL") totalExternalSponsor += item.amount;
    });

    // ৫. Grand Total Summary (Sponsor + Registration)
    let totalRegistration = 0;
    incomes.forEach(item => {
      if (item.sourceType === "REGISTRATION") totalRegistration += item.amount;
    });

    const grandTotal = totalAlumniSponsor + totalExternalSponsor + totalRegistration;

    return NextResponse.json({
      success: true,
      data: incomes,
      stats: {
        batchWiseTotal,
        accountWiseTotal,
        topContributors,
        breakdown: {
          alumni: totalAlumniSponsor,
          external: totalExternalSponsor,
          registration: totalRegistration,
          grandTotal
        }
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}