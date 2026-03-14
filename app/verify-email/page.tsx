"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Book, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend">("loading")
  const [message, setMessage] = useState("Verifying your email address...")
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) {
      if (sessionStatus === "authenticated") {
         if ((session?.user as any)?.emailVerified) {
            router.push("/books")
         } else {
            setStatus("resend")
            setMessage("Please verify your email address to access your library and purchases. Check your inbox and spam folder.")
         }
      } else if (sessionStatus === "unauthenticated") {
        setStatus("error")
        setMessage("No verification token provided. Please log in.")
      }
      return
    }

    if (sessionStatus === "loading") return

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Verification failed")
        }

        setStatus("success")
        setMessage(data.message)
      } catch (err: any) {
        setStatus("error")
        setMessage(err.message)
      }
    }

    verifyEmail()
  }, [token, sessionStatus, router, session])

  const handleResend = async () => {
    setIsResending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" })
      if (!res.ok) throw new Error("Failed to resend")
      toast.success("Verification email resent. Please check your inbox and spam folder.")
    } catch (e) {
      toast.error("Failed to resend verification email. Please try again later.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mb-6 h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Verifying...</h2>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="mb-6 h-16 w-16 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
          <p className="mt-2 text-muted-foreground">{message}</p>
          <Link href="/login" className="mt-8 w-full">
            <Button className="w-full" size="lg">Continue to Login</Button>
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="mb-6 h-16 w-16 text-destructive" />
          <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
          <p className="mt-2 text-muted-foreground">{message}</p>
          <Link href="/login" className="mt-8 w-full block">
            <Button variant="outline" className="w-full">Back to Login</Button>
          </Link>
        </>
      )}
      {status === "resend" && (
        <>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Book className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Verification Required</h2>
          <p className="mt-2 text-muted-foreground">{message}</p>
          <Button 
            className="mt-8 w-full" 
            size="lg" 
            onClick={handleResend} 
            disabled={isResending}
          >
            {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Resend Verification Email
          </Button>
          <Button variant="outline" className="mt-4 w-full" onClick={() => signOut({ callbackUrl: "/login" })}>Sign Out</Button>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-8 left-8 hidden sm:flex items-center gap-2">
        <Link href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Book className="h-6 w-6 text-primary-foreground" />
          </div>
        </Link>
        <span className="text-2xl font-bold text-foreground">Kitabu</span>
      </div>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
