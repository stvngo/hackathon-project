"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ChefHat, Heart, MessageSquare, ShoppingCart, ArrowRight } from "lucide-react"
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
      color: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
      title: "AI Meal Plans",
      description: "View your personalized meal plans",
      icon: ChefHat,
      href: "/dashboard/ai-meal-plans",
      color: "bg-gradient-to-br from-blue-500 to-sky-500"
    },
    {
      title: "Shopping List",
      description: "Generate AI-powered shopping lists based on your preferences",
      icon: ShoppingCart,
      href: "/dashboard/shopping-list",
      color: "bg-gradient-to-br from-indigo-500 to-purple-500"
    },
    {
      title: "Saved Meals",
      description: "Your favorite meals and recipes",
      icon: Heart,
      href: "/dashboard/saved-meals",
      color: "bg-gradient-to-br from-red-500 to-rose-500"
    },
    {
      title: "FoodGPT",
      description: "Get cooking advice and recipe help",
      icon: MessageSquare,
      href: "/dashboard/foodgpt",
      color: "bg-gradient-to-br from-purple-500 to-fuchsia-500"
    }
  ]

  function ActionCard({ action }: { action: typeof quickActions[0] }) {
    return (
      <div
        className="group relative cursor-pointer w-[350px]"
        onClick={() => router.push(action.href)}
      >
        <Card className="p-6 lg:p-8 border-2 border-gray-200 bg-white hover:border-green-400 hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-2xl">
          <div className="flex-1">
            <div className={`p-3 rounded-xl text-white ${action.color} inline-block mb-6 shadow-md`}>
              <action.icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-gray-600">{action.description}</p>
          </div>
          <div className="mt-6 flex items-center text-green-600 font-semibold">
            <span>Go to {action.title}</span>
            <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-none mx-auto space-y-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-200 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Welcome back, {firstName}</h1>
          <p className="text-gray-600 text-lg">Your smart kitchen assistant is ready to help you eat well and save money.</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          {/* first row of 3 */}
          <div className="flex justify-center gap-8">
            {quickActions.slice(0, 3).map((action, i) => (
              <ActionCard key={i} action={action} />
            ))}
          </div>

          {/* second row of remaining actions, centered */}
          <div className="flex justify-center gap-8">
            {quickActions.slice(3).map((action, i) => (
              <ActionCard key={i + 3} action={action} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 