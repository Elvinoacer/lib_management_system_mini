# 🔍 Kitabu — Findings & Fix Suggestions

> Audit of the current codebase against `reqs/prd.md`  
> Date: March 13, 2026

---

## Summary

The project is in good shape overall — the full stack foundation is laid, all API routes exist, auth is wired, and most pages connect to real data. However, there are **11 bugs** that will cause crashes or broken features at runtime, plus **5 incomplete features** that still need work before the app is production-ready.

---

## 🔴 Bugs — Will Break at Runtime

---

### Bug 1 — `DATABASE_URL` missing from Prisma schema
**File:** `prisma/schema.prisma`

The `datasource db` block has no `url` field. Without it, Prisma cannot connect to any database. Every single API route will crash, `prisma migrate dev` will fail, and seeding will fail.

```prisma
// ❌ Current
datasource db {
  provider = "postgresql"
}

// ✅ Fix
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### Bug 2 — Seed uses wrong field name `password` instead of `passwordHash`
**File:** `prisma/seed.ts`, line ~14

The Prisma `User` model defines `passwordHash`, not `password`. Running `pnpm prisma db seed` will throw a Prisma validation error and no admin user will be created.

```ts
// ❌ Current
create: {
  email: "admin@kitabu.com",
  name: "Admin User",
  password: adminPassword,   // ← field does not exist on User model
  role: "ADMIN",
},

// ✅ Fix
create: {
  email: "admin@kitabu.com",
  name: "Admin User",
  passwordHash: adminPassword,
  role: "ADMIN",
},
```

---

### Bug 3 — Seed `upsert` uses non-unique field `title` for books
**File:** `prisma/seed.ts`, line ~43

Prisma `upsert` requires a `@unique` field in the `where` clause. `title` has no `@unique` constraint in the schema, so this throws at runtime. Additionally, seed books include `fileFormat` and `language: "English"` — both unknown to the schema (`language` default is `"en"`, and `fileFormat` doesn't exist on the `Book` model at all).

```ts
// ❌ Current
await prisma.book.upsert({
  where: { title: book.title },   // ← not a @unique field
  create: {
    ...book,
    fileFormat: "PDF",            // ← field doesn't exist on Book model
    language: "English",          // ← schema default is "en", not "English"
  }
})

// ✅ Fix — use isbn (which is @unique), add required fileKey, remove unknown fields
await prisma.book.upsert({
  where: { isbn: book.isbn },
  update: {},
  create: {
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    description: book.description,
    price: book.price,
    isFree: book.isFree,
    coverUrl: book.coverUrl,
    fileKey: "placeholder/filename.pdf",  // required field
    genres: book.genres,
    language: "en",
  }
})
```

---

### Bug 4 — Admin stats API aggregates wrong field `amount` (doesn't exist)
**File:** `app/api/admin/stats/route.ts`, line ~18

The Prisma `Order` model has `totalAmount`, not `amount`. This query will throw a Prisma type error at runtime, crashing the admin dashboard every time it loads.

```ts
// ❌ Current
const totalRevenue = await prisma.order.aggregate({
  where: { status: "PAID" },
  _sum: { amount: true }       // ← no such field
})

// ✅ Fix
const totalRevenue = await prisma.order.aggregate({
  where: { status: "PAID" },
  _sum: { totalAmount: true }
})
```

Also on line ~38, the mapping references `o.amount` which should be `o.totalAmount`:

```ts
// ❌ Current
amount: Number(o.amount),

// ✅ Fix
amount: Number(o.totalAmount),
```

---

### Bug 5 — Admin orders API maps wrong field `order.amount`
**File:** `app/api/admin/orders/route.ts`, line ~53

Same issue as Bug 4 — `Order` has no `amount` field. The formatted response will return `total: NaN` and incorrect `paymentMethod` for every order.

```ts
// ❌ Current
total: Number(order.amount),
paymentMethod: order.status === "PAID" ? "IntaSend" : order.amount > 0 ? "Pending" : "Free"

// ✅ Fix
total: Number(order.totalAmount),
paymentMethod: order.status === "PAID" ? "IntaSend" : Number(order.totalAmount) > 0 ? "Pending" : "Free"
```

---

### Bug 6 — `SessionProvider` missing from `app/layout.tsx`
**File:** `app/layout.tsx`

`next-auth/react` hooks — `useSession()`, `signIn()`, `signOut()` — all require a `<SessionProvider>` in the component tree. It is absent. Every page that calls these hooks (login, header, checkout, my-library) will silently return `null` sessions or throw a context error.

```tsx
// ✅ Fix — add to layout.tsx
import { SessionProvider } from 'next-auth/react'

