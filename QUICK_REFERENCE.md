# Quick Reference Card - Phase 1

## 🚀 Start Development
```bash
npm run dev
# Server runs on http://localhost:3000
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `models/TrustCircle.ts` | Circle schema |
| `models/CircleMember.ts` | Membership schema |
| `models/Loan.ts` | Loan schema |
| `lib/encryption.ts` | Post-quantum crypto |
| `lib/ml-model.ts` | AI trust scoring |
| `app/api/circles/` | Circle APIs |
| `app/api/loans/` | Loan APIs |
| `app/api/trust/` | Trust score APIs |

## 🔐 Encryption Flow
```typescript
// 1. Generate keys
GET /api/trust/keypair
→ { publicKey, privateKey }

// 2. Encrypt data (client)
import { encryptBehavioralData } from '@/lib/encryption';
const encrypted = encryptBehavioralData(data, publicKey);

// 3. Send to server
POST /api/trust/calculate
{ encryptedData, privateKey }
→ { trustScore: 78 }
```

## 🤖 Trust Score
```typescript
// Input features
{
  pastRepaymentRate: 85,    // 0-100%
  onTimeRepayments: 12,     // count
  latePayments: 1,          // count
  circleActivity: 5,        // count
  incomeStability: 75,      // 0-100
  defaultHistory: 0,        // 0 or 1
  accountAge: 180,          // days
  contributionAmount: 2000  // ₹
}

// Output
trustScore: 78  // 0-100
eligible: true  // ≥70
```

## 👥 Circle Operations
```bash
# Create
POST /api/circles
{ name, description, maxMembers, initialPoolBalance }

# Join
POST /api/circles/join
{ inviteCode: "ABC12XYZ" }

# View
GET /api/circles/{id}

# Contribute
POST /api/circles/{id}/contribute
{ amount: 2000 }
```

## 💰 Loan Operations
```bash
# Request
POST /api/loans/request
{ circleId, amount, purpose, durationDays }

# List
GET /api/loans?circleId={id}&status=approved

# Approve (admin)
POST /api/loans/{id}/approve

# Repay
POST /api/loans/{id}/repay
```

## 📊 Key Thresholds

| Parameter | Value |
|-----------|-------|
| Min Loan | ₹500 |
| Max Loan | ₹8,000 |
| Auto-Approval | Score ≥70 |
| Interest Rate | 2% |
| Loan Duration | 30 days |
| Circle Size | 5-50 members |

## 🔄 Loan Lifecycle
```
Request → Pending/Approved → Disbursed → Repaid
         ↓                              ↓
    (if score ≥70)                 +2% interest
    Auto-approve                   Trust score +5
```

## 🧪 Test Commands
```bash
# Run feature tests
npx ts-node scripts/test-phase1.ts

# Test encryption
curl http://localhost:3000/api/trust/keypair

# Create circle
curl -X POST http://localhost:3000/api/circles \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","initialPoolBalance":10000}'
```

## 📈 Trust Score Updates
- On-time repayment: +5 points
- Late repayment: +2 points
- Default: -10 points (future)
- Max score: 100
- Min score: 0

## 🎯 Auto-Approval Logic
```typescript
if (trustScore >= 70) {
  loan.status = 'approved';
  circle.poolBalance -= loan.amount;
} else {
  loan.status = 'pending';
  // Admin approval needed
}
```

## 💡 Common Patterns

### Create Circle & Add Members
```typescript
// 1. Create
const circle = await fetch('/api/circles', {
  method: 'POST',
  body: JSON.stringify({ name: 'Family', initialPoolBalance: 10000 })
});

// 2. Share invite code
const { inviteCode } = await circle.json();

// 3. Members join
await fetch('/api/circles/join', {
  method: 'POST',
  body: JSON.stringify({ inviteCode })
});
```

### Request & Repay Loan
```typescript
// 1. Request
const loan = await fetch('/api/loans/request', {
  method: 'POST',
  body: JSON.stringify({
    circleId: 'xxx',
    amount: 3000,
    purpose: 'Emergency'
  })
});

// 2. Repay (after 30 days)
await fetch(`/api/loans/${loanId}/repay`, {
  method: 'POST'
});
// Repays ₹3,060 (₹3,000 + 2%)
```

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Unauthorized" | Login first |
| "Circle not found" | Check circle ID |
| "Insufficient pool" | Contribute more |
| "Active loan exists" | Repay first |
| "Invalid invite code" | Check 8-char code |

## 📚 Documentation

- `PHASE1_IMPLEMENTATION.md` - Full technical guide
- `API_TESTING_GUIDE.md` - API testing
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `README.md` - Project overview

## 🎓 For Presentations

**Key Points:**
1. Post-quantum security (Kyber)
2. AI trust scoring (8 features)
3. Auto-approval (score ≥70)
4. Self-sustaining pool (+2% interest)
5. Privacy-first (client-side encryption)

**Demo Flow:**
1. Show encryption working
2. Calculate trust score
3. Create circle
4. Request loan (auto-approved)
5. Repay loan (score increases)

## 🚀 Next: Frontend

Build UI for:
- Dashboard
- Circle management
- Loan forms
- Trust score display
- Analytics

---

**Quick Start**: `npm run dev` → Test APIs → Build Frontend → Present! 🎉
