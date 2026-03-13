"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Smartphone, Shield, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

type PaymentMethod = "mpesa" | "card"

interface CartItem {
  id: string
  title: string
  author: string
  coverUrl: string
  price: number
}

// Mock cart data
const cartItems: CartItem[] = [
  {
    id: "1",
    title: "The Art of Business Strategy",
    author: "James Kimani",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    price: 1500,
  },
  {
    id: "2",
    title: "Modern Web Development",
    author: "Sarah Ochieng",
    coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
    price: 2000,
  },
]

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const total = subtotal

  const handleCheckout = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    // In production, this would redirect to IntaSend checkout
    alert("Payment initiated! In production, this would redirect to IntaSend.")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-foreground">Checkout</h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Payment Form */}
            <div className="flex flex-col gap-6">
              {/* Payment Method Selection */}
              <div>
                <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how you'd like to pay
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* M-Pesa Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mpesa")}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                      paymentMethod === "mpesa"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00C851]/10">
                      <Smartphone className="h-5 w-5 text-[#00C851]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">M-Pesa</p>
                      <p className="text-sm text-muted-foreground">Pay with STK Push</p>
                    </div>
                  </button>

                  {/* Card Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Card</p>
                      <p className="text-sm text-muted-foreground">Visa / Mastercard</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="rounded-lg border border-border bg-card p-6">
                {paymentMethod === "mpesa" ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label htmlFor="phone">M-Pesa Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., 0712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-2"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        You will receive an STK Push prompt on this number
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        type="text"
                        placeholder="John Doe"
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="mt-6 w-full gap-2"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay KES {total.toLocaleString()}
                    </>
                  )}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Secured by IntaSend
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

                <div className="mt-6 flex flex-col gap-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <Image
                          src={item.coverUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.author}</p>
                        <p className="mt-auto text-sm font-medium text-foreground">
                          KES {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span>KES {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 rounded-lg border border-border bg-card p-4">
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Secure payment processing
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4 text-primary" />
                    Your data is encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
