import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")

    const users = await prisma.user.findMany({
      where: {
        ...(query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          where: { status: "PAID" },
          select: { totalAmount: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinedDate: user.createdAt.toLocaleDateString(),
      purchases: user._count.orders,
      status: user.isSuspended ? "Suspended" : "Active",
      totalSpent: user.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0)
    }))

    return NextResponse.json(formattedUsers)
  } catch (error: any) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, role, isSuspended } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const data: any = {}
    
    if (role) {
      const validRoles = ['ADMIN', 'MEMBER'] as const
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      data.role = role
    }

    if (isSuspended !== undefined) {
      data.isSuspended = isSuspended
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
