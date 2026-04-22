import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Loan from '@/models/Loan';
import LoanVote from '@/models/LoanVote';
import CircleMember from '@/models/CircleMember';
import TrustCircle from '@/models/TrustCircle';
import User from '@/models/User';
import { createNotification, NotificationTemplates } from '@/lib/notifications';

/**
 * POST /api/loans/[id]/vote
 * Cast a vote on a loan request
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: loanId } = await params;
    const body = await req.json();
    const { vote, comment } = body;

    if (!vote || !['approve', 'reject'].includes(vote)) {
      return NextResponse.json(
        { error: 'Vote must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get loan details
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'voting') {
      return NextResponse.json(
        { error: 'This loan is not open for voting' },
        { status: 400 }
      );
    }

    // Check if voter is the loan requester
    if (loan.userId.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot vote on your own loan request' },
        { status: 403 }
      );
    }

    // Check if voter is a circle member
    const membership = await CircleMember.findOne({
      userId: session.user.id,
      circleId: loan.circleId,
      isActive: true,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this circle' },
        { status: 403 }
      );
    }

    // Check if already voted
    const existingVote = await LoanVote.findOne({
      loanId,
      voterId: session.user.id,
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this loan' },
        { status: 400 }
      );
    }

    // Record the vote
    await LoanVote.create({
      loanId,
      voterId: session.user.id,
      vote,
      comment: comment || undefined,
    });

    // Check if voting is complete
    const circle = await TrustCircle.findById(loan.circleId);
    const totalMembers = await CircleMember.countDocuments({
      circleId: loan.circleId,
      isActive: true,
    });

    const eligibleVoters = totalMembers - 1; // Exclude loan requester
    const totalVotes = await LoanVote.countDocuments({ loanId });

    // If all eligible members have voted, finalize the loan
    if (totalVotes >= eligibleVoters) {
      const votes = await LoanVote.find({ loanId });
      const approveCount = votes.filter((v) => v.vote === 'approve').length;
      const rejectCount = votes.filter((v) => v.vote === 'reject').length;

      const approved = approveCount > rejectCount;

      // Update loan status
      loan.status = approved ? 'approved' : 'rejected';
      await loan.save();

      // Notify loan requester
      const template = NotificationTemplates.votingCompleted(loan.amount, approved);
      await createNotification({
        userId: loan.userId,
        ...template,
        relatedId: loanId,
        relatedModel: 'Loan',
        metadata: { approveCount, rejectCount, totalVotes },
      });

      return NextResponse.json({
        message: 'Vote recorded and voting completed',
        votingComplete: true,
        result: approved ? 'approved' : 'rejected',
        votes: { approve: approveCount, reject: rejectCount },
      });
    }

    return NextResponse.json({
      message: 'Vote recorded successfully',
      votingComplete: false,
      votesReceived: totalVotes,
      votesNeeded: eligibleVoters,
    });
  } catch (error: any) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}

/**
 * GET /api/loans/[id]/vote
 * Get voting status and results
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: loanId } = await params;

    await connectDB();

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Get all votes
    const votes = await LoanVote.find({ loanId })
      .populate('voterId', 'name')
      .sort({ votedAt: -1 });

    const approveCount = votes.filter((v) => v.vote === 'approve').length;
    const rejectCount = votes.filter((v) => v.vote === 'reject').length;

    // Check if current user has voted
    const userVote = votes.find((v) => v.voterId._id.toString() === session.user.id);

    // Get total eligible voters
    const totalMembers = await CircleMember.countDocuments({
      circleId: loan.circleId,
      isActive: true,
    });
    const eligibleVoters = totalMembers - 1;

    return NextResponse.json({
      loanId,
      status: loan.status,
      votes: {
        approve: approveCount,
        reject: rejectCount,
        total: votes.length,
      },
      eligibleVoters,
      votingComplete: votes.length >= eligibleVoters,
      userHasVoted: !!userVote,
      userVote: userVote?.vote,
      voteDetails: votes.map((v) => ({
        voter: v.voterId.name,
        vote: v.vote,
        comment: v.comment,
        votedAt: v.votedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching vote status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote status' },
      { status: 500 }
    );
  }
}
