import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { orderUpdates: true, promotionalEmails: true }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { orderUpdates, promotionalEmails } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        orderUpdates: typeof orderUpdates === 'boolean' ? orderUpdates : undefined,
        promotionalEmails: typeof promotionalEmails === 'boolean' ? promotionalEmails : undefined
      },
      select: { orderUpdates: true, promotionalEmails: true }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
