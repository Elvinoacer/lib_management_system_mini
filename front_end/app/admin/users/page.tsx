"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Ban, Shield, User } from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  role: "MEMBER" | "ADMIN"
  joinedDate: string
  orders: number
  totalSpent: number
  status: "active" | "suspended"
}

// Mock data
const users: UserData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "MEMBER",
    joinedDate: "Jan 15, 2024",
    orders: 5,
    totalSpent: 12500,
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "MEMBER",
    joinedDate: "Jan 20, 2024",
    orders: 3,
    totalSpent: 4800,
    status: "active",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@kitabu.com",
    role: "ADMIN",
    joinedDate: "Dec 1, 2023",
    orders: 0,
    totalSpent: 0,
    status: "active",
  },
  {
    id: "4",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "MEMBER",
    joinedDate: "Feb 5, 2024",
    orders: 8,
    totalSpent: 18200,
    status: "active",
  },
  {
    id: "5",
    name: "Sarah Brown",
    email: "sarah@example.com",
    role: "MEMBER",
    joinedDate: "Feb 10, 2024",
    orders: 2,
    totalSpent: 0,
    status: "suspended",
  },
  {
    id: "6",
    name: "David Wilson",
    email: "david@example.com",
    role: "MEMBER",
    joinedDate: "Feb 12, 2024",
    orders: 1,
    totalSpent: 1500,
    status: "active",
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Users</h1>
                <p className="mt-1 text-muted-foreground">
                  Manage registered users
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All
                </Button>
                <Button variant="ghost" size="sm">
                  Members
                </Button>
                <Button variant="ghost" size="sm">
                  Admins
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Total Spent
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary/50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={
                              user.role === "ADMIN"
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary text-secondary-foreground"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-muted-foreground">{user.joinedDate}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-muted-foreground">{user.orders}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-foreground">
                            {user.totalSpent === 0
                              ? "-"
                              : `KES ${user.totalSpent.toLocaleString()}`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={
                              user.status === "active"
                                ? "bg-primary/10 text-primary"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              {user.role === "MEMBER" && (
                                <DropdownMenuItem className="gap-2">
                                  <Shield className="h-4 w-4" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              {user.status === "active" ? (
                                <DropdownMenuItem className="gap-2 text-destructive">
                                  <Ban className="h-4 w-4" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="gap-2 text-primary">
                                  <Shield className="h-4 w-4" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
