# Phase 2 UI Testing Guide

## 🧪 Manual Testing Checklist

Use this guide to test all Phase 2 UI features systematically.

---

## Prerequisites

1. **Backend Running**: Ensure MongoDB and Next.js dev server are running
2. **Test User**: Have a registered user account
3. **Test Data**: Have at least one circle with members
4. **Browser**: Use Chrome/Firefox with DevTools open

---

## 1️⃣ Notifications System

### Navbar Bell Icon

**Test Steps:**
1. Log in to the application
2. Look at the top-right navbar
3. Verify bell icon is visible next to user dropdown

**Expected Results:**
- ✅ Bell icon displays correctly
- ✅ If unread notifications exist, red badge shows count
- ✅ Badge number matches actual unread count

**Test Interaction:**
1. Click the bell icon
2. Dropdown menu should open

**Expected Results:**
- ✅ Dropdown opens smoothly
- ✅ Shows last 5 notifications
- ✅ Each notification shows: icon, title, message, timestamp
- ✅ Unread notifications have green dot indicator
- ✅ Unread notifications have light green background
- ✅ "View All Notifications" link at bottom

**Test Mark as Read:**
1. Click on an unread notification
2. Notification should be marked as read

**Expected Results:**
- ✅ Green dot disappears
- ✅ Background color changes to normal
- ✅ Badge count decreases by 1
- ✅ Dropdown updates in real-time

---

### Notifications Page

**Test Navigation:**
1. Click "View All Notifications" in dropdown
2. Should navigate to `/notifications`

**Expected Results:**
- ✅ Page loads successfully
- ✅ Shows all notifications (not just 5)
- ✅ Page title: "Notifications"
- ✅ Subtitle: "Stay updated with your Trust Circles activity"

**Test Tabs:**
1. Click "All" tab
2. Click "Unread" tab

**Expected Results:**
- ✅ "All" shows all notifications
- ✅ "Unread" shows only unread notifications
- ✅ Tab switching is smooth
- ✅ Active tab has emerald background

**Test Notification Cards:**
1. Verify each notification card displays:
   - Large emoji icon
   - Title
   - Message
   - Timestamp
   - "NEW" badge (if unread)
   - Left emerald border (if unread)
   - Check button (if unread)
   - Trash button

**Expected Results:**
- ✅ All elements display correctly
- ✅ Cards are responsive
- ✅ Hover effects work

**Test Actions:**
1. Click check icon on unread notification
2. Click trash icon on any notification
3. Click "Mark All as Read" button

**Expected Results:**
- ✅ Check: Notification marked as read, "NEW" badge removed
- ✅ Trash: Notification deleted, removed from list
- ✅ Mark All: All unread notifications marked as read

**Test Empty State:**
1. Delete all notifications OR filter to "Unread" with no unread items

**Expected Results:**
- ✅ Shows empty state with bell icon
- ✅ Shows appropriate message
- ✅ No error occurs

---

## 2️⃣ Voting System

### Dashboard Voting Alert

**Test Steps:**
1. Create a loan request that requires voting (trust score 55-69)
2. Go to dashboard as a different circle member

**Expected Results:**
- ✅ Purple alert banner appears at top
- ✅ Shows vote icon
- ✅ Shows count of pending votes
- ✅ "Review Now" button present

**Test Interaction:**
1. Click "Review Now" button

**Expected Results:**
- ✅ Navigates to `/circles` page
- ✅ Circle with pending votes is visible

---

### Circle Detail - Voting Tab

**Test Navigation:**
1. Go to a circle with pending votes
2. Click on the circle card

**Expected Results:**
- ✅ Circle detail page loads
- ✅ "Voting" tab is first tab
- ✅ Badge on "Voting" tab shows count

**Test Voting Tab Content:**
1. Click "Voting" tab (if not already active)

**Expected Results:**
- ✅ Shows all loans with status "voting"
- ✅ Each loan card displays:
  - Borrower avatar and name
  - Loan amount (large, prominent)
  - Trust score badge
  - Purpose description
  - Duration and interest rate
  - Vote progress bar
  - Recent votes section
  - Approve and Reject buttons

**Test Vote Progress:**
1. Verify progress bar shows approve vs reject ratio
2. Check vote counts are accurate

**Expected Results:**
- ✅ Progress bar fills correctly
- ✅ Green for approve, red for reject
- ✅ Numbers match vote counts

**Test Recent Votes:**
1. Verify recent votes section shows:
   - Voter name
   - Vote type (✓ or ✗)
   - Comment (if provided)

