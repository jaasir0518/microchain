import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'loan_request' | 'loan_approved' | 'loan_rejected' | 'loan_repaid' | 'trust_score_change' | 'circle_invitation' | 'pool_contribution' | 'voting_started' | 'voting_completed';
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId; // Loan ID, Circle ID, etc.
  relatedModel?: 'Loan' | 'TrustCircle' | 'User';
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'loan_request',
        'loan_approved',
        'loan_rejected',
        'loan_repaid',
        'trust_score_change',
        'circle_invitation',
        'pool_contribution',
        'voting_started',
        'voting_completed',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    relatedModel: {
      type: String,
      enum: ['Loan', 'TrustCircle', 'User'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
