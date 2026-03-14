# Kitabu — Audit Report v3
> Full audit: What's fixed, what's still broken, remaining dummy data, and bad UX flows

---

## Part 1 — What Was Fixed ✅

All previously reported issues have been addressed:
- All 13 missing pages now exist and nav links are corrected
- Dashboard and Admin sidebars read from `useSession()` — no more "John Doe"
- Profile page fetches real `createdAt` and books count from APIs
- Settings notifications persist via `/api/user/settings` + `GlobalSettings` DB model
- Password change hits a real `/api/user/password` with bcrypt verification
- Categories page queries DB dynamically via `/api/categories`
- Admin settings read/write from a `GlobalSettings` DB table
- Admin users table now shows real `totalSpent` and uses `isSuspended` from DB
- Admin dashboard "Top Selling Books" queries real `OrderItem` data
- `/api/books` now supports `?isFree=true` and `?sort=new`
- `/checkout/success` is now wired up from the polling flow

---

## Part 2 — Remaining Dummy / Placeholder Data (8 issues)

---

### D-1: `components/books/category-filter.tsx` — STILL a hardcoded static list
The sidebar filter on `/books` page is completely hardcoded despite `/api/categories` existing:

```tsx
const categories = [
  "All Categories", "Fiction", "Non-Fiction",
  "Business", "Technology", "Self-Help", "Biography", "Science", "History",
]
```

This is inconsistent with the `/categories` page which fetches dynamically. If an admin adds a new genre ("Spirituality", "Law"), it will never appear in the sidebar filter.

**Fix:** Replace the static array with a `useQuery` call to `/api/categories` and prepend "All Categories".

---

### D-2: `app/books/[id]/page.tsx` — Hardcoded rating of 4.5 and "12 reviews"
```tsx
<span className="font-medium text-foreground">4.5</span>
<span className="text-muted-foreground">(12 reviews)</span>
```
The `Review` model exists in the schema and has `rating` and `comment` fields but is never queried. Every single book shows the same 4.5 / 12 reviews.

**Fix:** Add `reviews: { select: { rating: true } }` to the `GET /api/books/[id]` query. Compute average rating and count in the API response.

---

### D-3: `app/books/[id]/page.tsx` — "PDF & EPUB" format claim is hardcoded
```tsx
<Check className="h-4 w-4 text-primary" />
Available in PDF & EPUB formats
```
The `Book` schema has no `format` field. Files are stored in Cloudinary with a `fileKey`. The actual format depends on what was uploaded. Claiming every book comes in both PDF and EPUB is false.

**Fix:** Either add a `format` field to the `Book` model (e.g., `format: String[]`), or change the text to "Digital download" which is always true.

---

### D-4: `app/api/contact/route.ts` — Contact form submissions are discarded (console.log only)
```ts
// In a real application, you would integrate SendGrid, Resend, or another email provider here
console.log(`[CONTACT FORM SUBMISSION] From: ${firstName}...`)
```
Users who submit the contact form believe their message was sent. It is not. It only prints to server logs.

**Fix:** Either (a) save to a `ContactMessage` DB table and add an admin UI to view messages, or (b) integrate a real email provider (Resend is the recommended modern approach for Next.js apps).

---

### D-5: `app/api/auth/forgot-password/route.ts` — Password reset emails are not sent
```ts
// Simulate sending email.
console.log(`[PASSWORD RESET] Email to: ${email}`)
console.log(`Reset Link: ${resetUrl}`)
```
The reset link only appears in server logs. Users see "Check your email" but receive nothing. The entire forgot-password feature is non-functional in production.

**Fix:** Integrate Resend/SendGrid/Nodemailer to actually dispatch the reset email. Until integrated, the UI should not claim an email was sent.

---

### D-6: `app/api/auth/forgot-password/route.ts` + `reset-password/route.ts` — Hardcoded fallback JWT secret
```ts
process.env.NEXTAUTH_SECRET || "fallback-secret-key-*%"
```
If `NEXTAUTH_SECRET` is not set in production, reset tokens are signed with a publicly visible hardcoded key, making them trivially forgeable.

