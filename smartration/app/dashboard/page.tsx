"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ChefHat, Heart, MessageSquare } from "lucide-react"
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

  // Get user's first name from metadata or email
  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 
                   user.user_metadata?.name?.split(' ')[0] || 
                   user.email?.split('@')[0] || 
                   'User'

  const quickActions = [
    {
      title: "Upload Receipt",
      description: "Scan your grocery receipt to generate meal plans",
      icon: Upload,
      href: "/dashboard/upload",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "AI Meal Plans",
      description: "View your personalized meal plans",
      icon: ChefHat,
      href: "/dashboard/ai-meal-plans",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Saved Meals",
      description: "Your favorite meals and recipes",
      icon: Heart,
      href: "/dashboard/saved-meals",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "FoodGPT",
      description: "Get cooking advice and recipe help",
      icon: MessageSquare,
      href: "/dashboard/foodgpt",
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Welcome */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back, {firstName}</h1>
          <p className="text-gray-600">Ready to plan your next meal?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg text-white ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 mb-4">{action.description}</p>
                  <Button 
                    onClick={() => router.push(action.href)}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 