import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import TrustCircle from '@/models/TrustCircle';
import CircleMember from '@/models/CircleMember';
import User from '@/models/User';
import Loan from '@/models/Loan';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/circles/[id] - Get circle details with members and loans
 */
export async function GET(
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

    // Find circle
    const circle = await TrustCircle.findById(id);
    
    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    // Check if user is a member
    const membership = await CircleMember.findOne({
      userId: (session.user as any).id,
      circleId: id,
      isActive: true,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this circle' },
        { status: 403 }
      );
    }

    // Get all members with user details
    const members = await CircleMember.find({
      circleId: id,
      isActive: true,
    }).populate('userId', 'name email trustScore');

    // Get recent loans
    const loans = await Loan.find({
      circleId: id,
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      circle: {
        id: circle._id,
        name: circle.name,
        inviteCode: circle.inviteCode,
        poolBalance: circle.poolBalance,
        maxMembers: circle.maxMembers,
        description: circle.description,
        createdAt: circle.createdAt,
      },
      members: members.map(m => ({
        id: m._id,
        userId: (m.userId as any)._id,
        name: (m.userId as any).name,
        email: (m.userId as any).email,
        trustScore: (m.userId as any).trustScore,
        role: m.role,
        contributionAmount: m.contributionAmount,
        joinedAt: m.joinedAt,
      })),
      loans: loans.map(l => ({
        id: l._id,
        borrower: {
          name: (l.userId as any).name,
          email: (l.userId as any).email,
        },
        amount: l.amount,
        purpose: l.purpose,
        status: l.status,
        trustScoreAtRequest: l.trustScoreAtRequest,
        dueDate: l.dueDate,
        createdAt: l.createdAt,
      })),
      userRole: membership.role,
    });
  } catch (error: any) {
    console.error('Error fetching circle details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circle details' },
      { status: 500 }
    );
  }
}
