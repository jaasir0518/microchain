# Phase 2 API Documentation - Extra Features

This document covers all backend APIs for Priority 2 Extra Features.

---

## 1. Notifications API

### GET /api/notifications
Fetch user's notifications with pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unreadOnly` (optional): Filter unread only (true/false)

**Response:**
```json
{
  "notifications": [
    {
      "_id": "...",
      "userId": "...",
      "type": "loan_approved",
      "title": "Loan Approved! 🎉",
      "message": "Your loan of ₹5000 from Family Circle has been approved",
      "relatedId": "...",
      "relatedModel": "Loan",
      "isRead": false,
      "metadata": {},
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "unreadCount": 12
}
```

### PATCH /api/notifications
Mark notifications as read

**Request Body:**
```json
{
  "notificationIds": ["id1", "id2"],  // Optional
  "markAllAsRead": true               // Optional
}
```

**Response:**
```json
{
  "message": "Notifications marked as read"
}
```

### DELETE /api/notifications?id={notificationId}
Delete a specific notification

**Response:**
```json
{
  "message": "Notification deleted"
}
```

---

## 2. Pool Contribution API

### POST /api/circles/[id]/contribute
Contribute money to circle pool (Enhanced)

**Request Body:**
```json
{
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully contributed ₹1000",
  "newPoolBalance": 15000,
  "totalContribution": 3000,
  "trustScoreBonus": 3
}
```

**Trust Score Bonus:**
- ₹100-999: +2 points
- ₹1000-1999: +3 points
- ₹2000+: +5 points

**Notifications:**
- All circle members (except contributor) receive notification

---

## 3. Loan Voting System

### POST /api/loans/[id]/vote
Cast a vote on a loan request

**Request Body:**
```json
{
  "vote": "approve",  // or "reject"
  "comment": "Good repayment history"  // Optional
}
```

**Response (Voting Incomplete):**
```json
{
  "message": "Vote recorded successfully",
  "votingComplete": false,
  "votesReceived": 3,
  "votesNeeded": 5
}
```

**Response (Voting Complete):**
```json
{
  "message": "Vote recorded and voting completed",
  "votingComplete": true,
  "result": "approved",
  "votes": {
    "approve": 4,
    "reject": 1
  }
}
```

**Rules:**
- Cannot vote on your own loan
- One vote per member per loan
- Majority vote decides outcome
- Loan requester is notified when voting completes

### GET /api/loans/[id]/vote
Get voting status and results

