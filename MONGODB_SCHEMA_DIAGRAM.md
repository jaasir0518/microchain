# 📊 MongoDB Schema Diagram

## Database: micro-trust-circles

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MongoDB Atlas Cloud                              │
│                    micro-trust-circles Database                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           COLLECTIONS (7)                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│       USERS             │  ← Core user data & trust scores
├─────────────────────────┤
│ _id: ObjectId          │
│ name: string           │
│ email: string (unique) │  🔑 Index
│ password: string       │  🔒 Hashed
│ phone: string          │
│ trustScore: number     │  📊 0-100
│ trustHistory: []       │
│ totalLoansTaken: num   │
│ totalLoansRepaid: num  │
│ onTimeRepayments: num  │
│ isVerified: boolean    │
│ createdAt: Date        │
│ updatedAt: Date        │
└─────────────────────────┘
         │
         │ creates
         ↓
┌─────────────────────────┐
│    TRUST CIRCLES        │  ← Lending groups
├─────────────────────────┤
│ _id: ObjectId          │
│ name: string           │
│ inviteCode: string     │  🔑 Index (unique, 8 chars)
│ createdBy: ObjectId    │  → User._id
│ poolBalance: number    │  💰 ₹
│ maxMembers: number     │  👥 5-50
│ description: string    │
│ isActive: boolean      │
│ createdAt: Date        │
│ updatedAt: Date        │
└─────────────────────────┘
         │
         │ has many
         ↓
┌─────────────────────────┐
│   CIRCLE MEMBERS        │  ← User-Circle relationships
├─────────────────────────┤
│ _id: ObjectId          │
│ userId: ObjectId       │  → User._id
│ circleId: ObjectId     │  → TrustCircle._id
│ role: enum             │  admin | member
│ contributionAmount: #  │  💰 Total contributed
│ joinedAt: Date         │
│ isActive: boolean      │
└─────────────────────────┘
         🔑 Compound Index: {userId, circleId} (unique)

         ↓
┌─────────────────────────┐
│        LOANS            │  ← Loan requests & lifecycle
├─────────────────────────┤
│ _id: ObjectId          │
│ circleId: ObjectId     │  → TrustCircle._id
│ userId: ObjectId       │  → User._id (borrower)
│ amount: number         │  💰 ₹500-8000
│ purpose: string        │
│ trustScoreAtRequest: # │  📊 Snapshot
│ status: enum           │  pending|approved|rejected|repaid|defaulted|voting
│ interestRate: number   │  📈 Default: 2%
│ dueDate: Date          │
│ repaidAt: Date         │
│ repaidAmount: number   │
│ createdAt: Date        │
│ updatedAt: Date        │
└─────────────────────────┘
         🔑 Indexes: {circleId, status}, userId, dueDate
         │
         │ receives
         ↓
┌─────────────────────────┐
│      LOAN VOTES         │  ← Democratic voting
├─────────────────────────┤
│ _id: ObjectId          │
│ loanId: ObjectId       │  → Loan._id
│ voterId: ObjectId      │  → User._id
│ vote: enum             │  approve | reject
│ comment: string        │  Optional, max 200 chars
│ votedAt: Date          │
└─────────────────────────┘
         🔑 Compound Index: {loanId, voterId} (unique)

┌─────────────────────────┐
│  POOL CONTRIBUTIONS     │  ← Track deposits
├─────────────────────────┤
│ _id: ObjectId          │
│ circleId: ObjectId     │  → TrustCircle._id
│ userId: ObjectId       │  → User._id
│ amount: number         │  💰 Min ₹100
│ contributedAt: Date    │
│ trustScoreBonus: num   │  📊 0-5 points
└─────────────────────────┘
         🔑 Indexes: {circleId, contributedAt}, {userId, contributedAt}

┌─────────────────────────┐
│    NOTIFICATIONS        │  ← Real-time alerts
├─────────────────────────┤
│ _id: ObjectId          │
│ userId: ObjectId       │  → User._id
│ type: enum             │  9 types
│ title: string          │
│ message: string        │
│ relatedId: ObjectId    │  → Loan/Circle/User
│ relatedModel: string   │
│ isRead: boolean        │
│ metadata: object       │  Flexible JSON
│ createdAt: Date        │
└─────────────────────────┘
         🔑 Compound Index: {userId, isRead, createdAt}
