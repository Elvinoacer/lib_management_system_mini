import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let settings = await prisma.globalSettings.findUnique({
      where: { id: "default" }
    })

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: { id: "default" }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    
    // Define allowed setting updates
    const updates = {
      platformName: data.platformName,
      supportEmail: data.supportEmail,
      allowRegistrations: data.allowRegistrations,
      intasendTestMode: data.intasendTestMode,
      intasendPubKey: data.intasendPubKey
    }

    const settings = await prisma.globalSettings.update({
      where: { id: "default" },
      data: updates
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
