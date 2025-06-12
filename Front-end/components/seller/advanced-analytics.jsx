"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Calendar,
  Download,
  DollarSign,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
} from "lucide-react"

// Mock data for analytics
const salesData = [
  { name: "Jan", sales: 4000, orders: 240, customers: 125 },
  { name: "Feb", sales: 3000, orders: 198, customers: 110 },
  { name: "Mar", sales: 5000, orders: 305, customers: 145 },
  { name: "Apr", sales: 2780, orders: 189, customers: 98 },
  { name: "May", sales: 1890, orders: 142, customers: 87 },
  { name: "Jun", sales: 2390, orders: 167, customers: 96 },
  { name: "Jul", sales: 3490, orders: 212, customers: 114 },
  { name: "Aug", sales: 4200, orders: 252, customers: 136 },
  { name: "Sep", sales: 3800, orders: 231, customers: 128 },
  { name: "Oct", sales: 4100, orders: 246, customers: 132 },
  { name: "Nov", sales: 5300, orders: 312, customers: 158 },
  { name: "Dec", sales: 6200, orders: 368, customers: 175 },
]

const categoryData = [
  { name: "Smartphones", value: 35 },
  { name: "Laptops", value: 25 },
  { name: "Audio", value: 15 },
  { name: "Wearables", value: 10 },
  { name: "Accessories", value: 10 },
  { name: "Gaming", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const topProducts = [
  { name: "Premium Wireless Headphones", sales: 245, revenue: 48950.55 },
  { name: "Smartphone Pro Max", sales: 187, revenue: 186813.13 },
  { name: "Ultra HD Smart TV", sales: 142, revenue: 113558.58 },
  { name: "Wireless Earbuds", sales: 132, revenue: 17158.68 },
  { name: "Gaming Laptop", sales: 98, revenue: 147000.02 },
]

const customerSegments = [
  { name: "New Customers", value: 30 },
  { name: "Returning Customers", value: 45 },
  { name: "Loyal Customers", value: 25 },
]

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("year")
  const [chartType, setChartType] = useState("bar")
  const [dataType, setDataType] = useState("sales")

  // Calculate summary metrics
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0)
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0)
  const totalCustomers = salesData.reduce((sum, item) => sum + item.customers, 0)

  // Calculate month-over-month growth
  const lastMonthSales = salesData[salesData.length - 1].sales
  const previousMonthSales = salesData[salesData.length - 2].sales
  const salesGrowth = ((lastMonthSales - previousMonthSales) / previousMonthSales) * 100

  const lastMonthOrders = salesData[salesData.length - 1].orders
  const previousMonthOrders = salesData[salesData.length - 2].orders
  const ordersGrowth = ((lastMonthOrders - previousMonthOrders) / previousMonthOrders) * 100

  const lastMonthCustomers = salesData[salesData.length - 1].customers
  const previousMonthCustomers = salesData[salesData.length - 2].customers
  const customersGrowth = ((lastMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100

  // Filter data based on time range
  const getFilteredData = () => {
    switch (timeRange) {
      case "month":
        return salesData.slice(-1)
      case "quarter":
        return salesData.slice(-3)
      case "halfYear":
        return salesData.slice(-6)
      case "year":
      default:
        return salesData
    }
  }

  const filteredData = getFilteredData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Sales Analytics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="halfYear">Last 6 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 dark:border-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>Custom Range</span>
          </Button>
          <Button variant="outline" className="gap-2 dark:border-gray-600 dark:text-gray-300">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">${totalSales.toLocaleString()}</h3>
                <div
                  className={`flex items-center mt-1 text-xs ${salesGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {salesGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(salesGrowth).toFixed(1)}% from last month</span>
                </div>
              </div>
              <div className="rounded-full bg-primary/10 p-3 dark:bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary dark:text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">{totalOrders.toLocaleString()}</h3>
                <div
                  className={`flex items-center mt-1 text-xs ${ordersGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {ordersGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(ordersGrowth).toFixed(1)}% from last month</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3 dark:bg-blue-500/20">
                <ShoppingBag className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Customers</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">{totalCustomers.toLocaleString()}</h3>
                <div
                  className={`flex items-center mt-1 text-xs ${customersGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {customersGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(customersGrowth).toFixed(1)}% from last month</span>
                </div>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3 dark:bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Monthly sales, orders, and customer acquisition</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Data Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Revenue</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => (dataType === "sales" ? `$${value}` : value)}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
                  />
                  <Legend />
                  <Bar
                    dataKey={dataType}
                    fill={dataType === "sales" ? "#3c8c44" : dataType === "orders" ? "#3b82f6" : "#8b5cf6"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => (dataType === "sales" ? `$${value}` : value)}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={dataType}
                    stroke={dataType === "sales" ? "#3c8c44" : dataType === "orders" ? "#3b82f6" : "#8b5cf6"}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => (dataType === "sales" ? `$${value}` : value)}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey={dataType}
                    stroke={dataType === "sales" ? "#3c8c44" : dataType === "orders" ? "#3b82f6" : "#8b5cf6"}
                    fill={dataType === "sales" ? "#3c8c4433" : dataType === "orders" ? "#3b82f633" : "#8b5cf633"}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Products with the highest sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">{product.name}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">{product.sales} units sold</p>
                    </div>
                  </div>
                  <p className="font-medium dark:text-white">
                    ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of sales across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Breakdown of your customer base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Forecast */}
        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Forecast</CardTitle>
                <CardDescription>Projected sales for the next 3 months</CardDescription>
              </div>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    ...salesData.slice(-3),
                    { name: "Jan", sales: 6500, orders: 380, customers: 185, forecast: true },
                    { name: "Feb", sales: 6800, orders: 395, customers: 192, forecast: true },
                    { name: "Mar", sales: 7200, orders: 410, customers: 200, forecast: true },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (props.payload.forecast) {
                        return [`$${value} (Forecast)`, name]
                      }
                      return [`$${value}`, name]
                    }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3c8c44"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3c8c44"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    data={[
                      { name: "Jan", sales: 6500 },
                      { name: "Feb", sales: 6800 },
                      { name: "Mar", sales: 7200 },
                    ]}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
