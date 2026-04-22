import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ITrustHistory {
  score: number;
  reason: string;
  date: Date;
}

export interface IBehavioralData {
  monthlyIncome: number;
  avgTransactionAmount: number;
  repaymentRate: number;
  latePayments: number;
  accountAgeMonths: number;
  totalTransactions: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  trustScore: number;
  trustHistory: ITrustHistory[];
  lastStatementUploadedAt?: Date;
  totalLoansTaken: number;
  totalLoansRepaid: number;
  onTimeRepayments: number;
  totalLent: number;
  behavioralData?: IBehavioralData;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    trustScore: {
      type: Number,
      default: 50, // Initial trust score
      min: 0,
      max: 100,
    },
    trustHistory: [
      {
        score: { type: Number, required: true },
        reason: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    lastStatementUploadedAt: {
      type: Date,
    },
    totalLoansTaken: {
      type: Number,
      default: 0,
    },
    totalLoansRepaid: {
      type: Number,
      default: 0,
    },
    onTimeRepayments: {
      type: Number,
      default: 0,
    },
    totalLent: {
      type: Number,
      default: 0,
    },
    behavioralData: {
      monthlyIncome: { type: Number },
      avgTransactionAmount: { type: Number },
      repaymentRate: { type: Number },
      latePayments: { type: Number },
      accountAgeMonths: { type: Number },
      totalTransactions: { type: Number },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
