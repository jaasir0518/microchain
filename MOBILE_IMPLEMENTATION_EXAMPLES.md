# Mobile Responsiveness - Implementation Examples

## Quick Start Guide

This document provides copy-paste examples for implementing mobile responsiveness in your pages.

---

## 1. Page with Loading State

```tsx
"use client";

import { useState, useEffect } from "react";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/my-endpoint");
      
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      
      const result = await response.json();
      setData(result);
      showSuccessToast("Data loaded successfully");
    } catch (error) {
      showErrorToast("Failed to load data", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Your content */}
    </div>
  );
}
```

---

## 2. Responsive Grid Layout

```tsx
// Trust Circles Grid - 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {circles.map((circle) => (
    <CircleCard key={circle.id} circle={circle} />
  ))}
</div>

// Stats Cards - 1 column mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard title="Trust Score" value={trustScore} />
  <StatCard title="Active Loans" value={activeLoans} />
  <StatCard title="Total Circles" value={totalCircles} />
  <StatCard title="Pool Balance" value={poolBalance} />
</div>
```

---

## 3. Responsive Card Component

```tsx
export function ResponsiveCard({ title, description, action }: CardProps) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 space-y-4">
      {/* Header - Stack on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs md:text-sm text-zinc-400">{description}</p>
        </div>
        <Button className="w-full sm:w-auto">
          {action}
        </Button>
      </div>
    </div>
  );
}
```

---

## 4. Form with Error Handling

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showErrorToast, showSuccessToast, showLoadingToast } from "@/lib/toast-utils";
import { toast } from "sonner";

const formSchema = z.object({
  amount: z.number().min(100).max(50000),
  purpose: z.string().min(10),
});

export function LoanRequestForm() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const toastId = showLoadingToast("Submitting request...");
    
    try {
      setSubmitting(true);
      
      const response = await fetch("/api/loans/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.dismiss(toastId);
      showSuccessToast("Loan request submitted!", "Your request is now pending approval.");
      
      // Redirect or reset form
      form.reset();
    } catch (error: any) {
      toast.dismiss(toastId);
      showErrorToast("Submission failed", error.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
```

---

## 5. Empty State with Action

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox, Users, Bell, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export function NoLoansState() {
  const router = useRouter();

  return (
    <EmptyState
      icon={Inbox}
      title="No active loans yet"
      description="You don't have any active loans. Request a loan from your trust circle to get started."
      action={{
        label: "Request Loan",
        onClick: () => router.push("/loans/request"),
      }}
    />
  );
}

export function NoCirclesState() {
  const router = useRouter();

  return (
    <EmptyState
      icon={Users}
      title="No trust circles"
      description="Join or create a trust circle to start lending and borrowing with your community."
      action={{
        label: "Create Circle",
        onClick: () => router.push("/circles/create"),
      }}
    />
  );
}

export function NoNotificationsState() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up! Check back later for updates on your loans and circles."
    />
  );
}
```

---

## 6. Responsive Modal/Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function LoanDetailsModal({ open, onClose, loan }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Loan Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 md:space-y-6">
          {/* Content - Stack on mobile, grid on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm text-zinc-400">Amount</label>
              <p className="text-base md:text-lg font-semibold">₹{loan.amount}</p>
            </div>
            <div>
              <label className="text-xs md:text-sm text-zinc-400">Interest Rate</label>
              <p className="text-base md:text-lg font-semibold">{loan.interestRate}%</p>
            </div>
          </div>

          {/* Actions - Full width on mobile, auto on desktop */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="w-full sm:w-auto" onClick={onClose}>
              Close
            </Button>
            <Button className="w-full sm:w-auto bg-emerald-500">
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. Responsive Chart

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export function TrustScoreChart({ data }: ChartProps) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-4">Trust Score History</h3>
      
      {/* Responsive container - adjusts to parent width */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis 
            dataKey="date" 
            stroke="#71717a"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#71717a"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#10b981" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 8. Mobile-Optimized List

```tsx
export function LoanList({ loans }: ListProps) {
  if (loans.length === 0) {
    return <NoLoansState />;
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {loans.map((loan) => (
        <div
          key={loan.id}
          className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
        >
          {/* Mobile: Stack vertically, Desktop: Row layout */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base md:text-lg font-semibold text-white">
                  ₹{loan.amount.toLocaleString()}
                </h4>
                <Badge className={loan.status === "active" ? "bg-emerald-500/10" : "bg-zinc-700"}>
                  {loan.status}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-zinc-400">{loan.purpose}</p>
            </div>

            {/* Actions - Full width on mobile */}
            <div className="flex gap-2 md:gap-3">
              <Button variant="outline" className="flex-1 md:flex-none">
                View
              </Button>
              <Button className="flex-1 md:flex-none bg-emerald-500">
                Pay
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 9. Responsive Typography

```tsx
// Headings
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Main Heading
</h1>

<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">
  Section Heading
</h2>

<h3 className="text-lg md:text-xl font-semibold">
  Subsection Heading
</h3>

// Body text
<p className="text-sm md:text-base text-zinc-400">
  Regular paragraph text that scales appropriately.
</p>

// Small text
<span className="text-xs md:text-sm text-zinc-500">
  Helper text or captions
</span>
```

---

## 10. Touch-Friendly Buttons

```tsx
// Minimum 44x44px touch target
<Button className="min-h-[44px] min-w-[44px] touch-manipulation">
  Tap Me
</Button>

// Full width on mobile, auto on desktop
<Button className="w-full md:w-auto">
  Submit
</Button>

// Icon buttons with proper spacing
<Button variant="ghost" className="p-3 md:p-2">
  <Bell className="w-5 h-5 md:w-4 md:h-4" />
</Button>
```

---

## Common Responsive Patterns

### Container Padding
```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Section Spacing
```tsx
<section className="py-8 md:py-12 lg:py-16">
  {/* Content */}
</section>
```

### Gap Spacing
```tsx
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* Stacked content */}
</div>

<div className="flex gap-3 md:gap-4 lg:gap-6">
  {/* Horizontal content */}
</div>
```

### Conditional Rendering
```tsx
// Show different components based on screen size
<div className="block md:hidden">
  <MobileComponent />
</div>
<div className="hidden md:block">
  <DesktopComponent />
</div>
```

---

## Testing Checklist

Before deploying, test these scenarios:

- [ ] All pages load with skeleton states
- [ ] Forms show appropriate error messages
- [ ] Toast notifications appear correctly
- [ ] Empty states display when no data
- [ ] Mobile menu opens and closes smoothly
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable on all screen sizes
- [ ] Images scale properly
- [ ] Charts are responsive
- [ ] Modals work on mobile
- [ ] No horizontal scrolling
- [ ] Proper keyboard types on inputs (number, email, etc.)

---

## Performance Tips

1. **Use loading skeletons** instead of spinners
2. **Lazy load images** with `loading="lazy"`
3. **Optimize images** for mobile (WebP format)
4. **Minimize layout shift** with proper sizing
5. **Use CSS transforms** for animations (better performance)
6. **Debounce search inputs** to reduce API calls
7. **Implement virtual scrolling** for long lists
8. **Cache API responses** when appropriate

---

## Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Images have alt text
- [ ] Forms have proper labels
- [ ] Error messages are announced to screen readers
- [ ] Touch targets are large enough
- [ ] Text can be zoomed to 200% without breaking layout
