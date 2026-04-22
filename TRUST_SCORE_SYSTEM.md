# Trust Score System Documentation

## Overview

The Trust Score system is a core feature of MicroChain that uses **Post-Quantum Cryptography** and **AI/ML** to calculate and dynamically update user creditworthiness scores (0-100).

## Architecture Flow

### 1. Initial Trust Score Calculation

```
User Login → Profile Completion → Upload Statement Data → 
Encrypt (Kyber) → Send to Server → Decrypt → AI Model → 
Calculate Score → Store Score Only (Discard Raw Data)
```

### 2. Dynamic Score Updates

Trust scores automatically adjust based on user actions:

- **Loan Repaid On-Time**: +8 points
- **Late Payment**: -12 points
- **Loan Completed**: +5 points
- **Loan Default**: -25 points
- **Circle Contribution**: +3 points
- **Circle Joined**: +2 points
- **Loan Approved**: +1 point

## Components

### 1. User Model (`models/User.ts`)

Extended with trust score fields:

```typescript
{
  trustScore: number (0-100, default: 50),
  trustHistory: [{
    score: number,
    reason: string,
    date: Date
  }],
  lastStatementUploadedAt: Date,
  totalLoansTaken: number,
  totalLoansRepaid: number,
  onTimeRepayments: number
}
```

### 2. Post-Quantum Encryption (`lib/encryption.ts`)

Uses **Kyber (ML-KEM-768)** for quantum-resistant encryption:

```typescript
interface BehavioralData {
  monthlyIncome: number;
  avgTransactionAmount: number;
  repaymentRate: number; // 0-100
  latePayments: number;
  accountAgeMonths: number;
  totalTransactions: number;
}
```

**Key Functions:**
- `generateKeyPair()` - Creates public/private key pair
- `encryptData()` - Encrypts data with public key
- `decryptData()` - Decrypts with private key
- `encryptBehavioralData()` - Client-side helper
- `decryptBehavioralData()` - Server-side helper

### 3. AI/ML Model (`lib/ml-model.ts`)

**Logistic Regression** model trained on synthetic data:

**Features:**
1. Monthly Income (normalized by 1000)
2. Repayment Rate (0-100)
3. Late Payments count
4. Account Age (months)
5. Total Transactions

**Functions:**
- `trainModel()` - Trains the model on synthetic data
- `predictTrustScore(features)` - Returns score 0-100
- `extractFeatures(data)` - Converts behavioral data to features

### 4. Trust Utilities (`lib/trust-utils.ts`)

Helper functions for score management:

```typescript
updateTrustScore(userId, action, points)
```

**Predefined Actions:**
```typescript
TrustScoreActions = {
  INITIAL_STATEMENT: { points: 0 },
  LOAN_REPAID_ON_TIME: { points: 8 },
  LOAN_REPAID_LATE: { points: -12 },
  LOAN_COMPLETED: { points: 5 },
  LOAN_DEFAULTED: { points: -25 },
  CIRCLE_CONTRIBUTION: { points: 3 },
  CIRCLE_JOINED: { points: 2 },
  LOAN_APPROVED: { points: 1 }
}
```

## API Endpoints

### POST `/api/trust/calculate`

Calculate initial trust score from encrypted behavioral data.

**Request:**
```json
{
  "encryptedData": "encrypted_json_string",
  "privateKey": "base64_private_key" // optional for demo
}
```

