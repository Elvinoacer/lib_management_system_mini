# Kitabu — v4 Audit Report
> Comparing previous findings against the uploaded codebase.  
> Date: March 13, 2026

---

## Previous Issues: What Was Fixed vs What Wasn't

| # | Issue | Status |
|---|---|---|
| 1 | `DATABASE_URL` missing from `prisma/schema.prisma` | ❌ **Still broken** |
| 2 | Seed uses `password` instead of `passwordHash` | ❌ **Still broken** |
| 3 | Seed upserts on non-unique `title` field | ❌ **Still broken** |
| 4 | `admin/stats` aggregates `_sum: { amount }` (wrong field) | ❌ **Still broken** |
| 5 | `admin/stats` maps `o.amount` in recentOrders | ❌ **Still broken** |
| 6 | `admin/orders` maps `order.amount` (wrong field) | ❌ **Still broken** |
| 7 | `SessionProvider` missing from `app/layout.tsx` | ❌ **Still broken** |
| 8 | `POST /api/books` passes `bookSchema` directly to Prisma (field mismatch) | ❌ **Still broken** |
| 9 | `bookSchema` has `fileUrl`, `fileFormat`, `pages` — not in Prisma model | ❌ **Still broken** |
| 10 | My Library download calls wrong endpoint (`/api/books/`) and checks `data.downloadUrl` | ❌ **Still broken** |
| 11 | My Library query fetches `/api/books?purchased=true` (no such filter exists) | ❌ **Still broken** |
| 12 | `app/cart/page.tsx` uses hardcoded mock data, not Zustand store | ❌ **Still broken** |
| 13 | `app/admin/page.tsx` missing `"use client"` directive | ❌ **Still broken** |
| 14 | `app/admin/books/page.tsx` uses `<Link>` without importing it | ❌ **Still broken** |
| 15 | `app/api/upload/route.ts` uses `R2_CUSTOM_DOMAIN` (should be `R2_PUBLIC_URL`) | ❌ **Still broken** |
| 16 | `app/checkout/success/page.tsx` does not exist (IntaSend redirects to 404) | ❌ **Still missing** |
| 17 | No `GET /api/orders` for user's own order list — `app/orders/page.tsx` still uses mock data | ❌ **Still broken** |
| 18 | Free books (`isFree: true`, price 0) still routed through IntaSend | ❌ **Still broken** |
| 19 | `components/books/featured-books.tsx` still uses hardcoded mock data | ❌ **Still broken** |
| 20 | Webhook has no signature verification | ❌ **Still missing** |
| 21 | `.env.example` not committed | ❌ **Still missing** |
| 22 | Register UI says "8 characters min", Zod validates `min(6)` | ❌ **Still present** |
| 23 | `next.config.mjs` has `ignoreBuildErrors: true` | ❌ **Still present** |

**0 of 23 previously reported issues were fixed in this upload.**

---

## New Bugs Found in v4

These are issues not in the previous report, found during this audit pass.

---

### New Bug 1 — `phoneNumber` is captured but never sent to the API
**File:** `app/checkout/page.tsx`

The UI has a fully functional M-Pesa phone number input field, and `phoneNumber` state is populated when the user types. But the `handleCheckout` function never sends it to `POST /api/orders`. The API also doesn't accept it. For M-Pesa STK Push to work, the phone number must be passed through to IntaSend.

```ts
// ❌ Current — phoneNumber is collected but silently dropped
body: JSON.stringify({
  bookIds: items.map(item => item.id)
})

// ✅ Fix — pass phone through, validate it first
if (paymentMethod === "mpesa" && !phoneNumber) {
  toast.error("Please enter your M-Pesa phone number")
  return
}

body: JSON.stringify({
  bookIds: items.map(item => item.id),
  phoneNumber,
})

// Also update POST /api/orders to accept and forward it to IntaSend:
const { bookIds, phoneNumber } = orderCreateSchema.parse(body)
// then pass to intasend.collection().charge({ ..., phone_number: phoneNumber })
```

---

### New Bug 2 — Card payment fields are fully rendered UI but do nothing
**File:** `app/checkout/page.tsx`

The "Card" payment tab shows card number, expiry, CVV, and cardholder name inputs. When the user fills these out and clicks Pay, `handleCheckout` sends only `bookIds` — no card data — and the request goes to `POST /api/orders` which always calls IntaSend's hosted checkout (a redirect flow), not a card charge API. The card fields are dead UI that creates a false impression of card payment support.

**Fix options:**
- Remove the Card tab entirely until card payments are properly implemented via IntaSend's card API
- Or clearly label it as "coming soon" and disable the Pay button when card is selected

---

### New Bug 3 — Cart page `removeItem` does not work (local state only)
**File:** `app/cart/page.tsx`

