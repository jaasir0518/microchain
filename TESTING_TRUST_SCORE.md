# Testing the Trust Score System

## Quick Test (Recommended)

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Run the Test Suite

Visit the test endpoint in your browser or use curl:

```bash
curl http://localhost:3000/api/trust/test
```

Or open in browser: `http://localhost:3000/api/trust/test`

### Expected Output

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "tests": [
    {
      "name": "ML Model Training and Prediction",
      "status": "PASSED",
      "results": [
        {
          "case": 1,
          "input": {
            "monthlyIncome": 25000,
            "avgTransactionAmount": 5000,
            "repaymentRate": 95,
            "latePayments": 0,
            "accountAgeMonths": 24,
            "totalTransactions": 80
          },
          "trustScore": 87,
          "passed": true
        },
        {
          "case": 2,
          "input": {
            "monthlyIncome": 8000,
            "avgTransactionAmount": 2000,
            "repaymentRate": 60,
            "latePayments": 5,
            "accountAgeMonths": 6,
            "totalTransactions": 20
          },
          "trustScore": 42,
          "passed": true
        },
        {
          "case": 3,
          "input": {
            "monthlyIncome": 15000,
            "avgTransactionAmount": 3500,
            "repaymentRate": 85,
            "latePayments": 2,
            "accountAgeMonths": 12,
            "totalTransactions": 45
          },
          "trustScore": 73,
          "passed": true
        }
      ]
    },
    {
      "name": "Post-Quantum Encryption",
      "status": "PASSED",
      "details": {
        "publicKeyLength": 1568,
        "privateKeyLength": 3168,
        "encryptedLength": 2500,
        "encryptionDecryptionMatch": true
      }
    },
    {
      "name": "Score Bounds (35-98)",
      "status": "PASSED",
      "results": [
        {
          "name": "Perfect Profile",
          "score": 95,
          "withinBounds": true,
          "passed": true
        },
        {
          "name": "Poor Profile",
          "score": 38,
          "withinBounds": true,
          "passed": true
        }
      ]
    }
  ],
  "overallStatus": "ALL TESTS PASSED ✅"
}
```

## Manual API Testing

### 1. Generate Keypair

```bash
curl http://localhost:3000/api/trust/keypair
```

Response:
```json
{
  "success": true,
  "publicKey": "base64_encoded_public_key...",
  "privateKey": "base64_encoded_private_key...",
  "message": "Keypair generated successfully",
  "note": "Store private key securely - it will not be saved on server"
}
```

### 2. Calculate Trust Score (Requires Authentication)

First, login and get your session token, then:

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
  "message": "Trust score calculated successfully using Post-Quantum encrypted data",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Automatic Score Updates

### 1. Create a User and Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'

# Login (get session token from response)
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Calculate Initial Trust Score

```bash
curl -X POST http://localhost:3000/api/trust/calculate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "encryptedData": {
      "monthlyIncome": 15000,
      "avgTransactionAmount": 3000,
      "repaymentRate": 80,
      "latePayments": 3,
      "accountAgeMonths": 10,
      "totalTransactions": 40
    }
  }'
```

### 3. Join a Circle (+2 points)

```bash
curl -X POST http://localhost:3000/api/circles/join \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "inviteCode": "CIRCLE_CODE"
  }'
```

### 4. Contribute to Circle (+3 points)

```bash
curl -X POST http://localhost:3000/api/circles/CIRCLE_ID/contribute \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "amount": 1000
  }'
```

### 5. Check Updated Score

Query the user document in MongoDB to see the updated trust score and history.

## Verifying Score Updates

### Check User's Trust Score in MongoDB

```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: "test@example.com" }, {
  trustScore: 1,
  trustHistory: 1,
  totalLoansTaken: 1,
  totalLoansRepaid: 1,
  onTimeRepayments: 1
})
```

Expected output:
```json
{
  "_id": "...",
  "trustScore": 73,
  "trustHistory": [
    {
      "score": 68,
      "reason": "Initial Statement Upload",
      "date": "2024-01-15T10:00:00.000Z"
    },
    {
      "score": 70,
      "reason": "Joined Trust Circle",
      "date": "2024-01-15T10:05:00.000Z"
    },
    {
      "score": 73,
      "reason": "Circle Contribution",
      "date": "2024-01-15T10:10:00.000Z"
    }
  ],
  "totalLoansTaken": 0,
  "totalLoansRepaid": 0,
  "onTimeRepayments": 0
}
```

## Testing Score Bounds

The system enforces these bounds:
- **Minimum**: 30 (in updateTrustScore)
- **Maximum**: 98 (in updateTrustScore)
- **Prediction bounds**: 35-98 (in ML model)
- **Default**: 50 (new users)

Test by:
1. Creating a user with very poor behavioral data → Should get ~35-40
2. Creating a user with excellent data → Should get ~85-95
3. Manually updating score beyond bounds → Should be clamped

## Common Issues

### Issue: "Unauthorized"
**Cause**: No valid session token
**Solution**: Login first and include the session token in Cookie header

### Issue: "Invalid behavioral data format"
**Cause**: Missing or non-numeric fields
**Solution**: Ensure all fields are numbers:
```json
{
  "monthlyIncome": 20000,
  "avgTransactionAmount": 4000,
  "repaymentRate": 85,
  "latePayments": 2,
  "accountAgeMonths": 12,
  "totalTransactions": 50
}
```

### Issue: Test endpoint returns 404
**Cause**: Server not running or wrong URL
**Solution**: 
1. Ensure dev server is running: `npm run dev`
2. Check URL: `http://localhost:3000/api/trust/test`

### Issue: Score not updating after actions
**Cause**: Database connection issue or function not called
**Solution**: 
1. Check MongoDB connection
2. Verify `updateTrustScore()` is being called
3. Check server logs for errors

## Success Criteria

✅ Test endpoint returns "ALL TESTS PASSED ✅"
✅ ML model predicts scores between 35-98
✅ Encryption/decryption works correctly
✅ Score updates automatically on user actions
✅ Trust history is recorded
✅ Score bounds are enforced

## Next Steps

Once all tests pass:
1. Build the profile completion UI
2. Add trust score display to dashboard
3. Implement score history visualization
4. Add notifications for score changes
5. Create mobile app integration

## Support

If tests fail:
1. Check server logs: `npm run dev` output
2. Verify MongoDB connection
3. Check all dependencies are installed: `npm install`
4. Review error messages in test output
5. Consult TRUST_SCORE_SYSTEM.md for detailed documentation
