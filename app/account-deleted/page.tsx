"use client"

import Link from "next/link"
import { Book, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccountDeletedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Account Deleted
        </h1>
        
        <p className="mt-4 text-muted-foreground">
          Your account has been successfully removed from our systems. We're sorry to see you go. 
          If you ever want to return, you're always welcome to create a new account.
        </p>
        
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
          <Link href="/books">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Browse Books
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Logo */}
      <div className="absolute top-8 left-8 hidden sm:flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Book className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">Kitabu</span>
      </div>
    </div>
  )
}
