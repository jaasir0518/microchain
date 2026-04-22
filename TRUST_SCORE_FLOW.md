# Trust Score System Flow Diagram

## 🔄 Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRUST SCORE SYSTEM                            │
│                  (Post-Quantum + AI/ML)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIAL TRUST SCORE CALCULATION                       │
└─────────────────────────────────────────────────────────────────┘

    👤 New User Login
         │
         ▼
    📝 Complete Profile / Upload Statement
         │
         ▼
    🔐 CLIENT-SIDE ENCRYPTION (Kyber ML-KEM-768)
         │
         │  Behavioral Data:
         │  • Monthly Income
         │  • Avg Transaction Amount
         │  • Repayment Rate (0-100%)
         │  • Late Payments Count
         │  • Account Age (months)
         │  • Total Transactions
         │
         ▼
    📤 POST /api/trust/calculate
         │  { encryptedData, privateKey }
         │
         ▼
    🔓 SERVER-SIDE DECRYPTION
         │
         ▼
    🤖 AI/ML MODEL (Logistic Regression)
         │
         │  Features Extraction:
         │  [income/1000, repaymentRate, latePayments, 
         │   accountAge, totalTransactions]
         │
         ▼
    📊 TRUST SCORE CALCULATION
         │
         │  Raw Probability (0-1)
         │       ↓
         │  Scale to 100
         │       ↓
         │  Apply Bounds (35-98)
         │
         ▼
    💾 STORE SCORE ONLY (Discard Raw Data)
         │
         │  User.trustScore = 78
         │  User.trustHistory.push({
         │    score: 78,
         │    reason: "Initial Statement Upload",
         │    date: now
         │  })
         │
         ▼
    ✅ Return Trust Score to User


┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: DYNAMIC SCORE UPDATES                                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  LOAN REPAYMENT                                              │
└──────────────────────────────────────────────────────────────┘

    💰 User Repays Loan
         │
         ▼
    POST /api/loans/[id]/repay
         │
         ▼
    ⏰ Check Timing
         │
         ├─── On-Time ────────┐
         │                     │
         │                     ▼
         │              updateTrustScore(+8)
         │              onTimeRepayments++
         │                     │
         └─── Late ───────────┤
                               │
                               ▼
                        updateTrustScore(-12)
                               │
                               ▼
                        totalLoansRepaid++
                               │
                               ▼
                        ✅ Score Updated


┌──────────────────────────────────────────────────────────────┐
│  LOAN APPROVAL                                               │
└──────────────────────────────────────────────────────────────┘

    👨‍💼 Admin Approves Loan
         │
         ▼
    POST /api/loans/[id]/approve
         │
         ▼
    updateTrustScore(+1)
         │
         ▼
    totalLoansTaken++
         │
         ▼
    ✅ Score Updated


┌──────────────────────────────────────────────────────────────┐
│  CIRCLE CONTRIBUTION                                         │
└──────────────────────────────────────────────────────────────┘

    💵 User Contributes to Pool
         │
         ▼
    POST /api/circles/[id]/contribute
         │
         ▼
    updateTrustScore(+3)
         │
         ▼
    ✅ Score Updated


┌──────────────────────────────────────────────────────────────┐
│  CIRCLE JOIN                                                 │
└──────────────────────────────────────────────────────────────┘

    👥 User Joins Circle
         │
         ▼
    POST /api/circles/join
         │
         ▼
    updateTrustScore(+2)
         │
         ▼
    ✅ Score Updated


┌─────────────────────────────────────────────────────────────────┐
│  TRUST SCORE UPDATE FUNCTION                                    │
└─────────────────────────────────────────────────────────────────┘

    updateTrustScore(userId, action, points)
         │
         ▼
    Get Current Score
         │
         ▼
    newScore = currentScore + points
         │
         ▼
    Apply Bounds: min(98, max(30, newScore))
         │
         ▼
    Update User:
      • trustScore = newScore
      • trustHistory.push({
          score: newScore,
          reason: action,
          date: now
        })
         │
         ▼
    ✅ Return New Score


