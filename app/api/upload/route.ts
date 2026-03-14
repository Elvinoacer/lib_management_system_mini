import { auth } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // Create signature for Cloudinary upload
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: 'books'
    }, process.env.CLOUDINARY_API_SECRET!);

    return NextResponse.json({ 
      signature, 
      timestamp, 
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'books'
    })
  } catch (error: any) {
    console.error("Upload signature error:", error)
    return NextResponse.json({ error: "Failed to generate upload signature" }, { status: 500 })
  }
}
