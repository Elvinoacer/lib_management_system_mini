# Kitabu — Audit Report v2
> Covers: Page gap check + all hardcoded/dummy data across pages, components, and APIs

---

## Part 1 — Page Coverage

### ✅ All 13 Previously Missing Pages Now Exist
Every page identified in the last audit has been created:
`/categories`, `/new-releases`, `/free-books`, `/settings`, `/profile`, `/forgot-password`, `/help`, `/contact`, `/faqs`, `/terms`, `/privacy`, `/refunds`, `/admin/settings`

### ⚠️ Remaining Page Issues (3)

#### Issue P-1: `components/header.tsx` nav links don't point to the new dedicated pages
The `navItems` array in the main header still uses old redirect-based hrefs instead of the new pages:

```tsx
// CURRENT (wrong)
{ label: "Categories", href: "/books" }          // ← goes to /books, not /categories
{ label: "New Releases", href: "/books?sort=new" } // ← /books doesn't handle ?sort=new
{ label: "Free Books", href: "/books?isFree=true" } // ← /books doesn't handle ?isFree=true

// SHOULD BE
{ label: "Categories", href: "/categories" }
{ label: "New Releases", href: "/new-releases" }
{ label: "Free Books", href: "/free-books" }
```

**File:** `components/header.tsx` lines 11–14

---

#### Issue P-2: `/api/books` does not handle `?isFree=true` or `?sort=new` query params
Even if the header navItems were fixed to query params, the API ignores them. The `GET /api/books` route only supports `?q=` and `?genre=`. The `isFree` and sort-by-new filters are only applied client-side inside the page components, which means **all books are fetched and filtered in the browser** — wasteful and won't scale.

**Files:**
- `app/api/books/route.ts` — add `isFree` and `sort` param support
- `app/free-books/page.tsx` — replace client-side filter with `fetch('/api/books?isFree=true')`
- `app/new-releases/page.tsx` — replace client-side sort with `fetch('/api/books?sort=new&limit=12')`

---

#### Issue P-3: `/checkout/success` page exists but nothing links to it
`app/checkout/success/page.tsx` exists but is never referenced by the checkout flow or webhook handler. The IntaSend webhook at `app/api/webhooks/intasend/route.ts` marks orders as PAID but doesn't redirect the user anywhere. The checkout page (`app/checkout/page.tsx`) also has no success state routing.

**Fix:** After a successful payment confirmation, redirect or navigate the user to `/checkout/success`.

---

## Part 2 — Hardcoded / Dummy Data

### 2A — Components

---

#### Dummy-1: Dashboard sidebar shows hardcoded user — `components/dashboard/sidebar.tsx`

**Lines 64–65:**
```tsx
<p className="text-sm font-medium text-foreground">John Doe</p>
<p className="text-xs text-muted-foreground">john@example.com</p>
```

This is completely static. The sidebar has access to nothing from the session. The Sign Out button also has no `onClick` handler — clicking it does nothing.

**Fix:** Add `useSession()` and wire up `signOut()`:
```tsx
import { useSession, signOut } from "next-auth/react"

const { data: session } = useSession()

// Replace hardcoded values with:
<p className="font-medium">{session?.user?.name}</p>
<p className="text-xs text-muted-foreground">{session?.user?.email}</p>

// Add signOut to the button:
<Button onClick={() => signOut({ callbackUrl: "/login" })}>Sign Out</Button>
```

---

#### Dummy-2: Admin sidebar shows hardcoded admin identity — `components/admin/sidebar.tsx`

**Lines 70–71:**
```tsx
<p className="text-sm font-medium text-foreground">Admin User</p>
<p className="text-xs text-muted-foreground">admin@kitabu.com</p>
```

Same problem — static placeholder. Needs `useSession()`.

**Fix:** Same pattern as Dummy-1 above.

---

### 2B — Pages

---

#### Dummy-3: Profile page — "Member Since" is hardcoded as "2026" — `app/profile/page.tsx`

**Line 116:**
```tsx
<p className="mt-1 text-2xl font-bold text-foreground">2026</p>
```

This is literally a hardcoded year.

**Fix:** The User model has a `createdAt` field. Add it to the session or fetch it from a profile API:
```tsx
// Fetch from /api/user/profile, then:
<p className="mt-1 text-2xl font-bold">{new Date(user.createdAt).getFullYear()}</p>
```

---

#### Dummy-4: Profile page — "Books Owned" shows `--` — `app/profile/page.tsx`

**Lines 120–123:**
```tsx
<div className="p-4 bg-primary/5 ...">
  <p className="text-sm font-medium text-muted-foreground">Books Owned</p>
  <p className="mt-1 text-2xl font-bold text-foreground">--</p>
</div>
```

The count is never fetched. The `/api/my-library` endpoint already exists and returns the user's books.

**Fix:** Use the existing query or add a `count` to `/api/user/profile`:
```tsx
const { data: books } = useQuery({ queryKey: ['purchased-books'], queryFn: () => fetch('/api/my-library').then(r => r.json()) })
// Then:
<p className="text-2xl font-bold">{books?.length ?? 0}</p>
```

