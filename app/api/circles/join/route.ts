import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import TrustCircle from '@/models/TrustCircle';
import CircleMember from '@/models/CircleMember';
import { authOptions } from '@/lib/auth';
import { updateTrustScore, TrustScoreActions } from '@/lib/trust-utils';

/**
 * POST /api/circles/join - Join a circle using invite code
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode || inviteCode.length !== 8) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find circle by invite code
    const circle = await TrustCircle.findOne({
      inviteCode: inviteCode.toUpperCase(),
      isActive: true,
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await CircleMember.findOne({
      userId: (session.user as any).id,
      circleId: circle._id,
    });

    if (existingMember) {
      if (existingMember.isActive) {
        return NextResponse.json(
          { error: 'You are already a member of this circle' },
          { status: 400 }
        );
      } else {
        // Reactivate membership
        existingMember.isActive = true;
        await existingMember.save();
        
        return NextResponse.json({
          success: true,
          message: 'Rejoined circle successfully',
          circle: {
            id: circle._id,
            name: circle.name,
          },
        });
      }
    }

    // Check if circle is full
    const memberCount = await CircleMember.countDocuments({
      circleId: circle._id,
      isActive: true,
    });

    if (memberCount >= circle.maxMembers) {
      return NextResponse.json(
        { error: 'Circle is full' },
        { status: 400 }
      );
    }

    // Add user as member
    await CircleMember.create({
      userId: (session.user as any).id,
      circleId: circle._id,
      role: 'member',
    });

    // Update user's trust score for joining a circle
    await updateTrustScore(
      (session.user as any).id,
      TrustScoreActions.CIRCLE_JOINED.reason,
      TrustScoreActions.CIRCLE_JOINED.points
    );

    return NextResponse.json({
      success: true,
      message: 'Joined circle successfully',
      circle: {
        id: circle._id,
        name: circle.name,
        poolBalance: circle.poolBalance,
      },
    });
  } catch (error: any) {
    console.error('Error joining circle:', error);
    return NextResponse.json(
      { error: 'Failed to join circle' },
      { status: 500 }
    );
  }
}