**Expected Results:**
- ✅ All vote details display correctly
- ✅ Badges are color-coded (green/red)
- ✅ Comments are readable

---

### Vote Actions

**Test Approve:**
1. Click "Approve" button
2. Dialog should open

**Expected Results:**
- ✅ Dialog opens with title "Approve Loan"
- ✅ Shows optional comment field
- ✅ "Submit Approval" button present
- ✅ Dialog has emerald theme

**Test Approve Submission:**
1. Enter a comment (optional)
2. Click "Submit Approval"

**Expected Results:**
- ✅ Dialog closes
- ✅ Vote count increases
- ✅ Progress bar updates
- ✅ Your vote appears in recent votes
- ✅ Notification sent to borrower
- ✅ If majority reached, loan status changes to "active"

**Test Reject:**
1. Click "Reject" button
2. Dialog should open

**Expected Results:**
- ✅ Dialog opens with title "Reject Loan"
- ✅ Shows reason field
- ✅ "Submit Rejection" button present
- ✅ Dialog has red theme

**Test Reject Submission:**
1. Enter a reason
2. Click "Submit Rejection"

**Expected Results:**
- ✅ Dialog closes
- ✅ Reject count increases
- ✅ Progress bar updates
- ✅ Your vote appears in recent votes
- ✅ Notification sent to borrower
- ✅ If majority rejects, loan status changes to "rejected"

**Test Empty State:**
1. Vote on all pending loans
2. Return to voting tab

**Expected Results:**
- ✅ Shows empty state
- ✅ Message: "No Pending Votes"
- ✅ Subtitle: "All loan requests have been processed"
- ✅ CheckCircle icon displayed

---

## 3️⃣ Pool Contribution

### Contribution Button

**Test Steps:**
1. Go to circle detail page
2. Look for "Contribute" button in header

**Expected Results:**
- ✅ Button visible next to "Request Loan"
- ✅ Has wallet icon
- ✅ Hover effect works

**Test Dialog:**
1. Click "Contribute" button
2. Dialog should open

**Expected Results:**
- ✅ Dialog opens with title "Contribute to Pool"
- ✅ Shows subtitle about trust score boost
- ✅ Shows 3 quick amount buttons
- ✅ Each button shows trust bonus badge
- ✅ Shows custom amount input field
- ✅ "Contribute" button at bottom

**Test Quick Amounts:**
1. Verify buttons show:
   - ₹500 +2
   - ₹1000 +3
   - ₹2000 +5

**Expected Results:**
- ✅ All buttons display correctly
- ✅ Trust bonus badges are visible
- ✅ Badges have emerald theme

**Test Contribution:**
1. Click ₹500 button OR enter custom amount
2. Click "Contribute" button

**Expected Results:**
- ✅ Dialog closes
- ✅ Pool balance updates on page
- ✅ Trust score increases by bonus amount
- ✅ Notification sent to all circle members
- ✅ Contribution appears in analytics

**Test Custom Amount:**
1. Enter custom amount (e.g., 1500)
2. Click "Contribute"

**Expected Results:**
- ✅ Accepts custom amount
- ✅ Applies appropriate trust bonus
- ✅ Updates pool balance correctly

---

## 4️⃣ Analytics

### Dashboard Analytics

**Test Steps:**
1. Go to dashboard
2. Scroll to bottom

**Expected Results:**
- ✅ "Your Analytics" section visible
- ✅ Shows 3 cards in grid layout

**Test Cards:**
1. Verify each card shows:
   - **Trust Score Trend**: +/- number, "Last 30 days"
   - **Total Circles**: Number, "Active memberships"
   - **Repayment Rate**: Percentage, "On-time payments"

**Expected Results:**
- ✅ All cards display correctly
- ✅ Icons are visible (TrendingUp, Users, ShieldCheck)
- ✅ Numbers are accurate
- ✅ Cards are responsive

---

### Circle Analytics Tab

**Test Navigation:**
1. Go to circle detail page
2. Click "Analytics" tab

**Expected Results:**
- ✅ Tab switches successfully
- ✅ Analytics content loads

**Test Pool Balance Trend:**
1. Verify line chart displays
2. Check chart shows 30-day history

**Expected Results:**
- ✅ Chart renders correctly
- ✅ Emerald line color
- ✅ X-axis shows dates
- ✅ Y-axis shows amounts
- ✅ Tooltip works on hover
- ✅ Dark theme applied