---

#### Dummy-5: Profile page — save is a fake delay, not a real API call — `app/profile/page.tsx`

**Lines 35–36:**
```tsx
// Simulate API update for profile details
await new Promise(resolve => setTimeout(resolve, 1000))
```

There is **no** `PATCH /api/user/profile` route. The form collects the updated name but never saves it to the database.

**Fix needed:**
1. Create `app/api/user/profile/route.ts` with a `PATCH` handler that calls `prisma.user.update()`
2. Replace the fake timeout with `await fetch('/api/user/profile', { method: 'PATCH', body: JSON.stringify({ name }) })`

---

#### Dummy-6: Settings page — password change is a fake delay — `app/settings/page.tsx`

**Lines 31–32:**
```tsx
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 1500))
```

There is **no** `POST /api/user/password` route. The form collects current/new passwords but nothing is validated or saved.

**Fix needed:**
1. Create `app/api/user/password/route.ts` with a `POST` handler that: verifies the current password against `passwordHash` using bcrypt, then updates with a new hash
2. Wire the form to this endpoint

---

#### Dummy-7: Settings page — notification switches have no persistence — `app/settings/page.tsx`

The "Order Updates" and "Promotional Emails" switches use `defaultChecked` / no state — their values are never saved anywhere.

**Fix:** Either add a `notificationPrefs` field to the User model, or store these server-side in a settings table. Wire both switches to an API endpoint.

---

#### Dummy-8: Categories page uses a static hardcoded list — `app/categories/page.tsx`

```tsx
// Ideally, this list would be generated dynamically from all unique genres in the DB.
// Using a static representative list for the category browsing page.
const categories = [
  { name: "Business", slug: "Business", ... count: "+" },
  { name: "Technology", ... count: "+" },
  // ...8 hardcoded entries
]
```

The comment itself acknowledges this should be dynamic. Book counts show `"+"` as a placeholder. If new genres are added to books in the DB, they'll never appear here.

**Fix:** Create `GET /api/categories` that aggregates unique genres with counts:
```ts
// In API route:
const books = await prisma.book.findMany({ select: { genres: true } })
const genreMap = new Map<string, number>()
books.forEach(b => b.genres.forEach(g => genreMap.set(g, (genreMap.get(g) ?? 0) + 1)))
```
Then fetch this in `CategoriesPage` with `useQuery`.

---

#### Dummy-9: Admin settings page has hardcoded config values and a fake save — `app/admin/settings/page.tsx`

Several input `defaultValue`s are hardcoded strings:

| Field | Hardcoded value |
|---|---|
| Platform Name | `"Kitabu LMS"` |
| Support Email | `"support@kitabu.com"` |
| IntaSend PK | `"pk_test_****************"` |
| Cloud Name | `"your-cloud-name"` |
| API Key | `"8472947294"` |

And the save handler is simulated:
```tsx
// Simulate Admin Settings API call
await new Promise(resolve => setTimeout(resolve, 1500))
```

**Fix:** Since sensitive config belongs in environment variables, this page should at minimum read the current values from env (via a secure server-side API) and display them masked. The "Save" action should write to env or a `settings` DB table. At minimum, remove the fake timeout and connect a real endpoint.

---

#### Dummy-10: Contact page — form submission is a fake delay — `app/contact/page.tsx`

**Lines 21–22:**
```tsx
// Simulate API call for form submission
await new Promise(resolve => setTimeout(resolve, 1500))
```

Contact messages submitted through the form are silently discarded.

**Fix:** Create `POST /api/contact` that emails the message (using a service like Resend/SendGrid) or stores it in a DB table for admin review.

---

#### Dummy-11: Forgot password page — sends no actual email — `app/forgot-password/page.tsx`

**Lines 19–20:**
```tsx
// Simulate API call for forgot password
await new Promise(resolve => setTimeout(resolve, 1500))
```

Users who request a password reset never receive an email. There's also no `/api/auth/forgot-password` route and no companion `/reset-password?token=` page.

**Fix needed:**
1. Create `POST /api/auth/forgot-password` — generate a signed token, store it (or use a short-lived JWT), send email
2. Create `app/reset-password/page.tsx` — accept `?token=`, validate it, update `passwordHash` in DB

---

### 2C — APIs

---

#### Dummy-12: `GET /api/admin/users` — `status` field is always `"Active"` — `app/api/admin/users/route.ts`

**Line 50:**
```ts
status: "Active"  // hardcoded for every user
```

There is no `status` or `isSuspended` field on the User model. Every user is always shown as Active, and the "Suspend User" action in the UI does nothing.

**Fix:** Add a `status` (or `isSuspended: Boolean`) field to the User model in `prisma/schema.prisma`, create a migration, and expose a `PATCH /api/admin/users` endpoint that toggles it. The existing PATCH handler only handles `role` changes.

---

#### Dummy-13: `GET /api/admin/users` — `totalSpent` is never returned — `app/api/admin/users/route.ts`

