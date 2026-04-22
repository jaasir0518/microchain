# 🚀 MongoDB Quick Reference

## Setup & Verification

```bash
# Run MongoDB setup and verification
npm run db:setup

# Or directly with tsx
npx tsx scripts/setup-mongodb.ts
```

---

## 📊 Collections Overview

| Collection | Purpose | Avg Size | Key Indexes |
|------------|---------|----------|-------------|
| **users** | User accounts & trust scores | 2KB | email (unique) |
| **trustcircles** | Lending groups | 1KB | inviteCode (unique) |
| **circlemembers** | User-circle relationships | 500B | userId+circleId (unique) |
| **loans** | Loan requests & status | 1KB | circleId+status |
| **loanvotes** | Democratic voting | 300B | loanId+voterId (unique) |
| **poolcontributions** | Pool deposits | 400B | circleId+date |
| **notifications** | User alerts | 500B | userId+isRead+date |

---

## 🔍 Common Queries

### Users

```typescript
// Get user with trust history
const user = await User.findById(userId);

// Find by email
const user = await User.findOne({ email: 'user@example.com' });

// Update trust score
await User.findByIdAndUpdate(userId, {
  trustScore: 75,
  $push: {
    trustHistory: {
      score: 75,
      reason: 'Loan repaid on time',
      date: new Date()
    }
  }
});
```

### Trust Circles

```typescript
// Create circle
const circle = await TrustCircle.create({
  name: 'Family Circle',
  inviteCode: 'ABC12345',
  createdBy: userId,
  maxMembers: 20
});

// Find by invite code
const circle = await TrustCircle.findOne({ inviteCode: 'ABC12345' });

// Get all active circles
const circles = await TrustCircle.find({ isActive: true });
```

### Circle Members

```typescript
// Add member to circle
await CircleMember.create({
  userId,
  circleId,
  role: 'member'
});

// Get all members of a circle
const members = await CircleMember.find({ circleId })
  .populate('userId', 'name email trustScore')
  .lean();

// Check if user is in circle
const isMember = await CircleMember.exists({ userId, circleId });
```

### Loans

```typescript
// Request loan
const loan = await Loan.create({
  circleId,
  userId,
  amount: 5000,
  purpose: 'Medical emergency',
  trustScoreAtRequest: 75,
  status: 'voting',
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
});

// Get active loans in circle
const loans = await Loan.find({
  circleId,
  status: { $in: ['pending', 'approved', 'voting'] }
})
  .populate('userId', 'name trustScore')
  .sort({ createdAt: -1 });

// Approve loan
await Loan.findByIdAndUpdate(loanId, { status: 'approved' });

// Repay loan
await Loan.findByIdAndUpdate(loanId, {
  status: 'repaid',
  repaidAt: new Date(),
  repaidAmount: 5100
});
```

### Loan Votes

```typescript
// Cast vote
await LoanVote.create({
  loanId,
  voterId: userId,
  vote: 'approve',
  comment: 'Good repayment history'
});

// Get votes for loan
const votes = await LoanVote.find({ loanId })
  .populate('voterId', 'name')
  .lean();

// Count votes
const approvals = await LoanVote.countDocuments({ loanId, vote: 'approve' });
const rejections = await LoanVote.countDocuments({ loanId, vote: 'reject' });
```

### Pool Contributions

```typescript
// Add contribution
await PoolContribution.create({
  circleId,
  userId,
  amount: 1000,
  trustScoreBonus: 2
});

// Get user's contributions
const contributions = await PoolContribution.find({ userId })
  .sort({ contributedAt: -1 });

// Get circle's total contributions
const total = await PoolContribution.aggregate([
  { $match: { circleId: new mongoose.Types.ObjectId(circleId) } },
  { $group: { _id: null, total: { $sum: '$amount' } } }
]);
```

### Notifications

```typescript
// Create notification
await Notification.create({
  userId,
  type: 'loan_approved',
  title: 'Loan Approved!',
  message: 'Your loan request of ₹5000 has been approved',
  relatedId: loanId,
  relatedModel: 'Loan'
});

// Get unread notifications
const notifications = await Notification.find({
  userId,
  isRead: false
})
  .sort({ createdAt: -1 })
  .limit(20);

// Mark as read
await Notification.updateMany(
  { userId, isRead: false },
  { isRead: true }
);
```