**Fix:** Throw an error if `NEXTAUTH_SECRET` is missing rather than silently falling back:
```ts
const secret = process.env.NEXTAUTH_SECRET
if (!secret) throw new Error("NEXTAUTH_SECRET is not configured")
```

---

### D-7: `app/admin/settings/page.tsx` — Cloudinary section has hardcoded fake credentials
```tsx
<Input id="cloud-name" defaultValue="your-cloud-name" disabled />
<Input id="api-key" type="password" defaultValue="8472947294" disabled />
```
These inputs are disabled so they can't be edited, but they show obviously fake placeholder values. The note says "managed via Environment Variables" which is correct, but it should display the actual env value (masked) or simply remove the fields entirely.

**Fix:** Read `process.env.CLOUDINARY_CLOUD_NAME` in a server action and display the real masked value (e.g., `your-c***`), or replace these inputs with a clear note that these are env-only configs.

---

### D-8: `lib/auth.ts` — Debug `console.log` statements left in production auth code
```ts
console.log("Login attempt for:", credentials?.email)
console.log("User not found via email")
console.log("Bcrypt comparison isValid:", isValid)
```
This logs every login attempt's email and bcrypt result to server output — a privacy and security concern in production.

**Fix:** Remove all three `console.log` statements. Use proper structured logging if needed.

---

## Part 3 — Remaining Code Bugs (5 issues)

---

### B-1: 🔴 CRITICAL — `app/api/orders/route.ts` — Webhook can never find the order (payment flow is broken)
This is the most critical bug in the entire codebase. The IntaSend checkout is created with a **temporary `api_ref`** before the order exists in the DB:

```ts
// Step 1: Create IntaSend checkout
const checkout = await intasend.collection().charge({
  api_ref: `TEMP-${Date.now()}`,  // ← temporary placeholder
  ...
})

// Step 2: Create order AFTER
const order = await prisma.order.create({ ... intasendRef: checkout.id })
```

The webhook handler then tries to find the order using `payload.api_ref`:
```ts
const orderId = payload.api_ref  // = "TEMP-1234567890"
const order = await prisma.order.findUnique({ where: { id: orderId } })
// order is always null — the DB only has cuid() IDs, not TEMP-xxx
```

**Result:** Every paid M-Pesa transaction fires a webhook that logs "Order not found, ignoring." **No order ever gets marked PAID. No downloads are ever granted.**

**Fix:** Create the pending order in the DB *first*, then use the real `order.id` as the `api_ref`:
```ts
// 1. Create pending order first
const order = await prisma.order.create({
  data: { userId, totalAmount: total, status: "PENDING", items: { create: ... } }
})

// 2. Pass real order.id as api_ref
const checkout = await intasend.collection().charge({
  api_ref: order.id,  // ← real DB ID that webhook can look up
  ...
})

// 3. Update order with IntaSend reference
await prisma.order.update({
  where: { id: order.id },
  data: { intasendRef: checkout.id }
})
```

---

### B-2: `app/api/orders/me/route.ts` — Missing `orderNumber` and `paymentMethod` fields
The user-facing orders page (`app/orders/page.tsx`) expects both `order.orderNumber` and `order.paymentMethod` in the response, but `/api/orders/me` never returns them:

```ts
// /api/orders/me returns:
{ id, date, status, total, items }

// Page expects:
order.orderNumber  // → undefined, displays as blank
order.paymentMethod  // → undefined, displays as blank
```

**Fix:** Add these fields to the `/api/orders/me` response:
```ts
orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
paymentMethod: order.status === "PAID" ? "IntaSend / M-Pesa" : order.totalAmount === 0 ? "Free" : "Pending"
```

---

### B-3: `app/api/books/route.ts` — The `?sort=new` parameter does nothing different
```ts
orderBy: sort === 'new' ? { createdAt: 'desc' } : { createdAt: 'desc' }
```
Both branches of the ternary are identical. The sort param has no effect — all books are always sorted by `createdAt: 'desc'` regardless.