// Wrap children:
<SessionProvider>
  <QueryProvider>
    {children}
    <Toaster position="top-center" richColors />
  </QueryProvider>
</SessionProvider>
```

---

### Bug 7 — `POST /api/books` passes `bookSchema` directly to Prisma (field mismatch)
**File:** `app/api/books/route.ts` + `lib/validations/index.ts`

`bookSchema` contains fields that don't exist on the Prisma `Book` model (`fileUrl`, `fileFormat`, `pages`), and is missing the required `fileKey` field. Calling `prisma.book.create({ data: validatedData })` directly will throw a Prisma unknown field error.

```ts
// ❌ Current bookSchema includes:
fileUrl: z.string().url()...   // ← not in Prisma model
fileFormat: z.string()...      // ← not in Prisma model
pages: z.number()...           // ← Prisma field is pageCount

// ✅ Fix option 1 — update bookSchema to match Prisma model
export const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(10),
  price: z.number().min(0),
  isFree: z.boolean().default(false),
  coverUrl: z.string().url().optional().or(z.literal("")),
  fileKey: z.string().min(1, "File key is required"),  // ← correct field
  genres: z.array(z.string()).min(1),
  language: z.string().default("en"),
  pageCount: z.number().optional(),                    // ← correct field name
})

// ✅ Fix option 2 — keep schema as-is, manually map fields in route.ts
const book = await prisma.book.create({
  data: {
    title: validatedData.title,
    author: validatedData.author,
    description: validatedData.description,
    price: validatedData.price,
    isFree: validatedData.isFree,
    coverUrl: validatedData.coverUrl || null,
    fileKey: validatedData.fileKey || "",
    genres: validatedData.genres,
    language: validatedData.language || "en",
    pageCount: validatedData.pages || null,
  }
})
```

---

### Bug 8 — My Library download handler calls the wrong API endpoint
**File:** `app/my-library/page.tsx`, lines ~43–50

The download button calls `GET /api/books/${book.id}` and looks for `data.downloadUrl` in the response. That endpoint returns book metadata — there is no `downloadUrl` field on it. The correct endpoint is `GET /api/downloads/${book.id}`, which returns `{ url }`. Every download attempt will fail silently with "Download link not available".

```ts
// ❌ Current
const res = await fetch(`/api/books/${book.id}`)
const data = await res.json()
if (data.downloadUrl) {
  window.open(data.downloadUrl, '_blank')
}

// ✅ Fix
const res = await fetch(`/api/downloads/${book.id}`)
const data = await res.json()
if (data.url) {
  window.open(data.url, '_blank')
}
```

---

### Bug 9 — My Library fetches from wrong endpoint (`/api/books?purchased=true`)
**File:** `app/my-library/page.tsx`, line ~28

`GET /api/books` has no `purchased` filter — it returns the full public book catalogue regardless of that param. The My Library page will show every book in the database to every user, not just their purchased books. There is no dedicated endpoint for fetching a user's purchased books.

```ts
// ❌ Current — returns all books, ignores purchased param
const res = await fetch(`/api/books?purchased=true`)

// ✅ Fix — needs a new API route GET /api/my-library (or /api/downloads)
// Create app/api/my-library/route.ts:
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const downloads = await prisma.download.findMany({
    where: { userId: session.user.id },
    include: { book: true }
  })

  return NextResponse.json(downloads.map(d => d.book))
}

// Then in my-library/page.tsx:
const res = await fetch('/api/my-library')
```

---

### Bug 10 — `app/admin/page.tsx` uses React hooks without `"use client"` directive
**File:** `app/admin/page.tsx`

The file calls `useQuery` (a React hook) but has no `"use client"` at the top. Next.js will treat it as a Server Component and throw a build/runtime error because hooks cannot run in Server Components.

```tsx
// ✅ Fix — add as the very first line of the file
"use client"

import Link from "next/link"
// ... rest of file
```

---

### Bug 11 — `app/api/upload/route.ts` references undefined env var `R2_CUSTOM_DOMAIN`
**File:** `app/api/upload/route.ts`, line ~35

The env variable used is `R2_CUSTOM_DOMAIN`, but the PRD and every other part of the code uses `R2_PUBLIC_URL`. When undefined, every upload response returns `"https://undefined/..."` as the public URL, which will be stored in the database and break all cover image displays.

```ts
// ❌ Current
const publicUrl = `https://${process.env.R2_CUSTOM_DOMAIN}/${fileKey}`

