# Kitabu — UX Flows Audit & Redesign
> Complete analysis of all user flows, broken flows, and proposed improvements

---

## Part 1 — Critical Broken Things First

### 🔴 BUG: `proxy.ts` is named wrong — middleware never runs

The route protection logic lives in `proxy.ts`, NOT `middleware.ts`. Next.js only auto-loads a file named exactly `middleware.ts` at the project root. This means **all server-side route guards are completely inactive**. Any user can access `/admin`, `/profile`, `/settings`, `/orders`, `/checkout` without being logged in — the redirects only fire on the client side, causing a flash of protected content.

**Fix:** Rename `proxy.ts` → `middleware.ts`.

---

### 🔴 BUG: Email verification doesn't exist — and never did

You asked why you don't receive verification emails. The answer is that **email verification is not implemented anywhere in the system**:

- The `User` model has **no `emailVerified` field**
- The register API creates users and marks them active immediately
- The register page auto-logs in after signup with zero email confirmation step
- No verification token, no verification API route, no "check your email" gate exists

The confusion may come from the forgot-password flow using nodemailer — but that's a different feature. For that to work, you also need `EMAIL_SERVER_HOST`, `EMAIL_SERVER_USER`, and `EMAIL_SERVER_PASSWORD` set in your `.env`. If those aren't configured, forgot-password emails also silently fail (nodemailer throws, the API returns 500).