┌─────────────────────────────────────────────────────────────────┐
│  SCORE ADJUSTMENT RULES                                         │
└─────────────────────────────────────────────────────────────────┘

    Action                          Points      Trigger
    ─────────────────────────────────────────────────────────────
    Initial Statement Upload         0          /api/trust/calculate
    Loan Repaid On-Time            +8          /api/loans/[id]/repay
    Late Payment                   -12         /api/loans/[id]/repay
    Loan Completed                 +5          Manual
    Loan Default                   -25         Manual
    Circle Contribution            +3          /api/circles/[id]/contribute
    Circle Joined                  +2          /api/circles/join
    Loan Approved                  +1          /api/loans/[id]/approve


┌─────────────────────────────────────────────────────────────────┐
│  DATA FLOW & PRIVACY                                            │
└─────────────────────────────────────────────────────────────────┘

    CLIENT                    SERVER                   DATABASE
    ──────                    ──────                   ────────
    
    Raw Data
       │
       ▼
    🔐 Encrypt
       │
       ▼
    Encrypted ────────────▶ 🔓 Decrypt
                                 │
                                 ▼
                            🤖 AI Model
                                 │
                                 ▼
                            📊 Score ──────────▶ 💾 Store Score
                                 │
                                 ▼
                            🗑️ Discard Raw Data
                            
    ✅ Privacy Preserved: Raw data never stored!


┌─────────────────────────────────────────────────────────────────┐
│  SCORE BOUNDS & DEFAULTS                                        │
└─────────────────────────────────────────────────────────────────┘

    Score Range:  35 ────────── 50 ────────── 98
                  │              │              │
                  │              │              │
                Minimum       Default        Maximum
                (Bad)       (New User)      (Excellent)
                
    • New users start at 50
    • Minimum score: 30 (enforced in updateTrustScore)
    • Maximum score: 98 (prevents perfect scores)
    • Prediction bounds: 35-98 (in ML model)


┌─────────────────────────────────────────────────────────────────┐
│  SECURITY LAYERS                                                │
└─────────────────────────────────────────────────────────────────┘

    Layer 1: Post-Quantum Encryption (Kyber ML-KEM-768)
             ↓
    Layer 2: Client-Side Encryption
             ↓
    Layer 3: Encrypted Transmission (HTTPS)
             ↓
    Layer 4: Server-Side Decryption (In-Memory Only)
             ↓
    Layer 5: Zero Raw Data Storage
             ↓
    Layer 6: Authentication (NextAuth.js)
             ↓
    Layer 7: Protected API Routes


┌─────────────────────────────────────────────────────────────────┐
│  EXAMPLE SCORE PROGRESSION                                      │
└─────────────────────────────────────────────────────────────────┘

    Day 1:  New User                        Score: 50
            ↓
    Day 2:  Upload Statement                Score: 65 (calculated)
            ↓
    Day 5:  Join Circle                     Score: 67 (+2)
            ↓
    Day 7:  Contribute ₹1000                Score: 70 (+3)
            ↓
    Day 10: Loan Approved                   Score: 71 (+1)
            ↓
    Day 40: Repay On-Time                   Score: 79 (+8)
            ↓
    Day 45: Contribute ₹2000                Score: 82 (+3)
            ↓
    Day 50: Another Loan Approved           Score: 83 (+1)
            ↓
    Day 80: Repay On-Time                   Score: 91 (+8)
            
    ✅ Excellent Credit Score Achieved!


┌─────────────────────────────────────────────────────────────────┐
│  TECHNOLOGY STACK                                               │
└─────────────────────────────────────────────────────────────────┘

    Encryption:  @noble/post-quantum (Kyber ML-KEM-768)
    AI/ML:       Custom Logistic Regression (Pure JS)
    Database:    MongoDB + Mongoose
    Backend:     Next.js API Routes
    Auth:        NextAuth.js
    Language:    TypeScript
    
    ✅ Zero external ML dependencies
    ✅ Quantum-resistant security
    ✅ Production-ready