// ✅ Fix
const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`
```

---

## 🟡 Incomplete Features — Functionally Broken

---

### Missing 1 — `app/orders/page.tsx` still uses hardcoded mock data
**File:** `app/orders/page.tsx`

This page was never updated from the original mock. It shows three fake static orders to every user. There is also no `GET /api/orders` route for listing a user's own orders (only `GET /api/orders/[id]` for a single order exists).

**What needs doing:**
1. Create `app/api/orders/route.ts` `GET` handler that returns all orders for the current session user
2. Replace the mock `const orders` array with a `useQuery` call to that endpoint

---

### Missing 2 — `app/cart/page.tsx` still uses hardcoded mock data
**File:** `app/cart/page.tsx`

The cart page still uses the old `initialCartItems` mock array with `useState`. It is completely disconnected from the Zustand store (`lib/store/cart.ts`) that every other page now uses correctly. Adding a book to cart on the books page has no effect on what the cart page shows.

**What needs doing:** Replace `useState<CartItem[]>(initialCartItems)` with `useCart()` from the Zustand store.

```ts
// ❌ Current
const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
const removeItem = (id: string) => { setCartItems(...) }

// ✅ Fix
const { items: cartItems, removeItem } = useCart()
```

---

### Missing 3 — Admin "Add Book" button is not wired to anything
**File:** `app/admin/books/page.tsx`, line ~81

The `<Button>Add Book</Button>` renders with no `onClick` handler. There is no dialog, form, or mutation connected to it. Admins cannot create books from the UI even though `POST /api/books` and `POST /api/upload` both work server-side.

**What needs doing:** Add a dialog with a form (title, author, description, price, genres, cover URL, file upload) that calls `POST /api/upload` then `POST /api/books`.

---

### Missing 4 — No `app/checkout/success/page.tsx`
**File:** `app/api/orders/route.ts`, line ~42

The orders route passes this redirect URL to IntaSend:
```
/checkout/success?orderId=${order.id}
```
After payment completes, IntaSend sends the user to this URL — but the page doesn't exist. Users land on a 404 after successfully paying.

**What needs doing:** Create `app/checkout/success/page.tsx` that reads the `orderId` query param, fetches the order status, shows a confirmation message, calls `clearCart()`, and links to My Library.

---

### Missing 5 — Free books go through IntaSend payment flow
**File:** `app/api/orders/route.ts`

When a cart contains only free books (`isFree: true`, `price: 0`), the route still calls `intasend.collection().charge()` with `amount: 0`. This is likely to either fail or produce an unnecessary IntaSend transaction. Free books should bypass payment entirely and have `Download` records created immediately.

**What needs doing:** Add a branch in the orders route:

```ts
const total = books.reduce((sum, b) => sum + Number(b.price), 0)

if (total === 0) {
  // All books are free — skip IntaSend, grant access directly
  const order = await prisma.order.create({
    data: {
      userId: session.user.id!,
      totalAmount: 0,
      status: 'PAID',
      items: { create: books.map(b => ({ bookId: b.id, price: 0 })) }
    }
  })
  await prisma.download.createMany({
    data: books.map(b => ({ userId: session.user.id!, bookId: b.id })),
    skipDuplicates: true,
  })
  return NextResponse.json({ orderId: order.id, free: true })
}

// ... existing IntaSend flow for paid books
```

---

## 🔵 Minor Issues & Polish

---

### Minor 1 — `featured-books.tsx` still uses mock data
**File:** `components/books/featured-books.tsx`

The homepage "Featured Books" section and the "You might also like" section on book detail pages still render from a hardcoded array. They also use `console.log` for the cart add handler instead of the Zustand store. This means the homepage never shows real books from the database.

**Fix:** Replace the mock array with a `useQuery` call to `GET /api/books?limit=8`, and wire `onAddToCart` to `useCart().addItem`.

---

### Minor 2 — `admin/books/page.tsx` uses `<Link>` without importing it
**File:** `app/admin/books/page.tsx`

The View dropdown item wraps `<DropdownMenuItem>` in a `<Link>` component, but `Link` from `next/link` is not in the import list at the top of the file. This is a compile error.

```tsx
// ❌ Missing import
import Link from "next/link"
```

---

### Minor 3 — Register page UI says minimum 8 characters, Zod validates minimum 6
**File:** `app/register/page.tsx` (UI hint) vs `lib/validations/index.ts`

