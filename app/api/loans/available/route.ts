import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Loan from "@/models/Loan";
import TrustCircle from "@/models/TrustCircle";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find all circles the user is a member of
    const userCircles = await TrustCircle.find({
      members: currentUser._id,
    });

    const circleIds = userCircles.map((c) => c._id);

    // Find all approved loans in those circles that need funding
    // Exclude loans requested by the current user
    const availableLoans = await Loan.find({
      circle: { $in: circleIds },
      borrower: { $ne: currentUser._id },
      status: "approved",
      lender: { $exists: false },
    })
      .populate("borrower", "name email trustScore")
      .populate("circle", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      loans: availableLoans,
    });
  } catch (error: any) {
    console.error("Error fetching available loans:", error);
    return NextResponse.json(
      { error: "Failed to fetch available loans", details: error.message },
      { status: 500 }
    );
  }
}
