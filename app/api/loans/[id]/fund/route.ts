import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Loan from "@/models/Loan";
import User from "@/models/User";
import Circle from "@/models/Circle";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const loanId = params.id;

    // Find the loan
    const loan = await Loan.findById(loanId).populate("circle");
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Check if loan is approved and not yet funded
    if (loan.status !== "approved") {
      return NextResponse.json(
        { error: "Loan is not approved for funding" },
        { status: 400 }
      );
    }

    if (loan.lender) {
      return NextResponse.json(
        { error: "Loan has already been funded" },
        { status: 400 }
      );
    }

    // Find the lender (current user)
    const lender = await User.findOne({ email: session.user.email });
    if (!lender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if lender is trying to fund their own loan
    if (loan.borrower.toString() === lender._id.toString()) {
      return NextResponse.json(
        { error: "You cannot fund your own loan" },
        { status: 400 }
      );
    }

    // Check if lender is a member of the circle
    const circle = await Circle.findById(loan.circle);
    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const isMember = circle.members.some(
      (memberId: any) => memberId.toString() === lender._id.toString()
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this circle to fund loans" },
        { status: 403 }
      );
    }

    // Update loan with lender and change status to active
    loan.lender = lender._id;
    loan.status = "active";
    loan.fundedAt = new Date();
    await loan.save();

    // Update lender's stats
    lender.totalLent = (lender.totalLent || 0) + loan.amount;
    await lender.save();

    return NextResponse.json({
      success: true,
      message: "Loan funded successfully",
      loan,
    });
  } catch (error: any) {
    console.error("Error funding loan:", error);
    return NextResponse.json(
      { error: "Failed to fund loan", details: error.message },
      { status: 500 }
    );
  }
}
