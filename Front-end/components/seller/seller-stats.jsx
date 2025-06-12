"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

const data = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
  { name: "Jul", sales: 3490 },
  { name: "Aug", sales: 4200 },
  { name: "Sep", sales: 3800 },
  { name: "Oct", sales: 4100 },
  { name: "Nov", sales: 5300 },
  { name: "Dec", sales: 6200 },
]

export default function SellerStats({
  calculateTotalRevenue,
  countSoldProducts,
  countTotalOrders,
  countUniqueCustomers,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="dashboard-stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">${calculateTotalRevenue().toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">+18% from last month</p>
        </CardContent>
      </Card>
      <Card className="dashboard-stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{countSoldProducts()}</div>
          <p className="text-xs text-muted-foreground">+2 new this month</p>
        </CardContent>
      </Card>
      <Card className="dashboard-stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{countTotalOrders()}</div>
          <p className="text-xs text-muted-foreground">+24% from last month</p>
        </CardContent>
      </Card>
      <Card className="dashboard-stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{countUniqueCustomers()}</div>
          <p className="text-xs text-muted-foreground">+12 new this month</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly sales performance for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickLine={false}
                  tick={{ fill: "#666", fontSize: 12 }}
                />
                <YAxis axisLine={{ stroke: "#e0e0e0" }} tickLine={false} tick={{ fill: "#666", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                  contentStyle={{
                    borderRadius: "4px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" barSize={30} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
