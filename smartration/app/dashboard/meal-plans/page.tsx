"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, DollarSign, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

const mockMeals = {
  "Day 1": [
    { name: "Veggie Scramble", type: "Breakfast", time: 15, cost: 2.45 },
    { name: "Mediterranean Wrap", type: "Lunch", time: 10, cost: 3.2 },
    { name: "Chicken & Rice", type: "Dinner", time: 35, cost: 4.85 },
  ],
  "Day 2": [
    { name: "Overnight Oats", type: "Breakfast", time: 5, cost: 1.85 },
    { name: "Tuna Pasta", type: "Lunch", time: 20, cost: 2.95 },
    { name: "Veggie Stir-Fry", type: "Dinner", time: 25, cost: 3.65 },
  ],
  "Day 3": [
    { name: "Protein Pancakes", type: "Breakfast", time: 20, cost: 2.15 },
    { name: "Caesar Salad", type: "Lunch", time: 15, cost: 4.25 },
    { name: "Beef & Broccoli", type: "Dinner", time: 30, cost: 5.45 },
  ],
}

export default function MealPlansPage() {
  const [currentDay, setCurrentDay] = useState("Day 1")
  const days = Object.keys(mockMeals)
  const currentIndex = days.indexOf(currentDay)
  const meals = mockMeals[currentDay as keyof typeof mockMeals] || []

  const nextDay = () => {
    const nextIndex = (currentIndex + 1) % days.length
    setCurrentDay(days[nextIndex])
  }

  const prevDay = () => {
    const prevIndex = (currentIndex - 1 + days.length) % days.length
    setCurrentDay(days[prevIndex])
  }

  const totalCost = meals.reduce((sum, meal) => sum + meal.cost, 0)

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "Breakfast":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "Lunch":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Dinner":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Meal Plans</h1>
          <p className="text-gray-600">Your personalized 3-day meal plan</p>
        </div>

        {/* Day Navigation */}
        <Card className="p-6 border border-gray-200 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prevDay} size="sm" className="border-gray-300 hover:bg-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900">{currentDay}</h2>
              <p className="text-sm text-gray-600">${totalCost.toFixed(2)} total cost</p>
            </div>

            <Button variant="outline" onClick={nextDay} size="sm" className="border-gray-300 hover:bg-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {days.map((day, index) => (
              <div
                key={day}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Meals */}
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <Card key={index} className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={`border ${getMealTypeColor(meal.type)}`} variant="outline">
                    {meal.type}
                  </Badge>
                  <div>
                    <h3 className="font-medium text-gray-900">{meal.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded border border-gray-100">
                    <Clock className="h-3 w-3" />
                    {meal.time}m
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded border border-green-100 text-green-700">
                    <DollarSign className="h-3 w-3" />
                    {meal.cost.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-shadow">
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate {currentDay}
        </Button>
      </div>
    </DashboardLayout>
  )
} 