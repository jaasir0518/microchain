import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICircleMember extends Document {
  userId: mongoose.Types.ObjectId;
  circleId: mongoose.Types.ObjectId;
  role: 'admin' | 'member';
  contributionAmount: number;
  joinedAt: Date;
  isActive: boolean;
}

const CircleMemberSchema = new Schema<ICircleMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    circleId: {
      type: Schema.Types.ObjectId,
      ref: 'TrustCircle',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    contributionAmount: {
      type: Number,
      default: 0,
      min: [0, 'Contribution cannot be negative'],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only be in a circle once
CircleMemberSchema.index({ userId: 1, circleId: 1 }, { unique: true });
CircleMemberSchema.index({ circleId: 1 });

const CircleMember: Model<ICircleMember> =
  mongoose.models.CircleMember || mongoose.model<ICircleMember>('CircleMember', CircleMemberSchema);

export default CircleMember;
