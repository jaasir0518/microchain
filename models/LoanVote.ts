import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoanVote extends Document {
  loanId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId;
  vote: 'approve' | 'reject';
  comment?: string;
  votedAt: Date;
}

const LoanVoteSchema = new Schema<ILoanVote>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
      index: true,
    },
    voterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vote: {
      type: String,
      enum: ['approve', 'reject'],
      required: true,
    },
    comment: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Ensure one vote per user per loan
LoanVoteSchema.index({ loanId: 1, voterId: 1 }, { unique: true });

const LoanVote: Model<ILoanVote> =
  mongoose.models.LoanVote || mongoose.model<ILoanVote>('LoanVote', LoanVoteSchema);

export default LoanVote;
