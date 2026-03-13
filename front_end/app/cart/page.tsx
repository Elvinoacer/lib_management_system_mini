"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"

interface CartItem {
  id: string
  title: string
  author: string
  coverUrl: string
  price: number
  quantity: number
}

// Mock cart data
const initialCartItems: CartItem[] = [
  {
    id: "1",
    title: "The Art of Business Strategy",
    author: "James Kimani",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    price: 1500,
    quantity: 1,
  },
  {
    id: "2",
    title: "Modern Web Development",
    author: "Sarah Ochieng",
    coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
    price: 2000,
    quantity: 1,
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = 0
  const total = subtotal - discount

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="mt-2 text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>

          {cartItems.length > 0 ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="flex flex-col gap-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-lg border border-border bg-card p-4"
                    >
                      {/* Cover */}
                      <Link
                        href={`/books/${item.id}`}
                        className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md bg-secondary"
                      >
                        <Image
                          src={item.coverUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/books/${item.id}`}
                              className="font-semibold text-foreground hover:text-primary"
                            >
                              {item.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">{item.author}</p>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            KES {item.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-4">
                          <p className="text-sm text-muted-foreground">Digital download</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>KES {subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount</span>
                        <span>-KES {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-lg font-semibold text-foreground">
                        <span>Total</span>
                        <span>KES {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout" className="mt-6 block">
                    <Button size="lg" className="w-full gap-2">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Secure checkout powered by IntaSend
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">
                Your cart is empty
              </h2>
              <p className="mt-2 text-muted-foreground">
                Looks like you haven't added any books yet.
              </p>
              <Link href="/books" className="mt-6">
                <Button className="gap-2">
                  Browse Books
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