**Fix:** Add a meaningful alternative sort (e.g., default to `title asc` and use `createdAt desc` only when `sort=new`):
```ts
orderBy: sort === 'new' ? { createdAt: 'desc' } : { title: 'asc' }
```

---

### B-4: `app/admin/users/page.tsx` — "Suspend User" dropdown item has no `onClick`
The "Suspend User" menu item in the admin users table is purely decorative:
```tsx
<DropdownMenuItem className="gap-2 text-destructive">
  <Ban className="h-4 w-4" />
  Suspend User
</DropdownMenuItem>
```
There's no `onClick`. The backend PATCH endpoint now supports `isSuspended` but the UI never calls it.

**Fix:**
```tsx
<DropdownMenuItem
  onClick={() => updateRoleMutation.mutate({ userId: user.id, isSuspended: true })}
>
  Suspend User
</DropdownMenuItem>
```
Also add an "Unsuspend" option that appears when `user.status === "Suspended"`.

---

### B-5: `app/admin/users/page.tsx` — "View Profile" has no action
```tsx
<DropdownMenuItem className="gap-2">
  <Eye className="h-4 w-4" />
  View Profile
</DropdownMenuItem>
```
No `onClick`, no link, no navigation. Clicking it does nothing.

**Fix:** Navigate to a user profile detail route, or open a modal with the user's full details. Either `router.push(\`/admin/users/${user.id}\`)` (requires a new page) or a simple dialog showing name, email, join date, and order history.

---

## Part 4 — Bad UX Flows (8 issues)

---

### F-1: 🔴 Checkout Polling Has No Timeout or Cancel — Users Get Stuck Forever

**Current flow:**
1. User submits M-Pesa number → STK push sent
2. Checkout page enters polling mode: "Waiting for M-Pesa payment..."
3. The polling runs **indefinitely** with no maximum wait time
4. If user dismisses the STK push on their phone, the UI is frozen permanently

There is no cancel button, no "resend push" button, no timeout that gives up after N seconds, and no way for the user to go back without a hard browser refresh (which loses their cart state).

**Proposed strategy:**
```
- Set a timeout of 5 minutes (300 seconds)
- Show a countdown to the user: "Waiting... (4:47 remaining)"
- After timeout, show: "Payment not received. Your order is saved — try again."
- Show a "Cancel & Go Back" button that clears pollingOrder and re-enables the form
- Show a "Resend M-Pesa Push" button for when users miss the first prompt
```

---

### F-2: 🔴 Register → Must Login Again (No Auto-Login After Registration)

**Current flow:**
1. User fills out registration form
2. API creates account
3. `toast.success("Account created! Please sign in.")`
4. `router.push("/login")` — user must manually type credentials again

This is a jarring experience. The user just provided their email and password 10 seconds ago.

**Proposed strategy:**
After successful registration, automatically call `signIn("credentials", { email, password, redirect: false })` then redirect to `/books` or the `callbackUrl`. No separate login step needed.

---

### F-3: 🟠 Book Detail Page Shows "Add to Cart" Even When User Already Owns the Book

