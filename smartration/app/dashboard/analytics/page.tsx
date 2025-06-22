"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Utensils, Target } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function AnalyticsPage() {
  const stats = [
    { label: "Total Saved", value: "$206", icon: DollarSign, color: "green" },
    { label: "Meals Planned", value: "127", icon: Utensils, color: "blue" },
    { label: "Avg Cost/Meal", value: "$3.24", icon: Target, color: "purple" },
    { label: "Growth", value: "+23%", icon: TrendingUp, color: "orange" },
  ]

  const monthlyData = [
    { month: "Jan", spent: 180, saved: 45 },
    { month: "Feb", spent: 165, saved: 52 },
    { month: "Mar", spent: 142, saved: 68 },
    { month: "Apr", spent: 158, saved: 41 },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-50 text-green-600 border-green-100"
      case "blue":
        return "bg-blue-50 text-blue-600 border-blue-100"
      case "purple":
        return "bg-purple-50 text-purple-600 border-purple-100"
      case "orange":
        return "bg-orange-50 text-orange-600 border-orange-100"
      default:
        return "bg-gray-50 text-gray-600 border-gray-100"
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your savings and meal planning progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getColorClasses(stat.color)}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Monthly Data */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-6">Monthly Overview</h3>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">{data.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">Spent: ${data.spent}</span>
                    <span className="text-green-600 font-medium">Saved: ${data.saved}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(data.saved / (data.spent + data.saved)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 