The cart page still uses a local `useState` array (`initialCartItems`) with a local `removeItem` that filters that array. Meanwhile, the Zustand store (`lib/store/cart.ts`) is the actual source of cart state — used by the header (badge count), books page (add to cart), and checkout page. Removing an item on the cart page only updates the local visual state; the Zustand store is untouched, so after navigation the removed item reappears, the header badge still counts it, and it will still appear in checkout.

```ts
// ❌ Current — disconnected from real store
const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
const removeItem = (id: string) => {
  setCartItems(cartItems.filter((item) => item.id !== id))
}

// ✅ Fix
import { useCart } from "@/lib/store/cart"
const { items: cartItems, removeItem } = useCart()
```

---

### New Bug 4 — Header nav links go to non-existent pages
**File:** `components/header.tsx`

Three nav items link to pages that don't exist in the app:
- `/categories` — no such route
- `/new-releases` — no such route  
- `/free-books` — no such route

These will all 404. They should either link to `/books` with appropriate filter params (e.g. `/books?isFree=true`) or be removed until the pages are built.

---

### New Bug 5 — Login page links to `/forgot-password` which doesn't exist
**File:** `app/login/page.tsx`

```tsx
<Link href="/forgot-password" className="text-sm text-primary hover:underline">
  Forgot password?
</Link>
```

There is no `app/forgot-password/page.tsx`. Clicking this throws a 404. Either remove the link or build a password reset flow.

---

### New Bug 6 — `DELETE /api/books/[id]` does not clean up related records
**File:** `app/api/books/[id]/route.ts`

The delete handler calls `prisma.book.delete()` directly. The `Book` model has three child relations: `OrderItem`, `Download`, and `Review`. Without cascading deletes configured in the Prisma schema, this will throw a foreign key constraint error whenever a book has been purchased (has orders/downloads) or reviewed.

```prisma
// ❌ Current schema has no onDelete cascade on Book's relations
orderItems    OrderItem[]
downloads     Download[]
reviews       Review[]

// ✅ Fix option 1 — add cascade delete to schema
model OrderItem {
  book    Book    @relation(fields: [bookId], references: [id], onDelete: Cascade)
}
model Download {
  book    Book    @relation(fields: [bookId], references: [id], onDelete: Cascade)
}
model Review {
  book    Book    @relation(fields: [bookId], references: [id], onDelete: Cascade)
}

// ✅ Fix option 2 — delete in a transaction in the route
await prisma.$transaction([
  prisma.review.deleteMany({ where: { bookId: params.id } }),
  prisma.download.deleteMany({ where: { bookId: params.id } }),
  prisma.orderItem.deleteMany({ where: { bookId: params.id } }),
  prisma.book.delete({ where: { id: params.id } }),
])
```

---

### New Bug 7 — `intasend` is initialized with wrong sandbox flag
**File:** `lib/intasend.ts`

```ts
export const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY!,
  process.env.INTASEND_SECRET_KEY!,
  process.env.NODE_ENV !== 'production'   // ← third param is isTest
)
```

This means in development (`NODE_ENV=development`), `isTest=true` which is correct. But in production, `isTest=false` which is also what you want — so this logic is technically correct. However, it means there is no way to run a test/staging environment in "production" mode without hitting live IntaSend. Consider using a dedicated `INTASEND_TEST_MODE=true` env var for more explicit control.

This is a minor concern, not a crash bug, but worth noting for staging environments.

---

### New Bug 8 — `app/orders/[id]/route.ts` uses `params.id` directly (Next.js 15 async params warning)
**File:** `app/api/orders/[id]/route.ts`  
Also affects: `app/api/books/[id]/route.ts`, `app/api/downloads/[bookId]/route.ts`

In Next.js 15, route params are `Promise`-based and must be awaited. The current code accesses `params.id` synchronously, which will produce a warning and may break in strict mode or future Next.js versions.

```ts
// ❌ Current — synchronous params access
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({ where: { id: params.id } })

// ✅ Fix — await params
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id } })
```

This applies to all dynamic route handlers: `[id]` and `[bookId]`.

---

### New Bug 9 — `my-library/page.tsx` renders `book.coverUrl` without a fallback (potential crash)
**File:** `app/my-library/page.tsx`

The grid and list views both render:
```tsx
<Image src={book.coverUrl} alt={book.title} fill ... />
```

`coverUrl` is defined as `String?` (nullable) in the Prisma schema. If any book has no cover image, `src` will be `null` or `undefined`, which causes Next.js `<Image>` to throw. Other pages (books list, book detail, admin books) all handle this with a fallback. My Library doesn't.

```tsx
// ✅ Fix
<Image
  src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop"}
  alt={book.title}
  fill
  className="object-cover"
/>
```

---

### New Bug 10 — Checkout does not clear the cart after a successful redirect
**File:** `app/checkout/page.tsx`

