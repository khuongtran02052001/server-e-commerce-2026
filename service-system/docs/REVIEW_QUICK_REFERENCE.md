# Product Reviews - Quick Reference

## 🚀 Quick Start

### User Flow

1. Go to product page
2. Click "Write a Review" → **Sidebar opens from right**
3. Rate with stars (see visual progress)
4. Enter title (min 5 chars) with validation feedback
5. Write review (min 20 chars) with validation feedback
6. Submit → Success toast → Sidebar closes

### Admin Flow

1. Admin Dashboard → Reviews
2. See pending reviews
3. Approve or Reject
4. Auto-updates product ratings

## 📂 Key Files

### Schema

- `sanity/schemaTypes/reviewType.ts` - Review schema
- `sanity/schemaTypes/productType.ts` - Rating fields

### Actions

- `actions/reviewActions.ts` - All review operations

### Components

- `components/ReviewSidebar.tsx` - **Sidebar form (NEW!)**
- `components/ProductReviews.tsx` - Display reviews
- `components/admin/AdminReviews.tsx` - Admin panel

### Types

- `types/review.ts` - TypeScript interfaces

## 🎨 ReviewSidebar Features

### Visual Indicators

```tsx
Rating: ⭐⭐⭐⭐☆ + Progress Bar + "4 stars"
Title:  ✅ "Title looks good" (green when valid)
       ❌ "5 more characters needed" (red when invalid)
Review: ✅ "Review is detailed enough" (green when valid)
       ❌ "20 more characters needed" (red when invalid)
```

### Validation Rules

- **Rating**: 1-5 stars (required)
- **Title**: 5-100 characters (required)
- **Content**: 20-1000 characters (required)
- **Submit**: Disabled until all valid

### UI Elements

- Large 40px star buttons
- Visual progress bar (rating %)
- Real-time character counters
- Color-coded validation
- Review guidelines section
- Verified purchase badge
- Auto-reset on close

## 🔧 Common Tasks

### Add Review as User

```tsx
// User clicks button
<Button onClick={handleOpenReviewSidebar}>
  Write a Review
</Button>

// Sidebar component
<ReviewSidebar
  productId={productId}
  productName={productName}
  isVerifiedPurchase={hasPurchased}
  isOpen={isReviewSidebarOpen}
  onClose={handleCloseReviewSidebar}
  onReviewSubmitted={handleReviewSubmitted}
/>
```

### Approve Review (Admin)

```tsx
await approveReview(reviewId, adminEmail);
// Auto-recalculates product ratings
```

### Get Product Reviews

```tsx
const data = await getProductReviews(productId);
// Returns: reviews, averageRating, totalReviews, ratingDistribution
```

## 📊 Data Structure

### Review Object

```typescript
{
  _id: string;
  product: {
    _ref: string;
  }
  user: {
    _ref: string;
  }
  rating: 1 - 5;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  createdAt: datetime;
}
```

### Product Rating Fields

```typescript
{
  averageRating: number(0 - 5);
  totalReviews: number;
  ratingDistribution: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  }
}
```

## 🎯 Status Flow

```
User Submits → "pending"
              ↓
Admin Approves → "approved" → Shows on product page
              ↓
Admin Rejects → "rejected" → Hidden
```

## ✅ Validations

### Client-Side (Sidebar)

- Star rating selected
- Title length >= 5
- Content length >= 20
- Visual feedback for each

### Server-Side (Actions)

- User authenticated
- No duplicate reviews
- Valid rating (1-5)
- Text length requirements
- Purchase verification

## 🔒 Security

- ✅ Authentication required (Clerk)
- ✅ One review per user per product
- ✅ Admin-only approval
- ✅ Server-side validation
- ✅ Input sanitization

## 📱 Responsive

- Desktop: Sidebar slides from right (max-width: lg)
- Mobile: Full-width sidebar
- Touch-friendly star buttons (40px)
- Scrollable content area

## 🎨 Color Scheme

```css
Stars: shop_light_green (filled)
Success: green-600
Error: red-500
Info: blue-50/blue-700
Primary: shop_dark_green
```

## 🚨 Error Handling

### Common Errors

1. **"Please sign in"** → User not authenticated
2. **"Already reviewed"** → Duplicate prevention
3. **"Title too short"** → Min 5 chars needed
4. **"Review too short"** → Min 20 chars needed

### Solutions

- Check `isSignedIn` state
- Use `canUserReviewProduct()` before showing button
- Show character counts
- Disable submit until valid

## 📈 Performance Tips

1. Use `React.memo` on components
2. Wrap callbacks in `useCallback`
3. Cache ratings in product document
4. Load only approved reviews
5. Paginate long review lists

## 🔗 Integration Points

### Product Page

```tsx
<ProductReviews productId={product._id} productName={product.name} />
```

### Admin Dashboard

```tsx
<AdminReviews />
// Shows all pending reviews
```

## 📚 Documentation

- **Full Guide**: `docs/REVIEW_SYSTEM.md`
- **Implementation**: `docs/REVIEW_SYSTEM_IMPLEMENTATION.md`
- **This File**: Quick reference

## 🎉 Key Differences from Modal

### Before (Modal/Dialog):

- ❌ Center popup overlay
- ❌ Limited space
- ❌ Less immersive

### After (Sidebar):

- ✅ Slides from right edge
- ✅ Full-height form
- ✅ More space for content
- ✅ Better mobile experience
- ✅ Modern UX pattern
- ✅ Can see product while writing

## 💡 Tips

1. **Verified Badge**: Automatically shows if user purchased
2. **Helpful Count**: Users can mark reviews helpful
3. **Admin Notes**: Internal notes when rejecting
4. **Auto-Update**: Ratings recalculate on approval
5. **Form Reset**: Clears automatically on submit/close

## 🎓 Example Usage

```tsx
// In your product page component
const [isReviewOpen, setIsReviewOpen] = useState(false);

// Open sidebar
<Button onClick={() => setIsReviewOpen(true)}>
  Write a Review
</Button>

// Sidebar component
<ReviewSidebar
  productId={product._id}
  productName={product.name}
  isVerifiedPurchase={hasPurchased}
  isOpen={isReviewOpen}
  onClose={() => setIsReviewOpen(false)}
  onReviewSubmitted={() => {
    // Reload reviews
    loadReviews();
  }}
/>
```

---

**Need Help?** Check the full documentation in `REVIEW_SYSTEM.md`
