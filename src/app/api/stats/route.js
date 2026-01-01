import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db"; 
import Income from "@/models/Income";

export async function GET() {
  await dbConnect();

  try {
    // 1. Batch Wise Stats
    const batchStats = await Income.aggregate([
      { $match: { sourceType: "BATCH" } },
      { $group: { _id: "$batchName", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    // 2. Account Wise Stats
    const accountStats = await Income.aggregate([
      { $group: { _id: "$receivedBy", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    // 3. Top Contributors
    const topContributors = await Income.find({ name: { $ne: "Collective Total" } })
      .sort({ amount: -1 })
      .limit(5)
      .select("name batchName amount sourceType");

    // 4. [NEW] Recent Activity (Frontend এর জন্য নতুন যোগ করা হলো)
    // createdAt: -1 মানে একদম লেটেস্ট ডাটা আগে আসবে
    const recentActivity = await Income.find({})
      .sort({ createdAt: -1 }) 
      .limit(10) // লেটেস্ট ১০টা ট্রানজেকশন দেখাবে
      .select("name amount sourceType batchName createdAt date receivedBy");

    // 5. Summaries
    const allData = await Income.find({}, "sourceType amount");
    const summary = {
      total: allData.reduce((acc, curr) => acc + curr.amount, 0),
      batch: allData.filter(d => d.sourceType === "BATCH").reduce((acc, c) => acc + c.amount, 0),
      external: allData.filter(d => d.sourceType === "EXTERNAL").reduce((acc, c) => acc + c.amount, 0),
    };

    return NextResponse.json({ 
      batchStats, 
      accountStats, 
      topContributors, 
      recentActivity, // <--- এই নতুন ডাটা এখন রেস্পন্সে যাবে
      summary 
    }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" }, 
      { status: 500 }
    );
  }
}