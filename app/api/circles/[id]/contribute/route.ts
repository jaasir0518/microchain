import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import TrustCircle from '@/models/TrustCircle';
import CircleMember from '@/models/CircleMember';
import PoolContribution from '@/models/PoolContribution';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { updateTrustScore, TrustScoreActions } from '@/lib/trust-utils';
import { createBulkNotifications, NotificationTemplates } from '@/lib/notifications';

/**
 * POST /api/circles/[id]/contribute - Contribute virtual money to pool
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
    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid contribution amount' },
        { status: 400 }
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        { error: 'Maximum contribution is ₹10,000' },
        { status: 400 }
      );
    }

    await connectDB();

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

    // Update pool balance
    const circle = await TrustCircle.findById(id);
    
    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    circle.poolBalance += amount;
    await circle.save();

    // Update member's contribution
    membership.contributionAmount += amount;
    await membership.save();

    // Calculate trust score bonus (₹500 = +2, ₹1000 = +3, ₹2000+ = +5)
    let trustScoreBonus = 2;
    if (amount >= 2000) trustScoreBonus = 5;
    else if (amount >= 1000) trustScoreBonus = 3;

    // Record contribution
    await PoolContribution.create({
      circleId: id,
      userId: (session.user as any).id,
      amount,
      trustScoreBonus,
    });

    // Update contributor's trust score
    await updateTrustScore(
      (session.user as any).id,
      TrustScoreActions.CIRCLE_CONTRIBUTION.reason,
      trustScoreBonus
    );

    // Get contributor details for notifications
    const contributor = await User.findById((session.user as any).id).select('name');

    // Notify all circle members except contributor
    const allMembers = await CircleMember.find({
      circleId: id,
      isActive: true,
      userId: { $ne: (session.user as any).id },
    }).select('userId');

    if (allMembers.length > 0) {
      const template = NotificationTemplates.poolContribution(
        contributor?.name || 'A member',
        amount,
        circle.name
      );

      await createBulkNotifications(
        allMembers.map((m) => m.userId),
        {
          ...template,
          relatedId: id,
          relatedModel: 'TrustCircle',
          metadata: { amount, contributorId: (session.user as any).id },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully contributed ₹${amount}`,
      newPoolBalance: circle.poolBalance,
      totalContribution: membership.contributionAmount,
      trustScoreBonus,
    });
  } catch (error: any) {
    console.error('Error contributing to pool:', error);
    return NextResponse.json(
      { error: 'Failed to contribute to pool' },
      { status: 500 }
    );
  }
}