---

## 🔗 Relationships & Joins

### Get Circle with Members and Loans

```typescript
const circle = await TrustCircle.findById(circleId);

const members = await CircleMember.find({ circleId })
  .populate('userId', 'name email trustScore')
  .lean();

const loans = await Loan.find({ circleId })
  .populate('userId', 'name')
  .sort({ createdAt: -1 })
  .lean();

const result = {
  ...circle.toObject(),
  members,
  loans
};
```

### Get Loan with Votes and Borrower

```typescript
const loan = await Loan.findById(loanId)
  .populate('userId', 'name email trustScore')
  .populate('circleId', 'name')
  .lean();

const votes = await LoanVote.find({ loanId })
  .populate('voterId', 'name')
  .lean();

const result = {
  ...loan,
  votes,
  approvals: votes.filter(v => v.vote === 'approve').length,
  rejections: votes.filter(v => v.vote === 'reject').length
};
```

---

## 📈 Analytics Queries

### User Statistics

```typescript
// Get user's loan statistics
const stats = await Loan.aggregate([
  { $match: { userId: new mongoose.Types.ObjectId(userId) } },
  {
    $group: {
      _id: null,
      totalLoans: { $sum: 1 },
      totalBorrowed: { $sum: '$amount' },
      repaidLoans: {
        $sum: { $cond: [{ $eq: ['$status', 'repaid'] }, 1, 0] }
      },
      activeLoans: {
        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
      }
    }
  }
]);
```

### Circle Analytics

```typescript
// Get circle statistics
const circleStats = {
  memberCount: await CircleMember.countDocuments({ circleId }),
  totalContributions: await PoolContribution.aggregate([
    { $match: { circleId: new mongoose.Types.ObjectId(circleId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]),
  activeLoans: await Loan.countDocuments({ 
    circleId, 
    status: { $in: ['approved', 'voting'] } 
  }),
  totalLoansIssued: await Loan.countDocuments({ circleId })
};
```

---

## 🛠️ Maintenance

### Create All Indexes

```typescript
await Promise.all([
  User.createIndexes(),
  TrustCircle.createIndexes(),
  CircleMember.createIndexes(),
  Loan.createIndexes(),
  LoanVote.createIndexes(),
  PoolContribution.createIndexes(),
  Notification.createIndexes()
]);
```

### Check Connection

```typescript
import mongoose from 'mongoose';
import connectDB from './lib/mongoose';

await connectDB();
console.log('Connected:', mongoose.connection.readyState === 1);
console.log('Database:', mongoose.connection.db.databaseName);
```

### Get Collection Stats

```typescript
const stats = await mongoose.connection.db
  .collection('users')
  .stats();

console.log('Documents:', stats.count);
console.log('Size:', stats.size);
console.log('Indexes:', stats.nindexes);
```

---

## 🔐 Security Best Practices

1. **Never select password by default**
   ```typescript
   // Password is excluded by default (select: false in schema)
   const user = await User.findById(userId); // No password
   
   // Explicitly include if needed
   const userWithPassword = await User.findById(userId).select('+password');
   ```

2. **Use lean() for read-only operations**
   ```typescript
   // 30% faster, returns plain JavaScript objects
   const users = await User.find().lean();
   ```

3. **Validate before saving**
   ```typescript
   // Mongoose validates automatically
   const user = new User({ email: 'invalid' }); // Will throw validation error
   await user.save();
   ```

4. **Use transactions for critical operations**
   ```typescript
   const session = await mongoose.startSession();
   session.startTransaction();
   
   try {
     await Loan.create([{ ... }], { session });
     await TrustCircle.updateOne({ ... }, { session });
     await session.commitTransaction();
   } catch (error) {
     await session.abortTransaction();
     throw error;
   } finally {
     session.endSession();
   }
   ```

---

## 📚 Resources

- **Setup Script**: `npm run db:setup`
- **Full Guide**: `MONGODB_GUIDE.md`
- **Models**: `models/` directory
- **Connection**: `lib/mongoose.ts`

---

**Connection String**: Check `.env` file  
**Database**: `micro-trust-circles`  
**Driver**: Mongoose 8.x
