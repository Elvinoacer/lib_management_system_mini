"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, LayoutDashboard, BookOpen, Receipt, Users, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Books", href: "/admin/books", icon: BookOpen },
  { label: "Orders", href: "/admin/orders", icon: Receipt },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Book className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-semibold text-foreground">Kitabu</span>
              <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name || "Admin"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-primary">
                  {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AD"}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{session?.user?.name || "Loading..."}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ""}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-3 w-full justify-start gap-2 text-muted-foreground" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  )
}
