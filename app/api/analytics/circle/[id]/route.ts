import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import TrustCircle from '@/models/TrustCircle';
import CircleMember from '@/models/CircleMember';
import Loan from '@/models/Loan';
import PoolContribution from '@/models/PoolContribution';
import User from '@/models/User';

/**
 * GET /api/analytics/circle/[id]
 * Get circle analytics and statistics
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

    const { id: circleId } = await params;

    await connectDB();

    // Check if user is a member
    const membership = await CircleMember.findOne({
      userId: session.user.id,
      circleId,
      isActive: true,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this circle' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30';
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get circle details
    const circle = await TrustCircle.findById(circleId).lean();
    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    // Get all members
    const members = await CircleMember.find({ circleId, isActive: true })
      .populate('userId', 'name trustScore')
      .lean();

    // Member statistics
    const memberStats = await Promise.all(
      members.map(async (member: any) => {
        const loans = await Loan.countDocuments({
          userId: member.userId._id,
          circleId,
        });
        const repaid = await Loan.countDocuments({
          userId: member.userId._id,
          circleId,
          status: 'repaid',
        });

        return {
          id: member.userId._id,
          name: member.userId.name,
          trustScore: member.userId.trustScore,
          role: member.role,
          contribution: member.contributionAmount,
          loansCount: loans,
          repaidCount: repaid,
          joinedAt: member.joinedAt,
        };
      })
    );

    // Sort by trust score
    memberStats.sort((a, b) => b.trustScore - a.trustScore);

    // Loan statistics
    const loans = await Loan.find({ circleId }).lean();
    const loansInPeriod = loans.filter((l) => l.createdAt >= startDate);

    const loanStats = {
      total: loans.length,
      approved: loans.filter((l) => l.status === 'approved' || l.status === 'repaid').length,
      repaid: loans.filter((l) => l.status === 'repaid').length,
      pending: loans.filter((l) => l.status === 'pending').length,
      voting: loans.filter((l) => l.status === 'voting').length,
      rejected: loans.filter((l) => l.status === 'rejected').length,
      defaulted: loans.filter((l) => l.status === 'defaulted').length,
      totalAmount: loans
        .filter((l) => l.status === 'approved' || l.status === 'repaid')
        .reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: loans
        .filter((l) => l.status === 'repaid')
        .reduce((sum, l) => sum + (l.repaidAmount || 0), 0),
    };

    // Pool statistics
    const contributions = await PoolContribution.find({ circleId }).lean();
    const contributionsInPeriod = contributions.filter((c) => c.contributedAt >= startDate);

    const poolStats = {
      currentBalance: circle.poolBalance,
      totalContributions: contributions.reduce((sum, c) => sum + c.amount, 0),
      periodContributions: contributionsInPeriod.reduce((sum, c) => sum + c.amount, 0),
      contributionCount: contributions.length,
      averageContribution:
        contributions.length > 0
          ? contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length
          : 0,
    };

    // Pool balance trend (last 30 days)
    const poolTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayContributions = contributions.filter(
        (c) => c.contributedAt >= date && c.contributedAt < nextDate
      );
      const dayLoans = loans.filter(
        (l) =>
          l.createdAt >= date &&
          l.createdAt < nextDate &&
          (l.status === 'approved' || l.status === 'repaid')
      );

      const contributionAmount = dayContributions.reduce((sum, c) => sum + c.amount, 0);
      const loanAmount = dayLoans.reduce((sum, l) => sum + l.amount, 0);

      poolTrend.push({
        date: date.toISOString().split('T')[0],
        contributions: contributionAmount,
        loans: loanAmount,
        net: contributionAmount - loanAmount,
      });
    }

    // Repayment rate
    const repaymentRate =
      loanStats.approved > 0 ? (loanStats.repaid / loanStats.approved) * 100 : 0;

    // Top contributors
    const topContributors = memberStats
      .filter((m) => m.contribution > 0)
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5)
      .map((m) => ({
        name: m.name,
        amount: m.contribution,
        trustScore: m.trustScore,
      }));

    return NextResponse.json({
      circle: {
        id: circle._id,
        name: circle.name,
        poolBalance: circle.poolBalance,
        maxMembers: circle.maxMembers,
        createdAt: circle.createdAt,
      },
      memberStats,
      loanStats,
      repaymentRate: Math.round(repaymentRate * 10) / 10,
      poolStats,
      poolTrend,
      topContributors,
      period: periodDays,
    });
  } catch (error: any) {
    console.error('Error fetching circle analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circle analytics' },
      { status: 500 }
    );
  }
}
