"use client"

import { ArrowRight, BookOpen, Download, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Digital Library,{" "}
            <span className="text-primary">Anywhere</span>
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
            Discover thousands of digital books. Purchase securely with M-Pesa and download instantly to any device.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/books">
              <Button size="lg" className="gap-2">
                Browse Library
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/free-books">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Free Books
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Vast Collection</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Thousands of books across all genres and categories
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Secure Payments</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pay securely with M-Pesa, cards, and more
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Instant Downloads</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your books instantly after purchase
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