```

---

## 🔗 Relationship Flow

```
┌──────────┐
│   USER   │
└────┬─────┘
     │
     ├─── creates ────────────────────────────────┐
     │                                             ↓
     │                                    ┌─────────────────┐
     │                                    │  TRUST CIRCLE   │
     │                                    └────────┬────────┘
     │                                             │
     ├─── joins (via CircleMember) ───────────────┤
     │                                             │
     │                                             ├─── contains ───┐
     │                                             │                ↓
     │                                             │         ┌──────────┐
     ├─── requests ────────────────────────────────┼────────→│   LOAN   │
     │                                             │         └─────┬────┘
     │                                             │               │
     ├─── votes on (via LoanVote) ────────────────┘               │
     │                                                              │
     ├─── contributes to (via PoolContribution) ───────────────────┘
     │
     └─── receives (Notifications) ───────────────────────────────────┐
                                                                       ↓
                                                              ┌──────────────┐
                                                              │ NOTIFICATION │
                                                              └──────────────┘
```

---

## 📊 Data Flow Example

### Loan Request Flow

```
1. USER requests loan
   ↓
   Creates LOAN document
   status: 'voting'
   
2. System notifies circle members
   ↓
   Creates NOTIFICATION documents
   type: 'voting_started'
   
3. Members cast votes
   ↓
   Creates LOAN VOTE documents
   vote: 'approve' | 'reject'
   
4. Voting completes (majority reached)
   ↓
   Updates LOAN document
   status: 'approved' | 'rejected'
   
5. If approved, funds disbursed
   ↓
   Updates TRUST CIRCLE
   poolBalance -= loan.amount
   
6. Borrower repays
   ↓
   Updates LOAN document
   status: 'repaid'
   repaidAt: Date
   
   Updates USER document
   trustScore += bonus
   totalLoansRepaid++
   
   Updates TRUST CIRCLE
   poolBalance += repaidAmount
```

---

## 🔑 Index Strategy

### Primary Indexes (Unique)

```
users.email                    → Fast login lookup
trustcircles.inviteCode        → Fast circle join
circlemembers.{userId,circleId} → Prevent duplicate membership
loanvotes.{loanId,voterId}     → One vote per user per loan
```

### Query Optimization Indexes

```
loans.{circleId,status}        → List active loans in circle
loans.userId                   → User's loan history
loans.dueDate                  → Find overdue loans
notifications.{userId,isRead,createdAt} → Unread notifications
poolcontributions.{circleId,contributedAt} → Circle contribution history
```

---

## 💾 Storage Breakdown

### Per Circle (10 members, 1 month activity)

```
┌─────────────────────┬──────────┬─────────┐
│ Collection          │ Count    │ Size    │
├─────────────────────┼──────────┼─────────┤
│ Users               │ 10       │ 20 KB   │
│ TrustCircle         │ 1        │ 1 KB    │
│ CircleMembers       │ 10       │ 5 KB    │
│ Loans               │ 20       │ 20 KB   │
│ LoanVotes           │ 100      │ 30 KB   │
│ PoolContributions   │ 50       │ 20 KB   │
│ Notifications       │ 200      │ 100 KB  │
├─────────────────────┼──────────┼─────────┤
│ TOTAL               │ 391      │ 196 KB  │
└─────────────────────┴──────────┴─────────┘
```

### Scalability Estimates

```
100 circles × 196 KB = 19.6 MB
1,000 circles × 196 KB = 196 MB
10,000 circles × 196 KB = 1.96 GB

MongoDB Atlas Free Tier: 512 MB
→ Supports ~2,600 active circles
```

---

## 🔐 Security Features

```
┌─────────────────────────────────────────┐
│         Security Layers                  │
├─────────────────────────────────────────┤
│ 1. Password Hashing (bcrypt)           │
│    - Salt rounds: 10                    │
│    - Never stored in plaintext          │
│                                          │
│ 2. Client-side Encryption (Kyber)      │
│    - Post-quantum secure                │
│    - Behavioral data encrypted          │
│                                          │
│ 3. Schema Validation                    │
│    - Type checking                      │
│    - Range validation                   │
│    - Required fields                    │
│                                          │
│ 4. Unique Constraints                   │
│    - Prevent duplicates                 │
│    - Data integrity                     │
│                                          │
│ 5. Authentication Required              │
│    - All API routes protected           │
│    - NextAuth session validation        │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Commands

```bash
# Setup & verify database
npm run db:setup

# Check connection
npx tsx -e "import connectDB from './lib/mongoose'; await connectDB();"

# Create indexes
npx tsx -e "import User from './models/User'; await User.createIndexes();"

# Get stats
npx tsx scripts/setup-mongodb.ts
```

---

**Database**: `micro-trust-circles`  
**Connection**: MongoDB Atlas  
**Models**: 7 collections  
**Total Indexes**: 15+  
**Average Circle Storage**: ~196 KB
