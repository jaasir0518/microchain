import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoan extends Document {
  circle: mongoose.Types.ObjectId;
  borrower: mongoose.Types.ObjectId;
  lender?: mongoose.Types.ObjectId;
  amount: number;
  purpose: string;
  trustScoreAtRequest: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'repaid' | 'defaulted' | 'voting';
  interestRate: number;
  durationDays: number;
  dueDate: Date;
  fundedAt?: Date;
  repaidAt?: Date;
  repaidAmount?: number;
  votes?: {
    userId: mongoose.Types.ObjectId;
    vote: 'approve' | 'reject';
    votedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    circle: {
      type: Schema.Types.ObjectId,
      ref: 'TrustCircle',
      required: true,
    },
    borrower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [500, 'Minimum loan amount is ₹500'],
      max: [8000, 'Maximum loan amount is ₹8000'],
    },
    purpose: {
      type: String,
      required: [true, 'Loan purpose is required'],
      trim: true,
      maxlength: [200, 'Purpose cannot exceed 200 characters'],
    },
    trustScoreAtRequest: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'repaid', 'defaulted', 'voting'],
      default: 'voting',
    },
    interestRate: {
      type: Number,
      default: 2,
      min: 0,
      max: 10,
    },
    durationDays: {
      type: Number,
      default: 30,
      min: 7,
      max: 90,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    fundedAt: {
      type: Date,
    },
    repaidAt: {
      type: Date,
    },
    repaidAmount: {
      type: Number,
      min: 0,
    },
    votes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        vote: {
          type: String,
          enum: ['approve', 'reject'],
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
LoanSchema.index({ circle: 1, status: 1 });
LoanSchema.index({ borrower: 1 });
LoanSchema.index({ lender: 1 });
LoanSchema.index({ dueDate: 1 });

const Loan: Model<ILoan> =
  mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);

export default Loan;
