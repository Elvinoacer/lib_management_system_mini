"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, BellRing, Lock, Trash2, AlertTriangle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCart } from "@/lib/store/cart"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const res = await fetch('/api/user/settings')
      if (!res.ok) throw new Error("Failed to fetch settings")
      return res.json()
    },
    enabled: status === 'authenticated'
  })

  const clearCart = useCart((state) => state.clearCart)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete account")
      }
      clearCart()
      toast.success("Account deleted successfully")
      await signOut({ callbackUrl: '/account-deleted' })
    } catch (error: any) {
      toast.error(error.message)
      setIsDeleting(false)
    }
  }

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })
      if (!res.ok) throw new Error("Failed to update settings")
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userSettings'], data)
      toast.success("Preferences updated")
    },
    onError: () => {
      toast.error("Failed to update preferences")
    }
  })

  if (status === "loading") return <div className="p-8 text-center flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    
    const form = e.target as HTMLFormElement
    const currentPassword = (form.elements.namedItem('current-password') as HTMLInputElement).value
    const newPassword = (form.elements.namedItem('new-password') as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      setIsChangingPassword(false)
      return
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password")
      }
      
      toast.success("Password successfully updated")
      form.reset()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account settings, security, and preferences.
            </p>

            <div className="mt-8 space-y-6">
              
              {/* Security Section */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-border bg-muted/20 flex gap-4 items-center">
                  <Lock className="h-6 w-6 text-foreground" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Security</h2>
                    <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                    <Button type="submit" disabled={isChangingPassword} className="mt-2">
                      {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change Password
                    </Button>
                  </form>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-border bg-muted/20 flex gap-4 items-center">
                  <BellRing className="h-6 w-6 text-foreground" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                    <p className="text-sm text-muted-foreground">Manage your email preferences and alerts.</p>
                  </div>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Order Updates</p>
                      <p className="text-sm text-muted-foreground">Receive emails about your purchases and downloads.</p>
                    </div>
                    <Switch 
                      checked={settings?.orderUpdates ?? true} 
                      onCheckedChange={(checked) => updateSettings.mutate({ orderUpdates: checked })}
                      disabled={updateSettings.isPending || !settings}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Promotional Emails</p>
                      <p className="text-sm text-muted-foreground">Receive updates about new book releases and discounts.</p>
                    </div>
                    <Switch 
                      checked={settings?.promotionalEmails ?? false} 
                      onCheckedChange={(checked) => updateSettings.mutate({ promotionalEmails: checked })}
                      disabled={updateSettings.isPending || !settings}
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-card border border-destructive/20 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-destructive/10 bg-destructive/5 flex gap-4 items-center">
                  <Trash2 className="h-6 w-6 text-destructive" />
                  <div>
                    <h2 className="text-lg font-bold text-destructive">Danger Zone</h2>
                    <p className="text-sm text-destructive/80">Irreversible account actions.</p>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain. All your purchased books will be inaccessible.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently anonymize your account, 
                          remove your data from our servers, and you will lose access to all purchased books.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="my-4 space-y-2">
                        <Label htmlFor="delete-confirm" className="text-sm">
                          Please type <span className="font-bold select-none">DELETE</span> to confirm.
                        </Label>
                        <Input 
                          id="delete-confirm" 
                          value={deleteConfirmation} 
                          onChange={(e) => setDeleteConfirmation(e.target.value)} 
                          placeholder="DELETE" 
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
                        <Button 
                          variant="destructive" 
                          disabled={deleteConfirmation !== "DELETE" || isDeleting}
                          onClick={handleDeleteAccount}
                        >
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Permanently Delete Account
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
