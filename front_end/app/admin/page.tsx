import Link from "next/link"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Receipt, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

// Mock stats data
const stats = [
  {
    title: "Total Books",
    value: "1,234",
    change: "+12%",
    trend: "up" as const,
    icon: BookOpen,
  },
  {
    title: "Total Users",
    value: "5,678",
    change: "+8%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Total Orders",
    value: "892",
    change: "+23%",
    trend: "up" as const,
    icon: Receipt,
  },
  {
    title: "Revenue (KES)",
    value: "1.2M",
    change: "+15%",
    trend: "up" as const,
    icon: TrendingUp,
  },
]

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", amount: 3500, status: "PAID" },
  { id: "ORD-002", customer: "Jane Smith", amount: 1200, status: "PAID" },
  { id: "ORD-003", customer: "Mike Johnson", amount: 2800, status: "PENDING" },
  { id: "ORD-004", customer: "Sarah Brown", amount: 0, status: "PAID" },
  { id: "ORD-005", customer: "David Wilson", amount: 4500, status: "PAID" },
]

const topBooks = [
  { title: "The Art of Business Strategy", sales: 234 },
  { title: "Modern Web Development", sales: 189 },
  { title: "Introduction to AI", sales: 156 },
  { title: "Financial Freedom Guide", sales: 143 },
  { title: "Mindful Leadership", sales: 128 },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Overview of your digital library
            </p>

            {/* Stats Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="flex items-center gap-1 text-sm">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-4 w-4 text-primary" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                        )}
                        <span className={stat.trend === "up" ? "text-primary" : "text-destructive"}>
                          {stat.change}
                        </span>
                        <span className="text-muted-foreground">from last month</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Link
                    href="/admin/orders"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-foreground">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {order.amount === 0 ? "Free" : `KES ${order.amount.toLocaleString()}`}
                          </p>
                          <p
                            className={`text-sm ${
                              order.status === "PAID"
                                ? "text-primary"
                                : "text-yellow-500"
                            }`}
                          >
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Books */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top Selling Books</CardTitle>
                  <Link
                    href="/admin/books"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {topBooks.map((book, index) => (
                      <div
                        key={book.title}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
                            {index + 1}
                          </span>
                          <p className="font-medium text-foreground">{book.title}</p>
                        </div>
                        <p className="text-muted-foreground">{book.sales} sales</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
