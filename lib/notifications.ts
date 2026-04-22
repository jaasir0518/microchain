/**
 * Notification System Utilities
 * Create and manage user notifications
 */

import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  type: 'loan_request' | 'loan_approved' | 'loan_rejected' | 'loan_repaid' | 'trust_score_change' | 'circle_invitation' | 'pool_contribution' | 'voting_started' | 'voting_completed';
  title: string;
  message: string;
  relatedId?: string | mongoose.Types.ObjectId;
  relatedModel?: 'Loan' | 'TrustCircle' | 'User';
  metadata?: Record<string, any>;
}

/**
 * Create a new notification
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedId: params.relatedId,
      relatedModel: params.relatedModel,
      metadata: params.metadata,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: (string | mongoose.Types.ObjectId)[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notifications = userIds.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedId: params.relatedId,
      relatedModel: params.relatedModel,
      metadata: params.metadata,
      isRead: false,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Notification Templates
 */
export const NotificationTemplates = {
  loanRequested: (userName: string, amount: number, circleName: string) => ({
    type: 'loan_request' as const,
    title: 'New Loan Request',
    message: `${userName} requested ₹${amount} from ${circleName}`,
  }),

  loanApproved: (amount: number, circleName: string) => ({
    type: 'loan_approved' as const,
    title: 'Loan Approved! 🎉',
    message: `Your loan of ₹${amount} from ${circleName} has been approved`,
  }),

  loanRejected: (amount: number, circleName: string) => ({
    type: 'loan_rejected' as const,
    title: 'Loan Not Approved',
    message: `Your loan request of ₹${amount} from ${circleName} was not approved`,
  }),

  loanRepaid: (userName: string, amount: number) => ({
    type: 'loan_repaid' as const,
    title: 'Loan Repaid',
    message: `${userName} repaid ₹${amount}`,
  }),

  trustScoreChanged: (newScore: number, change: number, reason: string) => ({
    type: 'trust_score_change' as const,
    title: change > 0 ? 'Trust Score Increased! 📈' : 'Trust Score Updated',
    message: `Your trust score is now ${newScore} (${change > 0 ? '+' : ''}${change} - ${reason})`,
  }),

  poolContribution: (userName: string, amount: number, circleName: string) => ({
    type: 'pool_contribution' as const,
    title: 'Pool Contribution',
    message: `${userName} contributed ₹${amount} to ${circleName}`,
  }),

  votingStarted: (userName: string, amount: number, circleName: string) => ({
    type: 'voting_started' as const,
    title: 'Vote Required 🗳️',
    message: `${userName} needs your vote for ₹${amount} loan in ${circleName}`,
  }),

  votingCompleted: (amount: number, approved: boolean) => ({
    type: 'voting_completed' as const,
    title: approved ? 'Loan Approved by Vote' : 'Loan Rejected by Vote',
    message: `Your ₹${amount} loan request has been ${approved ? 'approved' : 'rejected'} by circle members`,
  }),
};
