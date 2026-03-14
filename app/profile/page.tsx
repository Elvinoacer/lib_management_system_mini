"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Camera, User, Book } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

export default function ProfilePage() {
  const { data: session, update, status } = useSession()
  const router = useRouter()
  
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })

  // Queries for real stats
  const { data: profile } = useQuery({
    queryKey: ['profileInfo'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile')
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: status === 'authenticated'
  })

  const { data: userBooks } = useQuery({
    queryKey: ['my-library'],
    queryFn: async () => {
      const res = await fetch('/api/my-library')
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: status === 'authenticated'
  })

  // Basic redirection if not authed
  if (status === "loading") return <div className="p-8 text-center flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name })
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      await update({ name: formData.name }) // Update session data
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("An error occurred while saving your profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Profile</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your personal information and public profile.
            </p>

            <div className="mt-8 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 border-b border-border sm:border-b-0 sm:border-r pb-8 sm:pb-0 sm:pr-8">
                  <div className="relative h-28 w-28 rounded-full bg-secondary border-4 border-background shadow-lg flex items-center justify-center overflow-hidden ring-2 ring-border transition-all hover:ring-primary/50">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                    <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                      <span className="sr-only">Upload profile photo</span>
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-foreground">{session?.user?.name}</p>
                    <div className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                      {session?.user?.role?.toLowerCase() || 'Member'}
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="flex-1">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                      />
                      <p className="text-xs text-muted-foreground">This is your public display name.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-secondary"
                      />
                      <p className="text-xs text-muted-foreground">Your email address cannot be changed at this time.</p>
                    </div>

                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">Account Statistics</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-secondary/20 p-6 transition-all hover:border-primary/50 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-secondary/20 p-6 transition-all hover:border-primary/50 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Book className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Books Owned</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {userBooks ? userBooks.length : '...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
