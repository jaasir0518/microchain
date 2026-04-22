/**
 * Trust Score Update Utilities
 * Dynamic score adjustments based on user actions
 */

import User from '@/models/User';

/**
 * Update user's trust score based on actions
 * @param userId - User's MongoDB ID
 * @param action - Description of the action (e.g., "On-time Repayment")
 * @param points - Points to add/subtract (can be negative)
 */
export async function updateTrustScore(
  userId: string,
  action: string,
  points: number
): Promise<number> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Calculate new score with bounds
  let newScore = user.trustScore + points;
  newScore = Math.min(98, Math.max(30, newScore));

  // Update user
  await User.findByIdAndUpdate(userId, {
    trustScore: newScore,
    $push: {
      trustHistory: {
        score: newScore,
        reason: action,
        date: new Date(),
      },
    },
  });

  return newScore;
}

/**
 * Trust score adjustment rules
 */
export const TrustScoreActions = {
  INITIAL_STATEMENT: { points: 0, reason: 'Initial Statement Upload' },
  LOAN_REPAID_ON_TIME: { points: 8, reason: 'On-time Repayment' },
  LOAN_REPAID_LATE: { points: -12, reason: 'Late Payment' },
  LOAN_COMPLETED: { points: 5, reason: 'Loan Fully Repaid' },
  LOAN_DEFAULTED: { points: -25, reason: 'Loan Default' },
  CIRCLE_CONTRIBUTION: { points: 3, reason: 'Circle Contribution' },
  CIRCLE_JOINED: { points: 2, reason: 'Joined Trust Circle' },
  LOAN_APPROVED: { points: 1, reason: 'Loan Approved by Circle' },
};
