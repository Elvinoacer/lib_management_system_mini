"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Book, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new link.")
      return
    }

    setIsLoading(true)
    
    const form = e.target as HTMLFormElement
    const newPassword = (form.elements.namedItem('new-password') as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      toast.success("Password successfully reset! Please login.")
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm lg:w-96">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Book className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">Kitabu</span>
      </Link>

      <h2 className="mt-8 text-2xl font-bold text-foreground">
        Create new password
      </h2>
      <p className="mt-2 text-muted-foreground">
        Please enter and confirm your new password below.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="new-password"
            type="password"
            required
            minLength={6}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            minLength={6}
          />
        </div>

        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md px-8 text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Book className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Secure Account Access
            </h3>
            <p className="mt-4 text-muted-foreground">
              Get back into your account securely to access your entire library of digital books and downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