**Current flow:**
1. User has already purchased and downloaded "Book A"
2. User revisits the `/books/book-a` page
3. Page shows "Add to Cart" (or "Go to Cart" if it's in cart)
4. User adds to cart, proceeds to checkout
5. Checkout API returns `400: "You already own some of these books"` — error shown

The user is led all the way through the checkout flow before being told they already own the book.

**Proposed strategy:**
On the book detail page, if the user is authenticated, check their download records against the current book ID. Show a "Read / Download" button instead of "Add to Cart" if they already own it. This requires either:
- A `GET /api/my-library` call to check ownership (add `bookIds` array to response), or
- A `GET /api/books/[id]/ownership` endpoint

---

### F-4: 🟠 Cart Page Has No Auth Check — Users Discover Auth Only at Checkout

**Current flow:**
1. Unauthenticated user browses books, adds to cart
2. Navigates to `/cart` — page loads fine, shows cart
3. Clicks "Proceed to Checkout"
4. Checkout page redirects to login

The user is three pages deep before discovering they need an account. The cart should prompt login or surface a "Sign in to checkout" banner.

**Proposed strategy:** The cart page should detect unauthenticated users and show a prominent banner: _"Sign in to complete your purchase"_ with Sign In / Register buttons, ideally before they click "Proceed to Checkout." The cart items should remain (they persist in localStorage via Zustand).

---

### F-5: 🟠 Search on `/books` Fires an API Call on Every Keystroke (No Debounce)

**Current flow:**
- Search input is tied directly to `queryKey: ['books', searchQuery]`
- Typing "business" fires 8 consecutive API requests (b, bu, bus, busi...)

**Proposed strategy:** Debounce the search input by 300-400ms before updating `searchQuery` state. Use either `setTimeout` in the component or a library like `use-debounce`:
```ts
const [inputValue, setInputValue] = useState("")
const [searchQuery, setSearchQuery] = useState("")

useEffect(() => {
  const timer = setTimeout(() => setSearchQuery(inputValue), 350)
  return () => clearTimeout(timer)
}, [inputValue])
```

---

### F-6: 🟠 Wishlist Feature Is Client-Only State — Resets on Refresh

**Current flow:**
1. User clicks "Wishlist" on book detail page
2. Heart icon turns filled, state shows "Wishlisted"
3. User navigates away or refreshes
4. Wishlist is gone — it was stored in `useState`, not persisted anywhere

The Wishlist button implies persistence but provides none. Either remove it or implement it properly.

**Proposed strategy:**
Option A (preferred): Add a `Wishlist` model to the schema (`userId`, `bookId`, `createdAt`), create `POST/DELETE /api/wishlist/[bookId]`, show a wishlist page at `/my-library?tab=wishlist`.
Option B (quick): Remove the Wishlist button entirely until the feature is built. A broken promise is worse than a missing feature.

---

### F-7: 🟠 Delete Account Button Does Nothing

The "Danger Zone" section in `/settings` has a "Delete Account" button with no implementation:
```tsx
<Button variant="destructive">Delete Account</Button>
```

No confirmation dialog, no API call, no `onClick`. Users expecting GDPR/data deletion will find it silently non-functional.

**Proposed strategy:**
1. Add a confirmation `AlertDialog` ("Are you sure? This cannot be undone. Type your email to confirm.")
2. Create `DELETE /api/user/account` that: anonymizes or deletes user data, cancels active sessions, and handles related records (orders/downloads should be kept for audit, user record can be anonymized).

---

### F-8: 🟡 No Route-Level Auth Protection (Missing `proxy.ts`)

There is no `proxy.ts` file in this version. All auth checks happen client-side via `useSession()` in each page component. This means:
- The HTML/SSR content of protected pages (`/admin/*`, `/profile`, `/settings`, `/orders`) is served to unauthenticated requests before the client redirects
- Search engine crawlers and bots can potentially access protected page structures
- Users can briefly see protected page layouts before the auth redirect fires

**Proposed strategy:** Create `proxy.ts` using NextAuth's built-in middleware:
```ts
import NextAuth from 'next-auth'
import { authConfig } from './lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isProtectedRoute = ['/my-library', '/orders', '/profile', '/settings', '/checkout'].some(
    p => nextUrl.pathname.startsWith(p)
  )

  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return Response.redirect(new URL('/login', nextUrl))
  }

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ['/admin/:path*', '/my-library/:path*', '/orders/:path*', '/profile/:path*', '/settings/:path*', '/checkout/:path*']
}
```

---

## Summary Table

| # | Type | Severity | File | Issue |
|---|---|---|---|---|
| D-1 | Dummy data | 🟠 High | `components/books/category-filter.tsx` | Hardcoded static category list; doesn't use DB |
| D-2 | Dummy data | 🟠 High | `app/books/[id]/page.tsx` | Rating 4.5 and "12 reviews" hardcoded for every book |
| D-3 | Dummy data | 🟡 Medium | `app/books/[id]/page.tsx` | "PDF & EPUB formats" claim is false (no format field) |
| D-4 | Fake API | 🟠 High | `app/api/contact/route.ts` | Contact form submissions silently discarded |
| D-5 | Fake API | 🔴 Critical | `app/api/auth/forgot-password/route.ts` | Password reset emails never sent |
| D-6 | Security | 🔴 Critical | `app/api/auth/forgot-password/route.ts` | Hardcoded fallback JWT secret |
| D-7 | Dummy data | 🟡 Medium | `app/admin/settings/page.tsx` | Fake Cloudinary credentials displayed |
| D-8 | Debug code | 🟠 High | `lib/auth.ts` | Production debug `console.log` leaks user emails |
| B-1 | Bug | 🔴 Critical | `app/api/orders/route.ts` | `api_ref=TEMP-xxx` means webhook never finds order — no payments ever complete |
| B-2 | Bug | 🟠 High | `app/api/orders/me/route.ts` | `orderNumber` and `paymentMethod` never returned — shows blank in UI |
| B-3 | Bug | 🟡 Medium | `app/api/books/route.ts` | `?sort=new` has identical branches — does nothing |
| B-4 | Bug | 🟠 High | `app/admin/users/page.tsx` | "Suspend User" has no onClick; isSuspended never set from UI |
| B-5 | Bug | 🟡 Medium | `app/admin/users/page.tsx` | "View Profile" has no action |
| F-1 | Bad Flow | 🔴 Critical | `app/checkout/page.tsx` | M-Pesa polling has no timeout, no cancel — users stuck forever |
| F-2 | Bad Flow | 🟠 High | `app/register/page.tsx` | No auto-login after registration — double credential entry |
| F-3 | Bad Flow | 🟠 High | `app/books/[id]/page.tsx` | "Add to Cart" shown even for already-owned books |
| F-4 | Bad Flow | 🟠 High | `app/cart/page.tsx` | No auth prompt until checkout — late discovery |
| F-5 | Bad Flow | 🟡 Medium | `app/books/page.tsx` | Search fires API call on every keystroke — no debounce |
| F-6 | Bad Flow | 🟡 Medium | `app/books/[id]/page.tsx` | Wishlist is ephemeral state — lost on refresh |
| F-7 | Bad Flow | 🟡 Medium | `app/settings/page.tsx` | Delete Account button does nothing |
| F-8 | Security | 🔴 Critical | missing `proxy.ts` | No server-side route protection — all auth is client-only |

---

## Priority Action Plan

### 🔴 Fix Immediately (Breaks Core Functionality)
1. **B-1** — Fix `api_ref` ordering bug in checkout — nothing gets paid until this is fixed
2. **F-1** — Add polling timeout + cancel button to checkout
3. **D-5** — Integrate real email provider for password reset
4. **F-8** — Add `proxy.ts` for server-side route protection
5. **D-6** — Remove JWT secret fallback string

### 🟠 Fix Soon (Affects User Experience)
6. **B-2** — Add `orderNumber` and `paymentMethod` to `/api/orders/me`
7. **F-2** — Auto-login after registration
8. **F-3** — Show "Download" instead of "Add to Cart" for owned books
9. **D-1** — Make `CategoryFilter` component dynamic
10. **D-2** — Fetch real ratings from `Review` model
11. **D-8** — Remove debug `console.log` from auth
12. **B-4** — Wire "Suspend User" to the PATCH endpoint

### 🟡 Polish (Complete the Feature Set)
13. **B-3** — Fix `?sort=new` ternary
14. **D-3** — Add `format` field to Book model or remove false claim
15. **D-4** — Persist contact form messages
16. **D-7** — Display real masked env values in admin settings
17. **F-4** — Add auth prompt to cart page
18. **F-5** — Debounce search input
19. **F-6** — Either implement Wishlist properly or remove the button
20. **F-7** — Implement Delete Account with confirmation dialog
21. **B-5** — Wire "View Profile" to a detail view or modal