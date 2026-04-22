# API Testing Guide - Phase 1

## 🚀 Quick Start

1. Start your development server:
```bash
npm run dev
```

2. Make sure MongoDB is connected (check `.env` file)

3. Use these curl commands or Postman to test APIs

---

## 🔐 Authentication

All APIs require authentication via NextAuth session. First, register and login through the UI or use session cookies.

---

## 📋 API Endpoints

### 1. Trust Score Management

#### Get Encryption Key Pair
```bash
curl http://localhost:3000/api/trust/keypair \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response:**
```json
{
  "publicKey": "base64_encoded_public_key",
  "privateKey": "base64_encoded_private_key",
  "algorithm": "ML-KEM-768 (Kyber)"
}
```

#### Calculate Trust Score
```bash
curl -X POST http://localhost:3000/api/trust/calculate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "encryptedData": "encrypted_behavioral_data",
    "privateKey": "your_private_key"
  }'
```

**Response:**
```json
{
  "success": true,
  "trustScore": 78,
  "eligible": true,
  "message": "You are eligible for auto-approved loans"
}
```

#### Get Current Trust Score
```bash
curl http://localhost:3000/api/trust/calculate \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

### 2. Trust Circle Management

#### Create New Circle
```bash
curl -X POST http://localhost:3000/api/circles \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Family Circle",
    "description": "Trusted family members only",
    "maxMembers": 15,
    "initialPoolBalance": 10000
  }'
```

**Response:**
```json
{
  "success": true,
  "circle": {
    "id": "circle_id_here",
    "name": "Family Circle",
    "inviteCode": "ABC12XYZ",
    "poolBalance": 10000
  }
}
```

#### Get All My Circles
```bash
curl http://localhost:3000/api/circles \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response:**
```json
{
  "circles": [
    {
      "_id": "...",
      "name": "Family Circle",
      "inviteCode": "ABC12XYZ",
      "poolBalance": 10000,
      "maxMembers": 15
    }
  ]
}
```

#### Join Circle with Invite Code
```bash
curl -X POST http://localhost:3000/api/circles/join \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "inviteCode": "ABC12XYZ"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Joined circle successfully",
  "circle": {
    "id": "...",
    "name": "Family Circle",
    "poolBalance": 10000
  }
}
```

#### Get Circle Details
```bash
curl http://localhost:3000/api/circles/CIRCLE_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response:**
```json
{
  "circle": {
    "id": "...",
    "name": "Family Circle",
    "inviteCode": "ABC12XYZ",
    "poolBalance": 10000,
    "maxMembers": 15
  },
  "members": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "trustScore": 85,
      "role": "admin",
      "contributionAmount": 5000
    }
  ],
  "loans": [],
  "userRole": "admin"
}
```

#### Contribute to Pool
```bash
curl -X POST http://localhost:3000/api/circles/CIRCLE_ID/contribute \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "amount": 2000
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully contributed ₹2000",
  "newPoolBalance": 12000,
  "totalContribution": 7000
}
```

---

### 3. Loan Management

#### Request Loan
```bash
curl -X POST http://localhost:3000/api/loans/request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "circleId": "CIRCLE_ID",
    "amount": 3000,
    "purpose": "Medical emergency",
    "durationDays": 30
  }'
```

**Response (Auto-Approved):**
```json
{
  "success": true,
  "loan": {
    "id": "loan_id",
    "amount": 3000,
    "status": "approved",
    "trustScore": 78,
    "autoApproved": true,
    "dueDate": "2026-05-15T00:00:00.000Z"
  },
  "message": "Loan auto-approved based on your trust score"
}
```

**Response (Pending Review):**
```json
{
  "success": true,
  "loan": {
    "id": "loan_id",
    "amount": 3000,
    "status": "pending",
    "trustScore": 65,
    "autoApproved": false,
    "dueDate": "2026-05-15T00:00:00.000Z"
  },
  "message": "Loan request submitted for review"
}
```

