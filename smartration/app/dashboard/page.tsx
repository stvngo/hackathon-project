"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { DollarSign, Utensils, Target, TrendingUp } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const stats = [
    { label: "Total Saved", value: "$206", icon: DollarSign, color: "green" },
    { label: "Meals Planned", value: "127", icon: Utensils, color: "blue" },
    { label: "Avg Cost/Meal", value: "$3.24", icon: Target, color: "purple" },
    { label: "This Week", value: "+15%", icon: TrendingUp, color: "orange" },
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

  // Get user's first name from metadata or email
  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 
                   user.user_metadata?.name?.split(' ')[0] || 
                   user.email?.split('@')[0] || 
                   'User'

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Welcome */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back, {firstName}</h1>
          <p className="text-gray-600">Here's your meal planning overview</p>
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

        {/* Recent Activity */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: "Generated meal plan", time: "2 hours ago", color: "green" },
              { action: "Uploaded receipt", time: "1 day ago", color: "blue" },
              { action: "Saved $12.40", time: "3 days ago", color: "orange" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.color === "green" ? "bg-green-500" : item.color === "blue" ? "bg-blue-500" : "bg-orange-500"
                    }`}
                  />
                  <span className="text-gray-900 font-medium">{item.action}</span>
                </div>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 