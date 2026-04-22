# Trust Score System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Development Server

```bash
npm run dev
```

### Step 2: Test the System

Open your browser or use curl:

```bash
curl http://localhost:3000/api/trust/test
```

Or visit: `http://localhost:3000/api/trust/test`

Expected output:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "tests": [
    {
      "name": "ML Model Training and Prediction",
      "status": "PASSED",
      "results": [...]
    },
    {
      "name": "Post-Quantum Encryption",
      "status": "PASSED",
      "details": {...}
    },
    {
      "name": "Score Bounds (35-98)",
      "status": "PASSED",
      "results": [...]
    }
  ],
  "overallStatus": "ALL TESTS PASSED ✅"
}
```

### Step 2: Generate Keypair

```bash
curl http://localhost:3000/api/trust/keypair
```

Response:
```json
{
  "success": true,
  "publicKey": "...",
  "privateKey": "...",
  "message": "Keypair generated successfully"
}
```

### Step 3: Calculate Trust Score

```bash
curl -X POST http://localhost:3000/api/trust/calculate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "encryptedData": {
      "monthlyIncome": 20000,
      "avgTransactionAmount": 4000,
      "repaymentRate": 85,
      "latePayments": 2,
      "accountAgeMonths": 12,
      "totalTransactions": 50
    }
  }'
