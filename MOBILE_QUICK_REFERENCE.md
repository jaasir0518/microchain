# Mobile Responsiveness - Quick Reference Card

## 🚀 Quick Start

### Import Components
```tsx
// Loading Skeletons
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { CircleCardSkeleton } from "@/components/skeletons/CircleCardSkeleton";
import { LoanListSkeleton } from "@/components/skeletons/LoanListSkeleton";
import { TrustScoreSkeleton } from "@/components/skeletons/TrustScoreSkeleton";

// Toast Notifications
import { 
  showSuccessToast, 
  showErrorToast, 
  showLoadingToast 
} from "@/lib/toast-utils";

// Empty States
import { EmptyState } from "@/components/ui/empty-state";
```

---

## 📱 Responsive Breakpoints

```tsx
sm:   // ≥ 640px  - Mobile (Small)
md:   // ≥ 768px  - Tablet
lg:   // ≥ 1024px - Laptop
xl:   // ≥ 1280px - Desktop
2xl:  // ≥ 1536px - Large Desktop
```

---

## 🎨 Common Patterns

### Grid Layouts
```tsx
// 1 → 2 → 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 1 → 2 → 4 columns (stats)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

### Flex Layouts
```tsx
// Stack → Row
<div className="flex flex-col md:flex-row gap-4">

// Reverse on mobile
<div className="flex flex-col-reverse md:flex-row">
```

### Visibility
```tsx
// Hide on mobile
<div className="hidden md:block">

// Show only on mobile
<div className="block md:hidden">
```

### Spacing
```tsx
// Responsive padding
<div className="px-4 md:px-6 lg:px-8">

// Responsive gap
<div className="space-y-4 md:space-y-6 lg:space-y-8">
```

### Typography
```tsx
// Responsive heading
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive body
<p className="text-sm md:text-base">
```

### Buttons
```tsx
// Full width → Auto
<Button className="w-full md:w-auto">

// Touch-friendly (44x44px min)
<Button className="min-h-[44px] min-w-[44px]">
```

---

## 🔄 Loading States

```tsx
const [loading, setLoading] = useState(true);

if (loading) {
  return <DashboardSkeleton />;
}

return <div>Content</div>;
```

---

## 🎯 Toast Notifications

```tsx
// Success
showSuccessToast("Success!", "Operation completed");

// Error
showErrorToast("Error", "Something went wrong");

// Loading
const id = showLoadingToast("Processing...");
// Later: toast.dismiss(id);

// With Action
showActionToast(
  "Error",
  "Description",
  "Action",
  () => handleAction()
);
```

---

## 📭 Empty States

```tsx
<EmptyState
  icon={Inbox}
  title="No items"
  description="Get started by creating your first item."
  action={{
    label: "Create Item",
    onClick: () => router.push("/create"),
  }}
/>
```

---

## 🎨 Card Component Template

```tsx
<div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div className="space-y-1">
      <h3 className="text-base md:text-lg font-semibold">Title</h3>
      <p className="text-xs md:text-sm text-zinc-400">Description</p>
    </div>
    <Button className="w-full sm:w-auto">Action</Button>
  </div>
</div>
```

---

## 📊 Responsive Chart

```tsx
<ResponsiveContainer width="100%" height={250}>
  <LineChart data={data}>
    <XAxis dataKey="date" stroke="#71717a" />
    <YAxis stroke="#71717a" />
    <Tooltip />
    <Line dataKey="value" stroke="#10b981" />
  </LineChart>
</ResponsiveContainer>
```

---

## 🎭 Modal/Dialog

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      {/* Content */}
    </div>
  </DialogContent>
</Dialog>
```

---

## 🔍 Form with Validation

```tsx
const onSubmit = async (data) => {
  const toastId = showLoadingToast("Submitting...");
  
  try {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error();
    
    toast.dismiss(toastId);
    showSuccessToast("Success!");
  } catch (error) {
    toast.dismiss(toastId);
    showErrorToast("Failed", error.message);
  }
};
```

---

## ✅ Testing Checklist

### Mobile Navigation
- [ ] Hamburger menu works
- [ ] Links navigate correctly
- [ ] Menu closes after click

### Loading States
- [ ] Skeletons appear
- [ ] No layout shift
- [ ] Smooth transition

### Toasts
- [ ] Success toasts show
- [ ] Error toasts show
- [ ] Actions work

### Responsive Layout
- [ ] No horizontal scroll
- [ ] Text readable
- [ ] Touch targets 44x44px
- [ ] Images scale

### Forms
- [ ] Proper keyboard types
- [ ] Error messages show
- [ ] Submit button states

---

## 🎨 Color Palette

```tsx
// Primary
bg-emerald-500    // #10b981
text-emerald-400  // #34d399

// Accent
bg-cyan-500       // #06b6d4
text-cyan-400     // #22d3ee

// Background
bg-zinc-950       // #09090b
bg-zinc-900       // #18181b
bg-zinc-800       // #27272a

// Text
text-white        // #ffffff
text-zinc-400     // #a1a1aa
text-zinc-500     // #71717a

// Borders
border-white/10   // rgba(255,255,255,0.1)
```

---

## 🚨 Common Errors

### Error: "Cannot find module 'sonner'"
```bash
npm install sonner
```

### Error: "Cannot find module 'next-themes'"
```bash
npm install next-themes
```

### Error: Sheet not working
```tsx
// Make sure to import from correct path
import { Sheet, SheetContent } from "@/components/ui/sheet";
```

---

## 📚 Documentation

- **Full Guide:** `MOBILE_RESPONSIVENESS_GUIDE.md`
- **Examples:** `MOBILE_IMPLEMENTATION_EXAMPLES.md`
- **Summary:** `MOBILE_RESPONSIVENESS_COMPLETE.md`

---

## 🎯 Performance Tips

1. Use loading skeletons (not spinners)
2. Lazy load images: `loading="lazy"`
3. Optimize images (WebP format)
4. Minimize layout shift
5. Use CSS transforms for animations
6. Debounce search inputs
7. Cache API responses

---

## ♿ Accessibility

- Minimum touch target: 44x44px
- Color contrast: WCAG AA
- Keyboard navigation
- Focus states visible
- Alt text on images
- Proper labels on forms
- Error messages announced

---

## 🔗 Quick Links

```tsx
// Navigate
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/path");

// Session
import { useSession } from "next-auth/react";
const { data: session } = useSession();

// Pathname
import { usePathname } from "next/navigation";
const pathname = usePathname();
```

---

**Last Updated:** April 16, 2026  
**Version:** 1.0.0
