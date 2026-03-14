import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Anonymize the user account to prevent login but retain order histories for accounting
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: "Deleted User",
        email: `deleted_${session.user.id}@example.com`,
        passwordHash: "DELETED",
        isSuspended: true
      }
    })

    return NextResponse.json({ success: true, message: "Account deleted/anonymized" })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
