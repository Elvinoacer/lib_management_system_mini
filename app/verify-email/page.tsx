"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Book, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email address...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token provided.")
      return
    }

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
  }, [token])

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
          <Link href="/login" className="mt-8">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
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
