import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import Loan from '@/models/Loan';
import CircleMember from '@/models/CircleMember';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/loans - Get loans for a circle or user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const circleId = searchParams.get('circleId');
    const status = searchParams.get('status');

    await connectDB();

    let query: any = {};

    if (circleId) {
      // Verify user is a member
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

      query.circle = circleId;
    } else {
      // Get user's own loans
      query.borrower = (session.user as any).id;
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query)
      .populate('borrower', 'name email trustScore')
      .populate('circle', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      loans: loans.map(l => ({
        id: l._id,
        borrower: {
          id: (l.borrower as any)._id,
          name: (l.borrower as any).name,
          email: (l.borrower as any).email,
          trustScore: (l.borrower as any).trustScore,
        },
        circle: {
          id: (l.circle as any)._id,
          name: (l.circle as any).name,
        },
        amount: l.amount,
        purpose: l.purpose,
        status: l.status,
        trustScoreAtRequest: l.trustScoreAtRequest,
        interestRate: l.interestRate,
        dueDate: l.dueDate,
        repaidAt: l.repaidAt,
        repaidAmount: l.repaidAmount,
        createdAt: l.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}