```

Response:
```json
{
  "success": true,
  "trustScore": 78,
  "message": "Trust score calculated successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Step 4: Watch Automatic Updates

The trust score automatically updates when users:

1. **Repay a loan on-time** → +8 points
2. **Contribute to circle** → +3 points
3. **Join a circle** → +2 points
4. **Get loan approved** → +1 point

No additional code needed - it's all automatic!

## 📝 Integration Examples

### Frontend: Profile Completion Form

```typescript
// components/ProfileCompletionForm.tsx
import { useState } from 'react';

export default function ProfileCompletionForm() {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    avgTransactionAmount: '',
    repaymentRate: '',
    latePayments: '',
    accountAgeMonths: '',
    totalTransactions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert to numbers
    const behavioralData = {
      monthlyIncome: Number(formData.monthlyIncome),
      avgTransactionAmount: Number(formData.avgTransactionAmount),
      repaymentRate: Number(formData.repaymentRate),
      latePayments: Number(formData.latePayments),
      accountAgeMonths: Number(formData.accountAgeMonths),
      totalTransactions: Number(formData.totalTransactions),
    };

    // For demo: send plain data (in production, encrypt first)
    const response = await fetch('/api/trust/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encryptedData: behavioralData }),
    });

    const result = await response.json();
    
    if (result.success) {
      alert(`Your Trust Score: ${result.trustScore}/100`);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Complete Your Profile</h2>
      
      <label>
        Monthly Income (₹):
        <input
          type="number"
          value={formData.monthlyIncome}
          onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
          required
        />
      </label>

      <label>
        Average Transaction Amount (₹):
        <input
          type="number"
          value={formData.avgTransactionAmount}
          onChange={(e) => setFormData({ ...formData, avgTransactionAmount: e.target.value })}
          required
        />
      </label>

      <label>
        Repayment Rate (%):
        <input
          type="number"
          min="0"
          max="100"
          value={formData.repaymentRate}
          onChange={(e) => setFormData({ ...formData, repaymentRate: e.target.value })}
          required
        />
      </label>

      <label>
        Late Payments Count:
        <input
          type="number"
          min="0"
          value={formData.latePayments}
          onChange={(e) => setFormData({ ...formData, latePayments: e.target.value })}
          required
        />
      </label>

      <label>
        Account Age (months):
        <input
          type="number"
          min="0"
          value={formData.accountAgeMonths}
          onChange={(e) => setFormData({ ...formData, accountAgeMonths: e.target.value })}
          required
        />
      </label>

      <label>
        Total Transactions:
        <input
          type="number"
          min="0"
          value={formData.totalTransactions}
          onChange={(e) => setFormData({ ...formData, totalTransactions: e.target.value })}
          required
        />
      </label>

      <button type="submit">Calculate Trust Score</button>
    </form>
  );
}
```

### Frontend: Display Trust Score

```typescript
// components/TrustScoreDisplay.tsx
import { useSession } from 'next-auth/react';

export default function TrustScoreDisplay() {
  const { data: session } = useSession();
  const trustScore = (session?.user as any)?.trustScore || 50;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="trust-score-card">
      <h3>Your Trust Score</h3>
      <div className={`score ${getScoreColor(trustScore)}`}>
        {trustScore}/100
      </div>
      <div className="score-label">
        {getScoreLabel(trustScore)}
      </div>
      <div className="score-bar">
        <div 
          className="score-fill" 
          style={{ width: `${trustScore}%` }}
        />
      </div>
    </div>
  );
}
```

### Backend: Manual Score Update

```typescript
// Example: Manually update score for loan default
import { updateTrustScore, TrustScoreActions } from '@/lib/trust-utils';

async function handleLoanDefault(loanId: string) {
  const loan = await Loan.findById(loanId);
  
  // Update loan status
  loan.status = 'defaulted';
  await loan.save();
  
  // Decrease trust score
  await updateTrustScore(
    loan.userId.toString(),
    TrustScoreActions.LOAN_DEFAULTED.reason,
    TrustScoreActions.LOAN_DEFAULTED.points
  );
}
```

## 🎯 Common Use Cases

### Use Case 1: New User Onboarding

```typescript
// After user registers
1. Redirect to /profile/complete
2. User fills behavioral data form
3. Submit to /api/trust/calculate
4. Score calculated and stored
5. Redirect to /dashboard
```

### Use Case 2: Loan Repayment

```typescript
// Automatic - no code needed
User repays loan → API automatically updates score
```

### Use Case 3: View Trust History

```typescript
// Get user's trust history
const user = await User.findById(userId);
const history = user.trustHistory;

// Display timeline
history.forEach(entry => {
  console.log(`${entry.date}: ${entry.reason} → Score: ${entry.score}`);
});
```

## 🔐 Production Encryption Flow

For production, use full encryption:

```typescript
// Client-side
import { encryptBehavioralData } from '@/lib/encryption';

// 1. Get keypair
const keypairRes = await fetch('/api/trust/keypair');
const { publicKey, privateKey } = await keypairRes.json();

// 2. Encrypt data
const encrypted = encryptBehavioralData(behavioralData, publicKey);

// 3. Send encrypted data
const response = await fetch('/api/trust/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    encryptedData: encrypted,
    privateKey // Server needs this to decrypt
  }),
});
```

## 📊 Monitoring Trust Scores

### Get User's Current Score

```typescript
const user = await User.findById(userId);
console.log(`Trust Score: ${user.trustScore}`);
```

### Get Score History

```typescript
const user = await User.findById(userId);
user.trustHistory.forEach(entry => {
  console.log(`${entry.date}: ${entry.reason} → ${entry.score}`);
});
```

### Get Statistics

```typescript
const user = await User.findById(userId);
console.log({
  currentScore: user.trustScore,
  totalLoans: user.totalLoansTaken,
  repaidLoans: user.totalLoansRepaid,
  onTimePayments: user.onTimeRepayments,
  lastStatementUpload: user.lastStatementUploadedAt,
});
```

## 🐛 Troubleshooting

### Issue: "Unauthorized"
**Solution**: Ensure user is logged in and session token is valid.

### Issue: "Invalid behavioral data format"
**Solution**: Check all fields are numbers:
```typescript
{
  monthlyIncome: 20000,        // ✅ number
  avgTransactionAmount: 4000,  // ✅ number
  repaymentRate: 85,           // ✅ number
  latePayments: 2,             // ✅ number
  accountAgeMonths: 12,        // ✅ number
  totalTransactions: 50        // ✅ number
}
```

### Issue: Score not updating
**Solution**: Check that the action is triggering the update function:
```typescript
// Verify this is called
await updateTrustScore(userId, action, points);
```

## 📚 Next Steps

1. **Build Profile Completion UI** - Create the form for users to input data
2. **Add Trust Score Dashboard** - Display score, history, and statistics
3. **Implement Notifications** - Alert users when score changes
4. **Add Visualizations** - Charts showing score progression
5. **Create Mobile App** - React Native version

## 🎉 You're Ready!

The Trust Score system is fully functional and integrated. All loan and circle operations automatically update scores. Just build the UI and you're good to go!

For detailed documentation, see:
- **TRUST_SCORE_SYSTEM.md** - Complete technical guide
- **TRUST_SCORE_FLOW.md** - Visual flow diagrams
- **TRUST_SCORE_IMPLEMENTATION_SUMMARY.md** - Implementation details
