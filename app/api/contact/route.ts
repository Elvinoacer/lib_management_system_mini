import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, topic, message } = await req.json()

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real application, you would integrate SendGrid, Resend, or another email provider here
    // Or save it to a ContactMessage table in the database
    console.log(`[CONTACT FORM SUBMISSION] From: ${firstName} ${lastName} (${email}) | Topic: ${topic}`)
    console.log(`Message: ${message}`)

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