**To implement email verification you need:**
1. Add `emailVerified: DateTime?` and `verificationToken: String? @unique` to the User schema + migration
2. On register: generate a token, store it on the user, send a verification email (don't auto-login yet)
3. Create `GET /api/auth/verify-email?token=...` — validate token, set `emailVerified`, clear token, auto-login
4. Create `app/verify-email/page.tsx` — landing page that reads the token from URL and calls the API
5. Gate checkout (and optionally the full library) behind `emailVerified !== null`
6. Add a "Resend verification email" option to the dashboard for users who missed it

---

### 🟠 UX BUG: Login page has no "Forgot Password" link

The `/forgot-password` page exists and works, but there is no link to it anywhere on the login form. Users who forget their password have no way to discover this feature.

**Fix:** Add below the password field:
```tsx
<div className="flex items-center justify-between">
  <Label htmlFor="password">Password</Label>
  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
    Forgot password?
  </Link>
</div>
```

---

## Part 2 — All Current Flows vs. Proposed Flows

---

### Flow 1 — Registration

**Current flow:**
```
/register → fill form → POST /api/auth/register → signIn() auto-login → /books
```

**Problems:**
- No email verification — anyone can register with a fake email
- No `callbackUrl` carried through — if user came from `/checkout`, they land on `/books` after registering
- Register page doesn't read or pass a `callbackUrl` query param
- No password strength indicator
- The "Must be at least 8 characters" hint appears after the field, not as live feedback

**Proposed flow:**
```
/register?callbackUrl=/checkout
  → fill form (with live password strength meter)
  → POST /api/auth/register
  → send verification email
  → redirect to /verify-email/sent?email=xxx
     (show "Check your email" screen with resend button)
  → user clicks link in email → GET /api/auth/verify-email?token=xxx
  → auto-login → redirect to callbackUrl (/checkout) or /books
```

**Changes needed:**
- Register page reads `?callbackUrl` and passes it through
- After registration, redirect to a holding screen instead of auto-logging in
- Add live password strength feedback (at minimum: change hint text color to green/red)

---

### Flow 2 — Login

**Current flow:**
```
/login?callbackUrl=X → sign in → router.push(callbackUrl || "/")
```

**Problems:**
- Default callbackUrl is `"/"` (homepage) — logged-in users have no reason to be on the homepage
- No "Forgot password?" link anywhere on the form
- Admin users land on `"/"` same as regular users — they have to manually navigate to `/admin`
- If user came from `/register` link via login page, the `callbackUrl` chain is broken
- After successful sign-in, `router.push(callbackUrl)` then `router.refresh()` — the refresh is redundant since NextAuth updates the session automatically

**Proposed flow:**
```
/login?callbackUrl=X
  → sign in
  → if role === ADMIN → /admin
  → if callbackUrl exists → callbackUrl  
  → else → /books  (not "/")
```

**Changes needed:**
```tsx
// In handleSubmit, after successful signIn:
const callbackUrl = searchParams.get("callbackUrl")
const destination = callbackUrl 
  ? callbackUrl 
  : result.user?.role === "ADMIN" ? "/admin" : "/books"
router.push(destination)
```
- Add "Forgot password?" link below the password label
- Remove `router.refresh()` after push (unnecessary with NextAuth v5)

---

### Flow 3 — Forgot Password

**Current flow:**
```
/forgot-password → enter email → POST /api/auth/forgot-password
  → nodemailer sends email (IF env vars configured)
  → user clicks link in email → /reset-password?token=xxx
  → enter new password → POST /api/auth/reset-password
  → success toast → /login
```

**Problems:**
- Flow itself is good but **nodemailer won't work unless `EMAIL_SERVER_HOST`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD` are set**. If they're not, the API throws and returns 500 — the user sees an error with no hint about what's wrong.
- After resetting password, user is sent to `/login` but the email field is empty — they have to retype their email
- No link to `/forgot-password` from the login page (as noted above)
- The reset link (`/reset-password?token=xxx`) has no expiry warning displayed on the page — the token is 1 hour, users don't know this

**Proposed flow:**
```
/login → click "Forgot password?" → /forgot-password
  → enter email → POST /api/auth/forgot-password
  → /forgot-password (show success state: "Check your inbox — link expires in 1 hour")
  → user clicks link → /reset-password?token=xxx
     (show: "Set a new password — this link expires 1 hour from when it was sent")
  → enter new password + confirm → POST /api/auth/reset-password
  → auto-login with new credentials → /books (or /my-library)
  (no manual login step needed — they just proved they own the email)
```

**Changes needed:**
- After successful reset, auto-login instead of redirecting to `/login`
- Display the 1-hour expiry notice on the reset password page
- Pre-fill the email on `/login` after reset (pass `?email=xxx` as query param)
- Add env var validation in the API and return a cleaner error if SMTP is not configured

---

### Flow 4 — Browse → Add to Cart → Checkout (Unauthenticated User)

**Current flow:**
```
browse /books → add to cart → /cart
  → if unauthenticated: show "Sign In to Checkout" button → /login?callbackUrl=/checkout
  → login → /checkout → pay
```

**Problems:**
- Cart IS shown to unauthenticated users (good — items persist via Zustand localStorage)
- "Sign In to Checkout" button links to `/login?callbackUrl=/checkout` ✅ this is correct
- BUT: if the user clicks "Register" instead of "Sign In" from the login page, the `callbackUrl=/checkout` is lost — after registration they land on `/books`
- The login page's "Don't have an account? Sign up" link is just `/register` with no callbackUrl forwarding

**Proposed flow:**
```
/login?callbackUrl=/checkout
  → user clicks "Sign up instead"
  → /register?callbackUrl=/checkout  (preserve callbackUrl)
  → register + verify → /checkout    (honor the original destination)
```

**Changes needed:**
```tsx
// In login page, change the sign-up link to preserve callbackUrl:
const callbackUrl = searchParams.get("callbackUrl") || ""
<Link href={`/register${callbackUrl ? `?callbackUrl=${callbackUrl}` : ""}`}>
  Sign up for free
</Link>

// Mirror in register page, change the "Sign in" link:
<Link href={`/login${callbackUrl ? `?callbackUrl=${callbackUrl}` : ""}`}>
  Sign in
</Link>
```

---

### Flow 5 — Book Purchase (Owned Book)

**Current flow:**
```
/books/[id]
  → if user owns book: show "Go to Library" button ✅ (fixed in v3)
  → if not in cart: show "Add to Cart"
  → if in cart: show "Go to Cart"
```

This flow is now correct. The `isOwned` field is computed in `GET /api/books/[id]` and the page renders the right button state.

**Remaining issue:** The "Go to Library" button links to `/my-library` which shows ALL owned books. It would be better UX to link to the download directly, or at least to `/my-library` with the book highlighted/focused.

---

### Flow 6 — Checkout (M-Pesa)

**Current flow:**
```
/checkout
  → enter phone → POST /api/orders
  → order created with real ID → IntaSend STK push sent
  → poll /api/orders/[id] every 3 seconds
  → countdown timer (5 minutes) shown
  → if PAID → /checkout/success?orderId=xxx
  → if timeout → "Try Again" button shown
```

**This flow is now correct** (B-1 was fixed — real order ID used as api_ref). The polling has a timeout, cancel button, and resend push button.

**Remaining improvements:**
- After timeout, the order is in PENDING state in the DB — if the user completes payment later (via M-Pesa menu directly), the webhook will still fire and complete the order. The "Your order was saved" message on timeout is correct. Consider adding: "Check your orders page — payment may still arrive."
- The "Resend M-Pesa Push" button calls `handleCheckout` which creates a **new** order — the old PENDING order is orphaned. It should instead re-trigger payment on the existing order ID.

---

### Flow 7 — Sign Out

**Current flow:**
```
Dashboard sidebar → Sign Out button → signOut({ callbackUrl: "/login" })
Admin sidebar → Sign Out button → signOut({ callbackUrl: "/login" })
Settings page delete account → signOut({ callbackUrl: "/" })
```

**Problem:** Signing out lands on `/login` which is the right choice, but the login page doesn't show a "You've been signed out" confirmation message. Users might wonder if the sign-out worked.

**Proposed improvement:**
```
signOut({ callbackUrl: "/login?signedOut=true" })
// In login page:
const signedOut = searchParams.get("signedOut")
{signedOut && <div className="...">You've been signed out successfully.</div>}
```

---

### Flow 8 — Admin Access

**Current flow:**
```
Admin navigates to /admin
  → proxy.ts (currently broken/not running) should protect
  → client-side: AdminSidebar renders and shows session role
```

**Problems:**
- Middleware not running (proxy.ts vs middleware.ts)
- Non-admin users who visit `/admin` see a flash of the admin UI before client redirect fires
- After login, admins land on `/books` (callbackUrl default) not `/admin`
- No visual indicator in the main header that an admin is logged in

**Proposed flow:**
```
Admin logs in → /admin (direct, based on role check in login handler)
Non-admin tries /admin → middleware redirects to /login (once middleware.ts is fixed)
Admin sidebar shows real session name/email ✅ (already fixed)
```

---

### Flow 9 — Account Deletion

**Current flow:**
```
/settings → Danger Zone → "Delete Account" button
  → window.confirm() dialog
  → DELETE /api/user/account (anonymizes user)
  → signOut({ callbackUrl: "/" })
```

**Problems:**
- `window.confirm()` is a browser native dialog — unstyled, inconsistent across browsers, can't be customized
- After deletion, user is sent to `"/"` (homepage) which still shows the "Sign In / Register" state — no farewell or confirmation message
- The deletion anonymizes the user record (`Deleted User`, `deleted_xxx@example.com`) but doesn't clear the Zustand cart — the user's last cart items persist in localStorage

**Proposed flow:**
```
/settings → Danger Zone → "Delete Account" button
  → styled AlertDialog (shadcn/ui component, already installed)
     "Are you absolutely sure? Type DELETE to confirm."
  → DELETE /api/user/account
  → clear cart (call clearCart() before signOut)
  → signOut({ callbackUrl: "/account-deleted" })
  → /account-deleted page: "Your account has been deleted. Thank you for using Kitabu."
     with a "Browse Books" link
```

---

### Flow 10 — Download a Book

**Current flow:**
```
/my-library → click Download button
  → GET /api/downloads/[bookId] (verifies ownership, generates Cloudinary signed URL)
  → window.open(url, '_blank') — opens download in new tab
```

**This flow is correct** and well-secured (ownership verified server-side, 15-minute expiring URL).

**Minor UX issue:** The download button has no loading state — clicking it shows a toast "Preparing your download..." but the button itself doesn't visually change. This can make users double-click.

**Improvement:** Set a per-book loading state and disable the button while the URL is being fetched.

---

## Part 3 — Missing Redirects Summary

| Scenario | Current destination | Better destination |
|---|---|---|
| Login success (regular user) | `callbackUrl \|\| "/"` | `callbackUrl \|\| "/books"` |
| Login success (admin) | `callbackUrl \|\| "/"` | `callbackUrl \|\| "/admin"` |
| Register success | `/books` | `callbackUrl \|\| "/books"` |
| Login → click "Sign Up" | `/register` (no callbackUrl) | `/register?callbackUrl=xxx` |
| Register → click "Sign In" | `/login` (no callbackUrl) | `/login?callbackUrl=xxx` |
| Password reset success | `/login` (blank form) | `/login?email=xxx` (pre-filled) |
| Sign out | `/login` (no message) | `/login?signedOut=true` (with banner) |
| Account deleted | `"/"` (homepage, no message) | `/account-deleted` (confirmation page) |

---

## Part 4 — Implementation Checklist

### Immediate (breaks/silent failures)
- [ ] Rename `proxy.ts` → `middleware.ts`
- [ ] Add `EMAIL_SERVER_HOST`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD` to `.env`
- [ ] Add "Forgot password?" link to login page password field

### High Priority (UX flows)
- [ ] Login: change default redirect from `"/"` to `"/books"` (or `"/admin"` for admins)
- [ ] Login/Register: pass `callbackUrl` through the "Sign up / Sign in" cross-links
- [ ] Register: read and honor `callbackUrl` after successful registration
- [ ] Password reset: auto-login after reset instead of redirecting to login
- [ ] Sign out: add `?signedOut=true` and display banner on login page

### Medium Priority (feature completion)
- [ ] Email verification: add `emailVerified` + `verificationToken` to User schema
- [ ] Email verification: build the full token flow (send → landing page → verify API)
- [ ] Account deletion: replace `window.confirm()` with shadcn `AlertDialog`
- [ ] Account deletion: clear cart before signOut, add `/account-deleted` page
- [ ] Checkout timeout: fix "Resend Push" to re-trigger on existing order, not create new one
- [ ] Download button: add per-book loading state