**Test Member Rankings:**
1. Verify top 5 contributors list
2. Check each entry shows:
   - Rank badge (#1, #2, etc.)
   - Member name
   - Total contributed amount
   - Trust score

**Expected Results:**
- ✅ All rankings display correctly
- ✅ Sorted by contribution amount
- ✅ Rank badges have emerald theme
- ✅ Amounts formatted with commas

**Test Loan Statistics:**
1. Verify 4 stat boxes show:
   - Total Loans
   - Approved (emerald)
   - Repayment Rate (cyan)
   - Average Amount

**Expected Results:**
- ✅ All stats display correctly
- ✅ Numbers are accurate
- ✅ Color coding is correct
- ✅ Grid layout is responsive

---

## 5️⃣ Responsive Design

### Mobile (< 768px)

**Test Steps:**
1. Resize browser to mobile width OR use DevTools device emulation
2. Test all pages

**Expected Results:**
- ✅ Navbar collapses appropriately
- ✅ Cards stack vertically
- ✅ Buttons are full-width
- ✅ Dialogs fit screen
- ✅ Charts are readable
- ✅ Tables scroll horizontally if needed
- ✅ No horizontal overflow

### Tablet (768px - 1024px)

**Test Steps:**
1. Resize browser to tablet width
2. Test all pages

**Expected Results:**
- ✅ 2-column grids display correctly
- ✅ Navbar shows all items
- ✅ Cards have appropriate width
- ✅ Dialogs are centered
- ✅ Charts scale properly

### Desktop (> 1024px)

**Test Steps:**
1. View on full desktop width
2. Test all pages

**Expected Results:**
- ✅ 3-4 column grids display correctly
- ✅ All features visible
- ✅ Proper spacing and padding
- ✅ Charts use full width
- ✅ No wasted space

---

## 6️⃣ Error Handling

### Network Errors

**Test Steps:**
1. Disconnect internet
2. Try to perform actions (vote, contribute, etc.)

**Expected Results:**
- ✅ Error message displays
- ✅ User is informed of issue
- ✅ No app crash
- ✅ Can retry when connection restored

### Invalid Data

**Test Steps:**
1. Try to contribute negative amount
2. Try to vote without selecting option
3. Try to access non-existent circle

**Expected Results:**
- ✅ Validation prevents invalid actions
- ✅ Error messages are clear
- ✅ User is guided to correct input

### Loading States

**Test Steps:**
1. Observe loading states when:
   - Page first loads
   - Data is being fetched
   - Action is being processed

**Expected Results:**
- ✅ Loading spinner displays
- ✅ Spinner is emerald color
- ✅ Centered on page
- ✅ Smooth transition when data loads

---

## 7️⃣ Performance

### Page Load Times

**Test Steps:**
1. Open DevTools Network tab
2. Load each page
3. Check load times

**Expected Results:**
- ✅ Dashboard loads in < 2 seconds
- ✅ Circle detail loads in < 2 seconds
- ✅ Notifications page loads in < 1 second
- ✅ No unnecessary API calls

### Interaction Speed

**Test Steps:**
1. Click buttons and links
2. Open dialogs
3. Switch tabs

**Expected Results:**
- ✅ All interactions feel instant
- ✅ No lag or delay
- ✅ Smooth animations
- ✅ No janky scrolling

---

## 8️⃣ Browser Compatibility

**Test Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Expected Results:**
- ✅ All features work in all browsers
- ✅ Styling is consistent
- ✅ No console errors
- ✅ Animations work smoothly

---

## 🐛 Bug Reporting Template

If you find a bug, report it with this format:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[If applicable]

**Environment**:
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Screen Size: [e.g., 1920x1080]

**Console Errors**:
[Any errors in browser console]
```

---

## ✅ Final Checklist

Before marking testing complete, verify:

- [ ] All notifications features work
- [ ] Voting system is functional
- [ ] Contributions process correctly
- [ ] Analytics display accurate data
- [ ] All pages are responsive
- [ ] No TypeScript errors in console
- [ ] No React warnings in console
- [ ] Loading states work
- [ ] Empty states work
- [ ] Error handling works
- [ ] All browsers tested
- [ ] Mobile tested
- [ ] Tablet tested
- [ ] Desktop tested
- [ ] Performance is acceptable
- [ ] No visual bugs
- [ ] All links work
- [ ] All buttons work
- [ ] All forms validate
- [ ] All dialogs open/close
- [ ] All tabs switch correctly

---

## 🎉 Testing Complete!

Once all items are checked, the Phase 2 UI is ready for production! 🚀
