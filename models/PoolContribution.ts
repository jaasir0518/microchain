import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPoolContribution extends Document {
  circleId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  contributedAt: Date;
  trustScoreBonus: number;
}

const PoolContributionSchema = new Schema<IPoolContribution>(
  {
    circleId: {
      type: Schema.Types.ObjectId,
      ref: 'TrustCircle',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [100, 'Minimum contribution is ₹100'],
    },
    contributedAt: {
      type: Date,
      default: Date.now,
    },
    trustScoreBonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for analytics
PoolContributionSchema.index({ circleId: 1, contributedAt: -1 });
PoolContributionSchema.index({ userId: 1, contributedAt: -1 });

const PoolContribution: Model<IPoolContribution> =
  mongoose.models.PoolContribution ||
  mongoose.model<IPoolContribution>('PoolContribution', PoolContributionSchema);

export default PoolContribution;
