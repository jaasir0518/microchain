import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import Loan from '@/models/Loan';
import TrustCircle from '@/models/TrustCircle';
import CircleMember from '@/models/CircleMember';
import User from '@/models/User';
import { calculateDueDate } from '@/lib/utils-server';
import { authOptions } from '@/lib/auth';
import { createBulkNotifications, NotificationTemplates } from '@/lib/notifications';

/**
 * POST /api/loans/request - Request a loan from a circle
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { circleId, amount, purpose, durationDays } = body;

    // Validation
    if (!circleId || !amount || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount < 500 || amount > 8000) {
      return NextResponse.json(
        { error: 'Loan amount must be between ₹500 and ₹8000' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user is a member of the circle
    const membership = await CircleMember.findOne({
      userId: (session.user as any).id,
      circleId,
      isActive: true,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this circle' },
        { status: 403 }
      );
    }

    // Get circle and check pool balance
    const circle = await TrustCircle.findById(circleId);
    
    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (circle.poolBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient pool balance' },
        { status: 400 }
      );
    }

    // Get user's trust score
    const user = await User.findById((session.user as any).id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for active loans
    const activeLoan = await Loan.findOne({
      borrower: (session.user as any).id,
      circle: circleId,
      status: { $in: ['voting', 'approved', 'active'] },
    });

    if (activeLoan) {
      return NextResponse.json(
        { error: 'You already have an active loan in this circle' },
        { status: 400 }
      );
    }

    // Determine loan status based on trust score
    let loanStatus: 'approved' | 'rejected' | 'voting' = 'pending' as any;
    let statusMessage = '';

    if (user.trustScore >= 70) {
      // Auto-approve
      loanStatus = 'approved';
      statusMessage = 'Loan auto-approved based on your trust score';
      circle.poolBalance -= amount;
      await circle.save();
    } else if (user.trustScore <= 54) {
      // Auto-reject
      loanStatus = 'rejected';
      statusMessage = 'Loan rejected due to low trust score';
    } else {
      // Voting required (55-69)
      loanStatus = 'voting';
      statusMessage = 'Your loan request is under review by circle members';
    }

    // Create loan request
    const loan = await Loan.create({
      circle: circleId,
      borrower: (session.user as any).id,
      amount,
      purpose: purpose.trim(),
      trustScoreAtRequest: user.trustScore,
      status: loanStatus,
      durationDays: durationDays || 30,
      dueDate: calculateDueDate(durationDays || 30),
    });

    // Send notifications
    if (loanStatus === 'voting') {
      // Notify all circle members except requester
      const allMembers = await CircleMember.find({
        circleId,
        isActive: true,
        userId: { $ne: (session.user as any).id },
      }).select('userId');

      if (allMembers.length > 0) {
        const template = NotificationTemplates.votingStarted(
          user.name,
          amount,
          circle.name
        );

        await createBulkNotifications(
          allMembers.map((m) => m.userId),
          {
            ...template,
            relatedId: loan._id,
            relatedModel: 'Loan',
            metadata: { amount, trustScore: user.trustScore },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      loan: {
        id: loan._id,
        amount: loan.amount,
        status: loan.status,
        trustScore: user.trustScore,
        autoApproved: loanStatus === 'approved',
        requiresVoting: loanStatus === 'voting',
        dueDate: loan.dueDate,
      },
      message: statusMessage,
    });
  } catch (error: any) {
    console.error('Error requesting loan:', error);
    return NextResponse.json(
      { error: 'Failed to request loan' },
      { status: 500 }
    );
  }
}
