import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { intasend } from "@/lib/intasend"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phoneNumber } = await req.json()
    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id, userId: session.user.id! }
    })
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Order is already paid or cancelled" }, { status: 400 })
    }

    const checkoutArgs = {
      first_name: session.user.name?.split(' ')[0] || 'User',
      last_name: session.user.name?.split(' ')[1] || 'Name',
      email: session.user.email,
      amount: Number(order.totalAmount),
      currency: 'KES',
      api_ref: order.id,
      redirect_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
      phone_number: phoneNumber,
      method: "M-PESA"
    };

    const checkout = await intasend.collection().charge(checkoutArgs);

    await prisma.order.update({
      where: { id: order.id },
      data: { intasendRef: checkout.id } // Update the reference for polling
    })

    return NextResponse.json({ success: true, intasendRef: checkout.id })

  } catch (error) {
    console.error("Resend Error:", error)
    return NextResponse.json({ error: "Failed to resend STK push" }, { status: 500 })
  }
}
