import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import Loan from '@/models/Loan';
import TrustCircle from '@/models/TrustCircle';
import CircleMember from '@/models/CircleMember';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { updateTrustScore, TrustScoreActions } from '@/lib/trust-utils';

/**
 * POST /api/loans/[id]/approve - Approve a pending loan (admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Find loan
    const loan = await Loan.findById(id);
    
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'pending') {
      return NextResponse.json(
        { error: 'Loan is not pending' },
        { status: 400 }
      );
    }

    // Check if user is admin of the circle
    const membership = await CircleMember.findOne({
      userId: (session.user as any).id,
      circleId: loan.circleId,
      role: 'admin',
      isActive: true,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Only circle admins can approve loans' },
        { status: 403 }
      );
    }

    // Get circle and check pool balance
    const circle = await TrustCircle.findById(loan.circleId);
    
    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (circle.poolBalance < loan.amount) {
      return NextResponse.json(
        { error: 'Insufficient pool balance' },
        { status: 400 }
      );
    }

    // Approve loan and deduct from pool
    loan.status = 'approved';
    await loan.save();

    circle.poolBalance -= loan.amount;
    await circle.save();

    // Update borrower's trust score and loan count
    const borrower = await User.findById(loan.userId);
    if (borrower) {
      await updateTrustScore(
        borrower._id.toString(),
        TrustScoreActions.LOAN_APPROVED.reason,
        TrustScoreActions.LOAN_APPROVED.points
      );
      
      borrower.totalLoansTaken += 1;
      await borrower.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Loan approved successfully',
      loan: {
        id: loan._id,
        amount: loan.amount,
        status: loan.status,
      },
      newPoolBalance: circle.poolBalance,
    });
  } catch (error: any) {
    console.error('Error approving loan:', error);
    return NextResponse.json(
      { error: 'Failed to approve loan' },
      { status: 500 }
    );
  }
}
