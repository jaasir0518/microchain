# Phase 2 Developer Quick Start

## 🚀 Get Started in 5 Minutes

This guide helps you quickly understand and work with Phase 2 features.

---

## 📋 What's New in Phase 2?

4 major features with full backend + frontend:
1. **Notifications** - Real-time notification system
2. **Voting** - Democratic loan approval system
3. **Contributions** - Pool funding with trust bonuses
4. **Analytics** - Personal and circle analytics

---

## 🗂️ File Structure

```
microchain/
├── app/
│   ├── api/
│   │   ├── notifications/route.ts          ← NEW
│   │   ├── loans/[id]/vote/route.ts        ← NEW
│   │   ├── analytics/
│   │   │   ├── personal/route.ts           ← NEW
│   │   │   └── circle/[id]/route.ts        ← NEW
│   │   └── circles/[id]/contribute/route.ts ← ENHANCED
│   ├── notifications/page.tsx              ← NEW
│   ├── dashboard/page.tsx                  ← ENHANCED
│   └── circles/[id]/page.tsx               ← REWRITTEN
├── components/
│   └── Navbar.tsx                          ← ENHANCED
├── models/
│   ├── Notification.ts                     ← NEW
│   ├── PoolContribution.ts                 ← NEW
│   ├── LoanVote.ts                         ← NEW
│   └── Loan.ts                             ← UPDATED
└── lib/
    └── notifications.ts                    ← NEW
```

---

## 🔌 API Endpoints Cheat Sheet

### Notifications
```typescript
// Get notifications
GET /api/notifications?limit=10&unreadOnly=true

// Mark as read
PATCH /api/notifications
Body: { notificationId: "..." }

// Delete
DELETE /api/notifications?notificationId=...
```

### Voting
```typescript
// Submit vote
POST /api/loans/[id]/vote
Body: { vote: "approve" | "reject", comment?: "..." }

// Get votes
GET /api/loans/[id]/vote
```

### Contributions
```typescript
// Add contribution
POST /api/circles/[id]/contribute
Body: { amount: 1000 }
```

### Analytics
```typescript
// Personal analytics
GET /api/analytics/personal

// Circle analytics
GET /api/analytics/circle/[id]?period=30
```

---

## 🎨 UI Components Quick Reference

### Navbar Bell
```tsx
// Location: components/Navbar.tsx
// Shows unread count badge
// Dropdown with last 5 notifications
```

### Notifications Page
```tsx
// Route: /notifications
// Full notification center with tabs
```

### Voting Tab
```tsx
// Location: app/circles/[id]/page.tsx
// First tab in circle detail
// Shows pending loan votes
```

### Contribution Dialog
```tsx
// Location: app/circles/[id]/page.tsx
// Triggered by "Contribute" button
// Quick amounts: ₹500, ₹1000, ₹2000
```

### Analytics Section
```tsx
// Dashboard: app/dashboard/page.tsx
// Circle Detail: app/circles/[id]/page.tsx (Analytics tab)
```

---

## 🔧 Common Tasks

### 1. Create a Notification
```typescript
import { createNotification } from '@/lib/notifications';

await createNotification({
  userId: user._id,
  type: 'loan_approved',
  title: 'Loan Approved!',
  message: 'Your loan request was approved.',
  metadata: { loanId: loan._id }
});
```

### 2. Check Voting Status
```typescript
// In loan request route
if (borrower.trustScore >= 70) {
  loan.status = 'active'; // Auto-approve
} else if (borrower.trustScore >= 55) {
  loan.status = 'voting'; // Requires voting
} else {
  loan.status = 'rejected'; // Auto-reject
}
```

### 3. Add Trust Score Bonus
```typescript
// Contribution bonuses
const bonuses = {
  500: 2,
  1000: 3,
  2000: 5
};

const bonus = amount >= 2000 ? 5 : amount >= 1000 ? 3 : amount >= 500 ? 2 : 0;
user.trustScore += bonus;
```

### 4. Fetch Analytics
```typescript
// Frontend
const res = await fetch('/api/analytics/personal');
const data = await res.json();

console.log(data.trustScoreTrend); // +5
console.log(data.totalCircles); // 3
console.log(data.repaymentRate); // 100
```

---

## 🎯 Testing Locally

### 1. Start the Server
```bash
npm run dev
```

### 2. Test Notifications
```bash
# Create a test notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "type": "loan_approved",
    "title": "Test",
    "message": "Test message"
  }'

# Check navbar bell - should show badge
```

