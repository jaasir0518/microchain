import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Loan from '@/models/Loan';
import PoolContribution from '@/models/PoolContribution';
import CircleMember from '@/models/CircleMember';

/**
 * GET /api/analytics/personal
 * Get personal analytics and statistics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const userId = session.user.id;

    // Get user details
    const user = await User.findById(userId).select(
      'name trustScore trustHistory totalLoansTaken totalLoansRepaid onTimeRepayments'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Trust score trend (last N days)
    const trustScoreTrend = user.trustHistory
      .filter((h) => h.date >= startDate)
      .map((h) => ({
        date: h.date,
        score: h.score,
        reason: h.reason,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Loan statistics
    const loans = await Loan.find({ userId }).lean();
    const loansInPeriod = loans.filter((l) => l.createdAt >= startDate);

    const loanStats = {
      total: loans.length,
      approved: loans.filter((l) => l.status === 'approved' || l.status === 'repaid').length,
      repaid: loans.filter((l) => l.status === 'repaid').length,
      pending: loans.filter((l) => l.status === 'pending' || l.status === 'voting').length,
      rejected: loans.filter((l) => l.status === 'rejected').length,
      defaulted: loans.filter((l) => l.status === 'defaulted').length,
      totalBorrowed: loans
        .filter((l) => l.status === 'approved' || l.status === 'repaid')
        .reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: loans
        .filter((l) => l.status === 'repaid')
        .reduce((sum, l) => sum + (l.repaidAmount || 0), 0),
    };

    // Repayment rate
    const repaymentRate =
      loanStats.approved > 0 ? (loanStats.repaid / loanStats.approved) * 100 : 0;

    // Contribution statistics
    const contributions = await PoolContribution.find({ userId }).lean();
    const contributionsInPeriod = contributions.filter((c) => c.contributedAt >= startDate);

    const contributionStats = {
      total: contributions.length,
      totalAmount: contributions.reduce((sum, c) => sum + c.amount, 0),
      periodAmount: contributionsInPeriod.reduce((sum, c) => sum + c.amount, 0),
      averageAmount:
        contributions.length > 0
          ? contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length
          : 0,
    };

    // Circle memberships
    const memberships = await CircleMember.find({ userId, isActive: true })
      .populate('circleId', 'name poolBalance')
      .lean();

    const circleStats = {
      totalCircles: memberships.length,
      totalContributed: memberships.reduce((sum, m) => sum + m.contributionAmount, 0),
      circles: memberships.map((m: any) => ({
        id: m.circleId._id,
        name: m.circleId.name,
        role: m.role,
        contribution: m.contributionAmount,
        poolBalance: m.circleId.poolBalance,
      })),
    };

    // Monthly activity (last 6 months)
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthLoans = loans.filter(
        (l) => l.createdAt >= monthStart && l.createdAt < monthEnd
      );
      const monthContributions = contributions.filter(
        (c) => c.contributedAt >= monthStart && c.contributedAt < monthEnd
      );

      monthlyActivity.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM
        loans: monthLoans.length,
        contributions: monthContributions.length,
        loanAmount: monthLoans.reduce((sum, l) => sum + l.amount, 0),
        contributionAmount: monthContributions.reduce((sum, c) => sum + c.amount, 0),
      });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        trustScore: user.trustScore,
        totalLoansTaken: user.totalLoansTaken,
        totalLoansRepaid: user.totalLoansRepaid,
        onTimeRepayments: user.onTimeRepayments,
      },
      trustScoreTrend,
      loanStats,
      repaymentRate: Math.round(repaymentRate * 10) / 10,
      contributionStats,
      circleStats,
      monthlyActivity,
      period: periodDays,
    });
  } catch (error: any) {
    console.error('Error fetching personal analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