**Response:**
```json
{
  "success": true,
  "trustScore": 78,
  "message": "Trust score calculated successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET `/api/trust/keypair`

Generate a new Post-Quantum keypair.

**Response:**
```json
{
  "success": true,
  "publicKey": "base64_public_key",
  "privateKey": "base64_private_key",
  "message": "Keypair generated successfully",
  "note": "Store private key securely"
}
```

## Integration Points

### Loan Repayment (`/api/loans/[id]/repay`)

Automatically updates trust score based on timing:
- On-time: +8 points + increment `onTimeRepayments`
- Late: -12 points
- Updates `totalLoansRepaid`

### Loan Approval (`/api/loans/[id]/approve`)

- Borrower gets +1 point
- Increments `totalLoansTaken`

### Circle Contribution (`/api/circles/[id]/contribute`)

- Contributor gets +3 points per contribution

### Circle Join (`/api/circles/join`)

- New member gets +2 points

## Security Features

### 1. Post-Quantum Cryptography

- **Algorithm**: Kyber (ML-KEM-768)
- **Quantum-Resistant**: Yes
- **NIST Approved**: Yes
- **Key Size**: 768-bit security level

### 2. Data Privacy

- Raw behavioral data is **never stored**
- Only trust score + timestamp persisted
- Encryption happens client-side
- Private keys never leave client

### 3. Score Bounds

- Minimum: 30 (even with bad behavior)
- Maximum: 98 (prevents perfect scores)
- Default: 50 (new users)

## Usage Example

### Client-Side (Browser)

```typescript
// 1. Get keypair
const keypairRes = await fetch('/api/trust/keypair');
const { publicKey, privateKey } = await keypairRes.json();

// 2. Prepare behavioral data
const behavioralData = {
  monthlyIncome: 25000,
  avgTransactionAmount: 5000,
  repaymentRate: 90,
  latePayments: 1,
  accountAgeMonths: 18,
  totalTransactions: 65
};

// 3. Encrypt data
const encryptedData = encryptBehavioralData(behavioralData, publicKey);

// 4. Send to server
const response = await fetch('/api/trust/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ encryptedData, privateKey })
});

const { trustScore } = await response.json();
console.log('Your Trust Score:', trustScore);
```

### Server-Side (Automatic Updates)

```typescript
import { updateTrustScore, TrustScoreActions } from '@/lib/trust-utils';

// After successful loan repayment
await updateTrustScore(
  userId,
  TrustScoreActions.LOAN_REPAID_ON_TIME.reason,
  TrustScoreActions.LOAN_REPAID_ON_TIME.points
);
```

## Testing

### Test Trust Score Calculation

```bash
curl -X POST http://localhost:3000/api/trust/calculate \
  -H "Content-Type: application/json" \
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

### Generate Keypair

```bash
curl http://localhost:3000/api/trust/keypair
```

## Future Enhancements

1. **Advanced ML Models**: Neural networks, ensemble methods
2. **Real-time Updates**: WebSocket notifications for score changes
3. **Score History Visualization**: Charts and graphs
4. **Peer Comparison**: Anonymous benchmarking
5. **Score Prediction**: Forecast future scores based on planned actions
6. **Multi-factor Authentication**: Additional security layers
7. **Blockchain Integration**: Immutable score history

## Technical Notes

### Why Kyber (ML-KEM)?

- **Quantum-Safe**: Resistant to quantum computer attacks
- **NIST Standard**: Officially approved by NIST in 2024
- **Performance**: Fast encryption/decryption
- **Security Level**: 768-bit provides strong security

### Why Logistic Regression?

- **Interpretable**: Easy to understand feature importance
- **Fast**: Quick predictions
- **Proven**: Industry-standard for credit scoring
- **Lightweight**: Runs efficiently in Node.js

### Score Calculation Logic

```
Raw Probability (0-1) → Scale to 100 → Apply bounds (35-98)
```

The model outputs a probability that's converted to a 0-100 scale, then bounded to prevent extreme scores.

## Troubleshooting

### Issue: "Failed to decrypt data"

**Solution**: Ensure the private key matches the public key used for encryption.

### Issue: "Invalid behavioral data format"

**Solution**: Verify all required fields are present and are numbers.

### Issue: Trust score not updating

**Solution**: Check that the user is authenticated and the action is properly triggering the update function.

## References

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Kyber Algorithm](https://pq-crystals.org/kyber/)
- [Credit Scoring with ML](https://www.sciencedirect.com/topics/computer-science/credit-scoring)
