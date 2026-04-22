# 📊 MongoDB Database Guide

## Overview

This P2P lending platform uses **MongoDB Atlas** for data storage with 7 core collections supporting the complete lending lifecycle.

**Database**: `micro-trust-circles`  
**Connection**: MongoDB Atlas (Cloud)

---

## 🗄️ Collections Structure

### 1. Users Collection

**Purpose**: Core user authentication and trust profile data

```typescript
{
  _id: ObjectId,
  name: string,              // 2-50 chars
  email: string,             // unique, lowercase
  password: string,          // bcrypt hashed
  phone?: string,            // 10 digits
  trustScore: number,        // 0-100, default: 50
  trustHistory: [{
    score: number,
    reason: string,
    date: Date
  }],
  lastStatementUploadedAt?: Date,
  totalLoansTaken: number,   // default: 0
  totalLoansRepaid: number,  // default: 0
  onTimeRepayments: number,  // default: 0
  isVerified: boolean,       // default: false
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique)
- `_id` (default)

**Storage**: ~2KB per user

---

### 2. TrustCircle Collection

**Purpose**: Private lending group information

```typescript
{
  _id: ObjectId,
  name: string,              // 3-50 chars
  inviteCode: string,        // 8 chars, unique, uppercase
  createdBy: ObjectId,       // ref: User
  poolBalance: number,       // ₹, min: 0
  maxMembers: number,        // 5-50, default: 20
  description?: string,      // max 200 chars
  isActive: boolean,         // default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `inviteCode` (unique)
- `createdBy`

**Storage**: ~1KB per circle

---

### 3. CircleMember Collection

**Purpose**: Membership relationships between users and circles

```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: User
  circleId: ObjectId,        // ref: TrustCircle
  role: 'admin' | 'member',  // default: 'member'
  contributionAmount: number, // total contributed, min: 0
  joinedAt: Date,
  isActive: boolean,         // default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{userId, circleId}` (compound, unique)
- `circleId`

**Storage**: ~500B per membership

---

### 4. Loan Collection

**Purpose**: Loan requests and lifecycle tracking

```typescript
{
  _id: ObjectId,
  circleId: ObjectId,        // ref: TrustCircle
  userId: ObjectId,          // ref: User
  amount: number,            // ₹500-8000
  purpose: string,           // max 200 chars
  trustScoreAtRequest: number, // 0-100
  status: 'pending' | 'approved' | 'rejected' | 'repaid' | 'defaulted' | 'voting',
  interestRate: number,      // default: 2%
  dueDate: Date,
  repaidAt?: Date,
  repaidAmount?: number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{circleId, status}` (compound)
- `userId`
- `dueDate`

**Storage**: ~1KB per loan

---

### 5. LoanVote Collection

**Purpose**: Democratic voting on loan requests

```typescript
{
  _id: ObjectId,
  loanId: ObjectId,          // ref: Loan
  voterId: ObjectId,         // ref: User
  vote: 'approve' | 'reject',
  comment?: string,          // max 200 chars
  votedAt: Date
}
```

**Indexes**:
- `{loanId, voterId}` (compound, unique)
- `loanId`

**Storage**: ~300B per vote

---

### 6. PoolContribution Collection

**Purpose**: Track all contributions to circle pools

```typescript
{
  _id: ObjectId,
  circleId: ObjectId,        // ref: TrustCircle
  userId: ObjectId,          // ref: User
  amount: number,            // min: ₹100
  contributedAt: Date,
  trustScoreBonus: number    // 0-5 points
}
```

**Indexes**:
- `{circleId, contributedAt}` (compound)
- `{userId, contributedAt}` (compound)
- `circleId`
- `userId`

**Storage**: ~400B per contribution

---

### 7. Notification Collection

**Purpose**: Real-time user notifications

```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: User
  type: 'loan_request' | 'loan_approved' | 'loan_rejected' | 
        'loan_repaid' | 'trust_score_change' | 'circle_invitation' |
        'pool_contribution' | 'voting_started' | 'voting_completed',
  title: string,             // max 100 chars
  message: string,           // max 500 chars
  relatedId?: ObjectId,      // Loan/Circle/User ID
  relatedModel?: 'Loan' | 'TrustCircle' | 'User',
  isRead: boolean,           // default: false
  metadata?: object,         // flexible JSON
  createdAt: Date
}
```

**Indexes**:
- `{userId, isRead, createdAt}` (compound)
- `userId`
- `isRead`

**Storage**: ~500B per notification

---

## 🔗 Data Relationships

```
User (1) ──creates──> (N) TrustCircle
User (N) ──joins──> (N) TrustCircle (via CircleMember)
User (1) ──requests──> (N) Loan
TrustCircle (1) ──contains──> (N) Loan
Loan (1) ──receives──> (N) LoanVote
User (1) ──contributes──> (N) PoolContribution
User (1) ──receives──> (N) Notification
```

---

## 📈 Storage Estimates

**For a typical circle with 10 members**:

| Collection | Size |
|------------|------|
| Users | 20 KB (10 × 2KB) |
| TrustCircle | 1 KB |
| CircleMembers | 5 KB (10 × 500B) |
| Loans | 20 KB (20 loans) |
| LoanVotes | 30 KB (100 votes) |
| PoolContributions | 20 KB (50 contributions) |
| Notifications | 100 KB (200 notifications) |
| **Total** | **~196 KB** |

---

## 🔐 Security Features

1. **Password Hashing**: bcrypt with salt rounds (10)
2. **Encryption**: Client-side Kyber encryption for sensitive data
3. **No PII Storage**: Only trust scores stored, not raw transaction data
4. **Authentication**: All operations require valid session
5. **Unique Constraints**: Prevent duplicate memberships and votes

---

## 🚀 Setup & Verification

### Run Setup Script

```bash
npx tsx scripts/setup-mongodb.ts
```

This will:
- ✅ Connect to MongoDB Atlas
- ✅ Verify all collections exist
- ✅ Create/verify all indexes
- ✅ Display database statistics
- ✅ Show storage usage

### Expected Output

```
🚀 Starting MongoDB Setup...

✅ Connected to MongoDB Atlas
📦 Database: micro-trust-circles

📊 Collections Found: 7
   - users
   - trustcircles
   - circlemembers
   - loans
   - loanvotes
   - poolcontributions
   - notifications

🔍 Verifying Indexes...

✅ User
   Documents: 0
   Size: 0 B
   Indexes: 2
   Index Names: _id_, email_1

...

✨ MongoDB setup completed successfully!
```

---

## 🔍 Common Queries

### Get User with Trust History

```typescript
const user = await User.findById(userId)
  .select('+password') // Include password if needed
  .lean();
```

### Get Circle with Members

```typescript
const members = await CircleMember.find({ circleId })
  .populate('userId', 'name email trustScore')
  .lean();
```

### Get Active Loans in Circle

```typescript
const loans = await Loan.find({
  circleId,
  status: { $in: ['pending', 'approved', 'voting'] }
})
  .populate('userId', 'name trustScore')
  .sort({ createdAt: -1 })
  .lean();
```

### Get Unread Notifications

```typescript
const notifications = await Notification.find({
  userId,
  isRead: false
})
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();
```

### Get Loan with Votes

```typescript
const votes = await LoanVote.find({ loanId })
  .populate('voterId', 'name')
  .lean();
```

---

## 🛠️ Maintenance

### Create Indexes Manually

```typescript
await User.createIndexes();
await TrustCircle.createIndexes();
await CircleMember.createIndexes();
await Loan.createIndexes();
await LoanVote.createIndexes();
await PoolContribution.createIndexes();
await Notification.createIndexes();
```

### Check Index Usage

```bash
# In MongoDB Atlas UI
db.loans.getIndexes()
db.loans.stats()
```

### Backup Database

```bash
# Using mongodump (requires MongoDB tools)
mongodump --uri="mongodb+srv://..." --db=micro-trust-circles
```

---

## 📊 Performance Tips

1. **Use Lean Queries**: Add `.lean()` for read-only operations (30% faster)
2. **Select Fields**: Only fetch needed fields with `.select()`
3. **Limit Results**: Always use `.limit()` for lists
4. **Index Coverage**: Ensure queries use indexes (check with `.explain()`)
5. **Batch Operations**: Use `bulkWrite()` for multiple updates

---

## 🔗 Connection String

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/micro-trust-circles
```

**Current**: `mongodb+srv://mohamedjaasir2k5_db_user:jaasir2005@microchain.rkonfon.mongodb.net/micro-trust-circles`

---

## 📚 Resources

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes/)
- [Query Performance](https://docs.mongodb.com/manual/tutorial/optimize-query-performance-with-indexes-and-projections/)

---

**Last Updated**: Phase 2 Complete  
**Database Version**: MongoDB 6.0+  
**Driver**: Mongoose 8.x