### 3. Test Voting
```bash
# Create a loan with voting status
# Go to circle detail page
# Click "Voting" tab
# Should see loan card with vote buttons
```

### 4. Test Contributions
```bash
# Go to circle detail page
# Click "Contribute" button
# Select ₹500
# Check pool balance updates
```

### 5. Test Analytics
```bash
# Go to dashboard
# Scroll to bottom
# Should see 3 analytics cards

# Go to circle detail
# Click "Analytics" tab
# Should see charts and rankings
```

---

## 🐛 Debugging Tips

### Notifications Not Showing?
1. Check MongoDB connection
2. Verify user is logged in
3. Check browser console for errors
4. Verify API response in Network tab

### Voting Not Working?
1. Check loan status is "voting"
2. Verify user is circle member
3. Check vote hasn't been submitted already
4. Verify API endpoint is correct

### Analytics Not Loading?
1. Check if data exists in database
2. Verify API response format
3. Check Recharts is installed
4. Verify chart data structure

### Contributions Failing?
1. Check circle exists
2. Verify user is member
3. Check amount is valid number
4. Verify pool balance updates

---

## 📚 Key Files to Understand

### Backend
1. **lib/notifications.ts** - Notification utilities
2. **app/api/loans/request/route.ts** - Voting logic
3. **app/api/analytics/personal/route.ts** - Analytics calculation

### Frontend
1. **components/Navbar.tsx** - Notification bell
2. **app/circles/[id]/page.tsx** - Main feature UI
3. **app/dashboard/page.tsx** - Analytics display

### Models
1. **models/Notification.ts** - Notification schema
2. **models/LoanVote.ts** - Vote schema
3. **models/PoolContribution.ts** - Contribution schema

---

## 🎨 Styling Patterns

### Colors
```tsx
// Primary actions
className="bg-emerald-500 hover:bg-emerald-600 text-black"

// Secondary actions
className="bg-white/5 hover:bg-white/10 text-white border border-white/10"

// Danger actions
className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"

// Voting actions
className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50"
```

### Cards
```tsx
<Card className="bg-white/5 border-white/10 text-white">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription className="text-zinc-400">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Badges
```tsx
// Success
<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
  Active
</Badge>

// Warning
<Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
  Pending
</Badge>

// Danger
<Badge className="bg-red-500/20 text-red-400 border-red-500/30">
  Rejected
</Badge>
```

---

## 🔐 Authentication

All Phase 2 APIs require authentication:

```typescript
// Backend
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

```typescript
// Frontend
import { useSession } from "next-auth/react";

const { data: session } = useSession();
if (!session) {
  // Redirect to login
}
```

---

## 📊 Database Queries

### Get Notifications
```typescript
const notifications = await Notification.find({ user: userId })
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();
```

### Get Voting Loans
```typescript
const loans = await Loan.find({ 
  circle: circleId, 
  status: 'voting' 
})
  .populate('borrower', 'name email trustScore')
  .lean();
```

### Get Analytics
```typescript
const contributions = await PoolContribution.find({ 
  circle: circleId,
  createdAt: { $gte: thirtyDaysAgo }
})
  .sort({ amount: -1 })
  .lean();
```

---

## 🚀 Deployment Checklist

Before deploying Phase 2:

- [ ] All environment variables set
- [ ] MongoDB indexes created
- [ ] API rate limiting configured
- [ ] Error logging enabled
- [ ] Frontend build successful
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Security audit complete

---

## 📞 Need Help?

1. **Check Documentation**:
   - `PHASE2_API_DOCUMENTATION.md` - API details
   - `PHASE2_UI_GUIDE.md` - UI patterns
   - `PHASE2_UI_TESTING.md` - Testing guide

2. **Common Issues**:
   - TypeScript errors? Run `npm run type-check`
   - API not working? Check MongoDB connection
   - UI not updating? Check React state management

3. **Debug Mode**:
   ```bash
   # Enable debug logging
   DEBUG=* npm run dev
   ```

---

## 🎉 You're Ready!

You now have everything you need to work with Phase 2 features. Happy coding! 🚀

**Quick Links**:
- [API Documentation](./PHASE2_API_DOCUMENTATION.md)
- [UI Guide](./PHASE2_UI_GUIDE.md)
- [Testing Guide](./PHASE2_UI_TESTING.md)
- [Complete Summary](./PHASE2_COMPLETE.md)
