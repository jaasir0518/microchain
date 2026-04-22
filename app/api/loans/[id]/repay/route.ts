import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import Loan from '@/models/Loan';
import TrustCircle from '@/models/TrustCircle';
import User from '@/models/User';
import { calculateRepaymentAmount } from '@/lib/utils-server';
import { authOptions } from '@/lib/auth';
import { updateTrustScore, TrustScoreActions } from '@/lib/trust-utils';

/**
 * POST /api/loans/[id]/repay - Repay a loan
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

    // Verify ownership
    if (loan.userId.toString() !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'You can only repay your own loans' },
        { status: 403 }
      );
    }

    if (loan.status !== 'approved') {
      return NextResponse.json(
        { error: 'Loan is not in approved state' },
        { status: 400 }
      );
    }

    // Calculate repayment amount with interest
    const repaymentAmount = calculateRepaymentAmount(loan.amount, loan.interestRate);

    // Update loan status
    loan.status = 'repaid';
    loan.repaidAt = new Date();
    loan.repaidAmount = repaymentAmount;
    await loan.save();

    // Add repayment to pool (principal + interest)
    const circle = await TrustCircle.findById(loan.circleId);
    if (circle) {
      circle.poolBalance += repaymentAmount;
      await circle.save();
    }

    // Improve user's trust score based on repayment timing
    const user = await User.findById(loan.userId);
    let newTrustScore = user?.trustScore;
    
    if (user) {
      const isOnTime = new Date() <= loan.dueDate;
      
      if (isOnTime) {
        // On-time repayment
        newTrustScore = await updateTrustScore(
          user._id.toString(),
          TrustScoreActions.LOAN_REPAID_ON_TIME.reason,
          TrustScoreActions.LOAN_REPAID_ON_TIME.points
        );
        
        user.onTimeRepayments += 1;
      } else {
        // Late repayment
        newTrustScore = await updateTrustScore(
          user._id.toString(),
          TrustScoreActions.LOAN_REPAID_LATE.reason,
          TrustScoreActions.LOAN_REPAID_LATE.points
        );
      }
      
      user.totalLoansRepaid += 1;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Loan repaid successfully',
      loan: {
        id: loan._id,
        amount: loan.amount,
        repaidAmount,
        status: loan.status,
      },
      newTrustScore: newTrustScore,
      newPoolBalance: circle?.poolBalance,
    });
  } catch (error: any) {
    console.error('Error repaying loan:', error);
    return NextResponse.json(
      { error: 'Failed to repay loan' },
      { status: 500 }
    );
  }
}