The UI displays "Must be at least 8 characters" but Zod allows passwords from 6 characters. A user entering a 6- or 7-character password will pass validation but see the hint implying their password is too short.

**Fix:** Make both consistent — either change Zod to `min(8)` or change the UI hint to "at least 6 characters".

---

### Minor 4 — Webhook has no signature verification (security risk)
**File:** `app/api/webhooks/intasend/route.ts`

The webhook endpoint accepts any POST request and processes it as a valid payment. There is no verification that the request actually came from IntaSend. Anyone who discovers the URL can hit it with a fake payload to mark any order as PAID and unlock downloads without paying.

**Fix:** Verify the IntaSend webhook signature using `INTASEND_WEBHOOK_SECRET` before processing the payload. Refer to IntaSend's webhook verification documentation.

---

### Minor 5 — No `.env.example` file committed
**Status:** File not present in the repo

Any developer cloning this project has no reference for what environment variables are needed. The app will fail silently in various places (R2 uploads return `undefined` URLs, IntaSend throws, database won't connect).

**Fix:** Create `.env.example` at the project root with all required keys and empty values:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
INTASEND_PUBLISHABLE_KEY=
INTASEND_SECRET_KEY=
INTASEND_WEBHOOK_SECRET=
```

---

### Minor 6 — `next.config.mjs` has `ignoreBuildErrors: true`
**File:** `next.config.mjs`

TypeScript build errors are silently ignored. This means bugs that would normally be caught at build time (wrong field names, missing types) will only surface at runtime in production. Fine for rapid development, but should be turned off before deploying.

```js
// ❌ Current — hides real errors
typescript: {
  ignoreBuildErrors: true,
},

// ✅ For production build, remove this block entirely
```

---

## Fix Priority Order

| # | File | Severity | Description |
|---|---|---|---|
| 1 | `prisma/schema.prisma` | 🔴 Blocker | Add `url = env("DATABASE_URL")` |
| 2 | `app/layout.tsx` | 🔴 Blocker | Add `<SessionProvider>` |
| 3 | `app/api/admin/stats/route.ts` | 🔴 Crash | `amount` → `totalAmount` (×2) |
| 4 | `app/api/admin/orders/route.ts` | 🔴 Crash | `amount` → `totalAmount` |
| 5 | `prisma/seed.ts` | 🔴 Crash | `password` → `passwordHash`, fix upsert key, remove unknown fields |
| 6 | `app/api/books/route.ts` | 🔴 Crash | Map `bookSchema` fields to correct Prisma model shape |
| 7 | `lib/validations/index.ts` | 🔴 Crash | Fix `bookSchema` to replace `fileUrl`/`fileFormat`/`pages` with `fileKey`/`pageCount` |
| 8 | `app/admin/page.tsx` | 🔴 Build error | Add `"use client"` directive |
| 9 | `app/admin/books/page.tsx` | 🔴 Build error | Add `import Link from "next/link"` |
| 10 | `app/my-library/page.tsx` | 🟠 Broken feature | Fix download handler → `GET /api/downloads/${id}`, check `data.url` |
| 11 | `app/my-library/page.tsx` | 🟠 Broken feature | Fix query → new `GET /api/my-library` route |
| 12 | `app/cart/page.tsx` | 🟠 Broken feature | Replace mock array with `useCart()` Zustand store |
| 13 | `app/api/upload/route.ts` | 🟠 Broken feature | `R2_CUSTOM_DOMAIN` → `R2_PUBLIC_URL` |
| 14 | `app/orders/page.tsx` | 🟠 Broken feature | Replace mock data + add `GET /api/orders` user route |
| 15 | `app/checkout/success/page.tsx` | 🟠 Missing page | Create post-payment confirmation page |
| 16 | `app/api/orders/route.ts` | 🟡 Logic error | Add free books bypass (skip IntaSend when total = 0) |
| 17 | `components/books/featured-books.tsx` | 🟡 Mock data | Replace hardcoded array with real API call |
| 18 | `app/api/webhooks/intasend/route.ts` | 🟡 Security | Add signature verification |
| 19 | `.env.example` | 🟡 DX | Create with all required keys |
| 20 | `app/register/page.tsx` | 🟢 Minor | Align password hint with Zod min (6 vs 8) |
| 21 | `next.config.mjs` | 🟢 Minor | Remove `ignoreBuildErrors` before going to production |
| 22 | `app/admin/books/page.tsx` | 🟠 Missing | Wire "Add Book" button to dialog + form |

---

*Audited against `reqs/prd.md` — Digital Library Management System.*