#### List Loans
```bash
# Get all loans in a circle
curl "http://localhost:3000/api/loans?circleId=CIRCLE_ID" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Get only approved loans
curl "http://localhost:3000/api/loans?circleId=CIRCLE_ID&status=approved" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Get my loans
curl "http://localhost:3000/api/loans" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response:**
```json
{
  "loans": [
    {
      "id": "...",
      "borrower": {
        "name": "John Doe",
        "email": "john@example.com",
        "trustScore": 78
      },
      "circle": {
        "id": "...",
        "name": "Family Circle"
      },
      "amount": 3000,
      "purpose": "Medical emergency",
      "status": "approved",
      "trustScoreAtRequest": 78,
      "interestRate": 2,
      "dueDate": "2026-05-15T00:00:00.000Z",
      "createdAt": "2026-04-15T00:00:00.000Z"
    }
  ]
}
```

#### Approve Loan (Admin Only)
```bash
curl -X POST http://localhost:3000/api/loans/LOAN_ID/approve \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Loan approved successfully",
  "loan": {
    "id": "...",
    "amount": 3000,
    "status": "approved"
  },
  "newPoolBalance": 7000
}
```

#### Repay Loan
```bash
curl -X POST http://localhost:3000/api/loans/LOAN_ID/repay \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Loan repaid successfully",
  "loan": {
    "id": "...",
    "amount": 3000,
    "repaidAmount": 3060,
    "status": "repaid"
  },
  "newTrustScore": 83,
  "newPoolBalance": 10060
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey

1. **Register/Login** (use UI or existing auth)
2. **Generate Keys**: `GET /api/trust/keypair`
3. **Calculate Trust Score**: `POST /api/trust/calculate`
4. **Create Circle**: `POST /api/circles`
5. **Contribute to Pool**: `POST /api/circles/{id}/contribute`
6. **Request Loan**: `POST /api/loans/request`
7. **Repay Loan**: `POST /api/loans/{id}/repay`

### Scenario 2: Circle Admin Flow

1. **Create Circle** with initial balance
2. **Share Invite Code** with members
3. **Members Join** using invite code
4. **Review Pending Loans** (trust score <70)
5. **Approve/Reject Loans**: `POST /api/loans/{id}/approve`

### Scenario 3: Trust Score Testing

Test with different behavioral data:

**High Trust (Score ~85-95):**
```json
{
  "pastRepaymentRate": 95,
  "onTimeRepayments": 15,
  "latePayments": 0,
  "circleActivity": 10,
  "incomeStability": 90,
  "defaultHistory": 0,
  "accountAge": 365,
  "contributionAmount": 5000
}
```

**Medium Trust (Score ~60-75):**
```json
{
  "pastRepaymentRate": 70,
  "onTimeRepayments": 8,
  "latePayments": 3,
  "circleActivity": 5,
  "incomeStability": 65,
  "defaultHistory": 0,
  "accountAge": 180,
  "contributionAmount": 2000
}
```

**Low Trust (Score ~30-50):**
```json
{
  "pastRepaymentRate": 40,
  "onTimeRepayments": 2,
  "latePayments": 8,
  "circleActivity": 1,
  "incomeStability": 30,
  "defaultHistory": 1,
  "accountAge": 30,
  "contributionAmount": 100
}
```

---

## 🐛 Common Issues

### Issue: "Unauthorized" Error
**Solution**: Make sure you're logged in and passing the session cookie

### Issue: "Circle not found"
**Solution**: Use the correct circle ID from the create/list response

### Issue: "Insufficient pool balance"
**Solution**: Contribute more to the pool before requesting loans

### Issue: "You already have an active loan"
**Solution**: Repay your existing loan before requesting a new one

---

## 📊 Expected Behaviors

1. **Auto-Approval**: Trust score ≥70 → Loan approved immediately
2. **Manual Review**: Trust score <70 → Loan pending (admin approval needed)
3. **Pool Balance**: Decreases on loan approval, increases on repayment
4. **Trust Score**: Increases by 5 on on-time repayment, 2 on late repayment
5. **Interest**: 2% added to repayment amount
6. **One Active Loan**: Users can only have one active loan per circle

---

## 🎯 Success Criteria

✅ All APIs return 200/201 for valid requests
✅ Trust score calculation works correctly
✅ Encryption/decryption works without data loss
✅ Pool balance updates correctly
✅ Auto-approval works for high trust scores
✅ Repayment increases trust score
✅ Interest is calculated correctly

---

## 🚀 Next: Frontend Testing

Once APIs are verified, proceed to build the frontend UI to interact with these endpoints visually.