The Users page table has a "Total Spent" column and the UI checks `user.totalSpent`, but the API never includes it. Every user always shows `"-"`.

**Fix:** Add a Prisma aggregate to compute total spend per user:
```ts
const users = await prisma.user.findMany({
  // ... existing query
  include: {
    _count: { select: { orders: true } },
    orders: {
      where: { status: "PAID" },
      select: { totalAmount: true }
    }
  }
})

// In the map:
totalSpent: user.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
```

---

#### Dummy-14: Admin dashboard "Top Selling Books" is a placeholder — `app/admin/page.tsx`

```tsx
<p className="text-muted-foreground text-sm">Feature coming soon: Sales analytics by book.</p>
```

The data to build this **already exists** in the DB — `OrderItem` has `bookId` and `price`. This just needs a query.

**Fix:** Add a `topBooks` field to the `GET /api/admin/stats` response:
```ts
const topBooks = await prisma.orderItem.groupBy({
  by: ['bookId'],
  _count: { bookId: true },
  _sum: { price: true },
  orderBy: { _count: { bookId: 'desc' } },
  take: 5,
})
// Then join with book titles
```

---

#### Dummy-15: `GET /api/books` — does not support `?isFree=true` or `?sort=new` — `app/api/books/route.ts`

The `free-books` and `new-releases` pages currently fetch **all** books and filter/sort in the browser. The API only supports `?q=` and `?genre=`.

**Fix:** Add to the `where` clause and `orderBy`:
```ts
const isFree = searchParams.get("isFree") === "true"
const sort = searchParams.get("sort") // "new"

const books = await prisma.book.findMany({
  where: {
    AND: [
      // ... existing q/genre filters
      isFree ? { isFree: true } : {},
    ]
  },
  orderBy: sort === "new" ? { createdAt: 'desc' } : { createdAt: 'desc' },
  // ...
})
```

---

## Summary Table

| # | Category | Location | Severity | Issue |
|---|---|---|---|---|
| P-1 | Page links | `components/header.tsx` | 🔴 High | Nav links to /books instead of /categories, /new-releases, /free-books |
| P-2 | API missing params | `app/api/books/route.ts` | 🔴 High | `?isFree=true` and `?sort=new` not supported; client-side filtering |
| P-3 | Dead page | `app/checkout/success/` | 🟠 Medium | Page exists but no flow leads to it |
| D-1 | Dummy data | `components/dashboard/sidebar.tsx` | 🔴 High | "John Doe" + "john@example.com" hardcoded; Sign Out broken |
| D-2 | Dummy data | `components/admin/sidebar.tsx` | 🔴 High | "Admin User" + "admin@kitabu.com" hardcoded |
| D-3 | Dummy data | `app/profile/page.tsx` | 🔴 High | "Member Since" hardcoded as "2026" |
| D-4 | Missing data | `app/profile/page.tsx` | 🟠 Medium | "Books Owned" always shows "--" |
| D-5 | Fake API | `app/profile/page.tsx` | 🔴 High | Profile save is a fake timeout; no `PATCH /api/user/profile` |
| D-6 | Fake API | `app/settings/page.tsx` | 🔴 High | Password change is a fake timeout; no `POST /api/user/password` |
| D-7 | No persistence | `app/settings/page.tsx` | 🟡 Medium | Notification switches never saved |
| D-8 | Static data | `app/categories/page.tsx` | 🟠 Medium | Category list hardcoded; counts show "+"; no DB query |
| D-9 | Fake API + hardcoded | `app/admin/settings/page.tsx` | 🟠 Medium | Config values hardcoded; save is a fake timeout |
| D-10 | Fake API | `app/contact/page.tsx` | 🟡 Medium | Contact form discards submissions; no backend |
| D-11 | Fake API | `app/forgot-password/page.tsx` | 🔴 High | No email sent; no reset token flow; no `/reset-password` page |
| D-12 | Hardcoded | `app/api/admin/users/route.ts` | 🟠 Medium | `status` always "Active"; no suspend feature in DB or API |
| D-13 | Missing data | `app/api/admin/users/route.ts` | 🟡 Medium | `totalSpent` never computed or returned |
| D-14 | Placeholder | `app/admin/page.tsx` | 🟡 Medium | "Top Selling Books" shows "Feature coming soon" |
| D-15 | Missing params | `app/api/books/route.ts` | 🟠 Medium | No `?isFree` or `?sort` filter; all filtering done in browser |

---

## New API Routes Required

| Route | Method | Purpose |
|---|---|---|
| `/api/user/profile` | `PATCH` | Save user name/avatar changes |
| `/api/user/password` | `POST` | Change password (verify old, hash new) |
| `/api/categories` | `GET` | Return unique genres + book counts from DB |
| `/api/auth/forgot-password` | `POST` | Generate reset token and send email |
| `/api/auth/reset-password` | `POST` | Validate token and update password |
| `/api/contact` | `POST` | Store or email contact form submissions |

## New Pages Required

| Page | Purpose |
|---|---|
| `app/reset-password/page.tsx` | Accept token from email, set new password |