**Response:**
```json
{
  "loanId": "...",
  "status": "voting",
  "votes": {
    "approve": 3,
    "reject": 1,
    "total": 4
  },
  "eligibleVoters": 5,
  "votingComplete": false,
  "userHasVoted": true,
  "userVote": "approve",
  "voteDetails": [
    {
      "voter": "John Doe",
      "vote": "approve",
      "comment": "Trustworthy member",
      "votedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 4. Loan Request (Enhanced with Voting)

### POST /api/loans/request
Request a loan (now with voting logic)

**Trust Score Logic:**
- **≥ 70**: Auto-approved
- **55-69**: Goes to voting
- **≤ 54**: Auto-rejected

**Response (Voting Required):**
```json
{
  "success": true,
  "loan": {
    "id": "...",
    "amount": 3000,
    "status": "voting",
    "trustScore": 62,
    "autoApproved": false,
    "requiresVoting": true,
    "dueDate": "2024-02-15T00:00:00Z"
  },
  "message": "Your loan request is under review by circle members"
}
```

**Notifications:**
- If voting required: All circle members notified to vote

---

## 5. Analytics APIs

### GET /api/analytics/personal
Get personal analytics and statistics

**Query Parameters:**
- `period` (optional): Days to analyze (default: 30)

**Response:**
```json
{
  "user": {
    "name": "John Doe",
    "trustScore": 75,
    "totalLoansTaken": 5,
    "totalLoansRepaid": 4,
    "onTimeRepayments": 3
  },
  "trustScoreTrend": [
    {
      "date": "2024-01-10T00:00:00Z",
      "score": 68,
      "reason": "On-time Repayment"
    }
  ],
  "loanStats": {
    "total": 5,
    "approved": 4,
    "repaid": 3,
    "pending": 1,
    "rejected": 0,
    "defaulted": 0,
    "totalBorrowed": 15000,
    "totalRepaid": 12000
  },
  "repaymentRate": 75.0,
  "contributionStats": {
    "total": 8,
    "totalAmount": 8000,
    "periodAmount": 2000,
    "averageAmount": 1000
  },
  "circleStats": {
    "totalCircles": 2,
    "totalContributed": 8000,
    "circles": [
      {
        "id": "...",
        "name": "Family Circle",
        "role": "member",
        "contribution": 5000,
        "poolBalance": 20000
      }
    ]
  },
  "monthlyActivity": [
    {
      "month": "2024-01",
      "loans": 2,
      "contributions": 3,
      "loanAmount": 6000,
      "contributionAmount": 3000
    }
  ],
  "period": 30
}
```

### GET /api/analytics/circle/[id]
Get circle analytics and statistics

**Query Parameters:**
- `period` (optional): Days to analyze (default: 30)

**Response:**
```json
{
  "circle": {
    "id": "...",
    "name": "Family Circle",
    "poolBalance": 25000,
    "maxMembers": 20,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "memberStats": [
    {
      "id": "...",
      "name": "John Doe",
      "trustScore": 75,
      "role": "admin",
      "contribution": 5000,
      "loansCount": 3,
      "repaidCount": 2,
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "loanStats": {
    "total": 15,
    "approved": 12,
    "repaid": 10,
    "pending": 1,
    "voting": 2,
    "rejected": 0,
    "defaulted": 0,
    "totalAmount": 45000,
    "totalRepaid": 38000
  },
  "repaymentRate": 83.3,
  "poolStats": {
    "currentBalance": 25000,
    "totalContributions": 50000,
    "periodContributions": 8000,
    "contributionCount": 25,
    "averageContribution": 2000
  },
  "poolTrend": [
    {
      "date": "2024-01-15",
      "contributions": 3000,
      "loans": 2000,
      "net": 1000
    }
  ],
  "topContributors": [
    {
      "name": "John Doe",
      "amount": 5000,
      "trustScore": 75
    }
  ],
  "period": 30
}
```

---

## Notification Types

| Type | Description | Triggered By |
|------|-------------|--------------|
| `loan_request` | New loan request | Loan creation |
| `loan_approved` | Loan approved | Auto-approval or voting |
| `loan_rejected` | Loan rejected | Auto-rejection or voting |
| `loan_repaid` | Loan repaid | Repayment completion |
| `trust_score_change` | Trust score updated | Any trust score change |
| `circle_invitation` | Circle invitation | Member invitation |
| `pool_contribution` | Pool contribution | Member contribution |
| `voting_started` | Voting required | Loan enters voting |
| `voting_completed` | Voting finished | All votes received |

---

## Database Models

### PoolContribution
```typescript
{
  circleId: ObjectId,
  userId: ObjectId,
  amount: Number,
  contributedAt: Date,
  trustScoreBonus: Number
}
```

### LoanVote
```typescript
{
  loanId: ObjectId,
  voterId: ObjectId,
  vote: 'approve' | 'reject',
  comment?: String,
  votedAt: Date
}
```

### Notification
```typescript
{
  userId: ObjectId,
  type: NotificationType,
  title: String,
  message: String,
  relatedId?: ObjectId,
  relatedModel?: 'Loan' | 'TrustCircle' | 'User',
  isRead: Boolean,
  metadata?: Object,
  createdAt: Date
}
```

---

## Testing Endpoints

### Test Voting Flow
```bash
# 1. Create user with trust score 60 (voting range)
POST /api/auth/register

# 2. Request loan (should go to voting)
POST /api/loans/request
{
  "circleId": "...",
  "amount": 3000,
  "purpose": "Business expansion"
}

# 3. Other members vote
POST /api/loans/{loanId}/vote
{
  "vote": "approve",
  "comment": "Good member"
}

# 4. Check voting status
GET /api/loans/{loanId}/vote

# 5. Check notifications
GET /api/notifications?unreadOnly=true
```

### Test Analytics
```bash
# Personal analytics
GET /api/analytics/personal?period=30

# Circle analytics
GET /api/analytics/circle/{circleId}?period=90
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Not a circle member |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Next Steps for Frontend

1. **Notifications UI**: Toast notifications using Sonner
2. **Analytics Dashboard**: Charts using Recharts
3. **Voting Interface**: Vote buttons and progress bars
4. **Contribution Modal**: Amount input with trust score preview

All backend APIs are ready for frontend integration!
