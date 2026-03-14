"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Smartphone, Shield, Lock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/store/cart"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type PaymentMethod = "mpesa" | "card"


export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pollingOrder, setPollingOrder] = useState<string | null>(null)
  const [pollTimeLeft, setPollTimeLeft] = useState<number | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  
  const items = useCart((state) => state.items)
  const clearCart = useCart((state) => state.clearCart)
  const cartItems = items
  const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0)
  const total = subtotal

  const handleCheckout = async () => {
    if (!session) {
      toast.error("Please sign in to complete your purchase")
      router.push("/login?callbackUrl=/checkout")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    if (paymentMethod === "mpesa" && !phoneNumber) {
      toast.error("Please enter your M-Pesa phone number")
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookIds: items.map(item => item.id),
          phoneNumber: paymentMethod === "mpesa" ? phoneNumber : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment")
      }

      // Stay on page and poll for M-Pesa, redirect to IntaSend for others (or free)
      if (data.url && paymentMethod !== "mpesa") {
        clearCart()
        window.location.href = data.url
      } else if (data.orderId) {
        setPollingOrder(data.orderId)
        setPollTimeLeft(300)
      } else {
        throw new Error("Invalid response from payment gateway")
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred")
      setIsProcessing(false)
    }
  }

  // Polling logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let countdownIntervalId: NodeJS.Timeout

    const pollOrderStatus = async () => {
      if (!pollingOrder) return
      
      try {
        const res = await fetch(`/api/orders/${pollingOrder}`)
        if (res.ok) {
          const order = await res.json()
          if (order.status === "PAID") {
            toast.success("Payment received!")
            router.push(`/checkout/success?orderId=${pollingOrder}`)
            return // Stop polling
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
      
      // Poll again after 3 seconds
      timeoutId = setTimeout(pollOrderStatus, 3000)
    }

    if (pollingOrder) {
      pollOrderStatus()
      
      countdownIntervalId = setInterval(() => {
        setPollTimeLeft(prev => {
          if (prev !== null && prev > 1) {
            return prev - 1
          } else if (prev === 1) {
            toast.error("Payment timeout reached. Please try again.")
            clearInterval(countdownIntervalId)
            clearTimeout(timeoutId)
            return 0
          }
          return prev
        })
      }, 1000)
    }
    
    return () => {
      clearTimeout(timeoutId)
      clearInterval(countdownIntervalId)
    }
  }, [pollingOrder, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
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
                    disabled
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors opacity-50 cursor-not-allowed",
                      "border-border"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">Card</p>
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Coming Soon</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Visa / Mastercard</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="rounded-lg border border-border bg-card p-6">
                {paymentMethod === "mpesa" && (
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
                )}

                <Button
                  size="lg"
                  className="mt-6 w-full gap-2"
                  onClick={handleCheckout}
                  disabled={isProcessing || (pollingOrder !== null && pollTimeLeft !== 0)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {pollingOrder && pollTimeLeft !== null && pollTimeLeft > 0 ? "Polling..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay KES {total.toLocaleString()}
                    </>
                  )}
                </Button>

                {pollingOrder && pollTimeLeft !== null && pollTimeLeft > 0 && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-amber-600">
                      Waiting for payment... ({formatTime(pollTimeLeft)} remaining)
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setPollingOrder(null)
                        setPollTimeLeft(null)
                        setIsProcessing(false)
                      }}
                    >
                      Cancel & Go Back
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={handleCheckout}
                    >
                      Resend M-Pesa Push
                    </Button>
                  </div>
                )}

                {pollingOrder && pollTimeLeft === 0 && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-destructive text-center">
                      Payment timeout reached. Your order was saved, but payment was not received.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setPollingOrder(null)
                        setPollTimeLeft(null)
                        setIsProcessing(false)
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}

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
                          src={item.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop"}
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
