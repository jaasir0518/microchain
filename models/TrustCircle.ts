import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrustCircle extends Document {
  name: string;
  inviteCode: string;
  createdBy: mongoose.Types.ObjectId;
  poolBalance: number;
  maxMembers: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrustCircleSchema = new Schema<ITrustCircle>(
  {
    name: {
      type: String,
      required: [true, 'Circle name is required'],
      trim: true,
      minlength: [3, 'Circle name must be at least 3 characters'],
      maxlength: [50, 'Circle name cannot exceed 50 characters'],
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      length: 8,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    poolBalance: {
      type: Number,
      default: 0,
      min: [0, 'Pool balance cannot be negative'],
    },
    maxMembers: {
      type: Number,
      default: 20,
      min: 5,
      max: 50,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
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

// Index for faster lookups
TrustCircleSchema.index({ inviteCode: 1 });
TrustCircleSchema.index({ createdBy: 1 });

const TrustCircle: Model<ITrustCircle> =
  mongoose.models.TrustCircle || mongoose.model<ITrustCircle>('TrustCircle', TrustCircleSchema);

export default TrustCircle;
