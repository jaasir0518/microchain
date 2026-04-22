import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import TrustCircle from '@/models/TrustCircle';
import CircleMember from '@/models/CircleMember';
import { generateInviteCode } from '@/lib/utils-server';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/circles - Get all circles for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all circles where user is a member
    const memberships = await CircleMember.find({
      userId: (session.user as any).id,
      isActive: true,
    }).populate('circleId');

    const circles = memberships
      .filter(m => m.circleId)
      .map(m => m.circleId);

    return NextResponse.json({ circles });
  } catch (error: any) {
    console.error('Error fetching circles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/circles - Create a new trust circle
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, maxMembers, initialPoolBalance } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Circle name must be at least 3 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let exists = await TrustCircle.findOne({ inviteCode });
    
    while (exists) {
      inviteCode = generateInviteCode();
      exists = await TrustCircle.findOne({ inviteCode });
    }

    // Create circle
    const circle = await TrustCircle.create({
      name: name.trim(),
      description: description?.trim(),
      inviteCode,
      createdBy: (session.user as any).id,
      poolBalance: initialPoolBalance || 0,
      maxMembers: maxMembers || 20,
    });

    // Add creator as admin member
    await CircleMember.create({
      userId: (session.user as any).id,
      circleId: circle._id,
      role: 'admin',
      contributionAmount: initialPoolBalance || 0,
    });

    return NextResponse.json({
      success: true,
      circle: {
        id: circle._id.toString(),
        name: circle.name,
        inviteCode: circle.inviteCode,
        poolBalance: circle.poolBalance,
      },
    });
  } catch (error: any) {
    console.error('Error creating circle:', error);
    return NextResponse.json(
      { error: 'Failed to create circle' },
      { status: 500 }
    );
  }
}