When `handleCheckout` succeeds, the user is redirected to IntaSend's hosted page via `window.location.href = data.url`. The cart is never cleared. After the user completes payment and returns, their cart still contains the purchased items. `clearCart()` should be called either here before redirect, or inside `checkout/success/page.tsx` once the order is confirmed.

```ts
// ✅ Fix — call clearCart before redirect
const clearCart = useCart((state) => state.clearCart)

// in handleCheckout, after getting data.url:
if (data.url) {
  clearCart()
  window.location.href = data.url
}
```

---

### New Bug 11 — `app/books/[id]/page.tsx` shows "Add to Cart" for books already in the cart
**File:** `app/books/[id]/page.tsx`

The Add to Cart button has no awareness of whether the item is already in the cart. Clicking it repeatedly adds nothing (the store deduplicates by id) but the button label never changes to "In Cart" or "Go to Cart", leaving users confused about whether it worked.

```ts
// ✅ Fix
const items = useCart((state) => state.items)
const isInCart = items.some(i => i.id === book.id)

// In the button:
<Button size="lg" className="gap-2" onClick={isInCart ? () => router.push('/cart') : handleAddToCart}>
  <ShoppingCart className="h-5 w-5" />
  {isInCart ? "Go to Cart" : "Add to Cart"}
</Button>
```

---

## Complete Priority List (All Issues)

| Priority | File | Description |
|---|---|---|
| 🔴 | `prisma/schema.prisma` | Add `url = env("DATABASE_URL")` to datasource block |
| 🔴 | `app/layout.tsx` | Add `<SessionProvider>` wrapping children |
| 🔴 | `app/api/admin/stats/route.ts` | `amount` → `totalAmount` in aggregate and recentOrders map |
| 🔴 | `app/api/admin/orders/route.ts` | `order.amount` → `order.totalAmount` |
| 🔴 | `prisma/seed.ts` | `password` → `passwordHash`; use `isbn` as upsert key; add `fileKey`; remove `fileFormat`; `language: "en"` |
| 🔴 | `app/api/books/route.ts` + `lib/validations/index.ts` | Fix `bookSchema` → Prisma field mapping (`fileKey`, `pageCount`); remove `fileUrl`, `fileFormat`, `pages` |
| 🔴 | `app/admin/page.tsx` | Add `"use client"` as first line |
| 🔴 | `app/admin/books/page.tsx` | Add `import Link from "next/link"` |
| 🔴 | `app/api/books/[id]/route.ts` | Add cascade delete or transaction before `book.delete()` |
| 🟠 | `app/my-library/page.tsx` | Fix download: `GET /api/downloads/${id}` + check `data.url` |
| 🟠 | `app/my-library/page.tsx` | Fix query: create `GET /api/my-library` returning user's purchased books |
| 🟠 | `app/my-library/page.tsx` | Add `coverUrl` fallback to `<Image>` |
| 🟠 | `app/cart/page.tsx` | Replace mock `useState` with `useCart()` from Zustand store |
| 🟠 | `app/api/upload/route.ts` | `R2_CUSTOM_DOMAIN` → `R2_PUBLIC_URL` |
| 🟠 | `app/orders/page.tsx` | Replace mock data; add `GET /api/orders` (user's own orders list) |
| 🟠 | `app/checkout/success/page.tsx` | Create this page — IntaSend redirects here after payment |
| 🟠 | `app/api/orders/route.ts` | Add free books bypass (skip IntaSend when total = 0, grant downloads directly) |
| 🟠 | `app/checkout/page.tsx` | Pass `phoneNumber` to API; validate it's present when M-Pesa selected |
| 🟠 | `app/checkout/page.tsx` | Call `clearCart()` before redirecting to IntaSend |
| 🟠 | `app/checkout/page.tsx` | Remove/disable card payment fields — they collect data but do nothing |
| 🟡 | `components/books/featured-books.tsx` | Replace hardcoded array with `useQuery → GET /api/books` |
| 🟡 | `app/api/webhooks/intasend/route.ts` | Add HMAC signature verification |
| 🟡 | `components/header.tsx` | Fix nav links `/categories`, `/new-releases`, `/free-books` (404s) |
| 🟡 | `app/login/page.tsx` | Remove or build `/forgot-password` link |
| 🟡 | `app/books/[id]/page.tsx` | Show "In Cart" / "Go to Cart" when book already added |
| 🟡 | All dynamic API routes (`[id]`, `[bookId]`) | Await `params` for Next.js 15 compatibility |
| 🟢 | `.env.example` | Create with all required env var keys |
| 🟢 | `app/register/page.tsx` | Align "8 characters" hint with Zod `min(6)` |
| 🟢 | `next.config.mjs` | Remove `ignoreBuildErrors: true` before production |