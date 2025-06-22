"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, DollarSign, Eye, Search, Calendar, Utensils, TrendingDown, ArrowUpRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface HistoryItem {
  id: string
  date: string
  totalCost: number
  mealsCount: number
  savedAmount: number
  receipts: number
  status: "completed" | "partial" | "planned"
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const mockHistory: HistoryItem[] = [
    {
      id: "1",
      date: "2025-01-15",
      totalCost: 31.5,
      mealsCount: 9,
      savedAmount: 12.4,
      receipts: 1,
      status: "completed",
    },
    {
      id: "2",
      date: "2025-01-08",
      totalCost: 28.75,
      mealsCount: 9,
      savedAmount: 15.2,
      receipts: 1,
      status: "completed",
    },
    {
      id: "3",
      date: "2025-01-01",
      totalCost: 35.2,
      mealsCount: 9,
      savedAmount: 8.8,
      receipts: 2,
      status: "completed",
    },
    {
      id: "4",
      date: "2024-12-25",
      totalCost: 42.1,
      mealsCount: 12,
      savedAmount: 18.9,
      receipts: 1,
      status: "completed",
    },
    {
      id: "5",
      date: "2024-12-18",
      totalCost: 26.8,
      mealsCount: 6,
      savedAmount: 9.2,
      receipts: 1,
      status: "partial",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-green-400 to-emerald-500"
      case "partial":
        return "from-yellow-400 to-orange-500"
      case "planned":
        return "from-blue-400 to-cyan-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "partial":
        return "In Progress"
      case "planned":
        return "Planned"
      default:
        return "Unknown"
    }
  }

  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch = item.date.includes(searchTerm) || item.totalCost.toString().includes(searchTerm)
    const matchesFilter = selectedFilter === "all" || item.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const totalSaved = mockHistory.reduce((sum, item) => sum + item.savedAmount, 0)
  const totalMeals = mockHistory.reduce((sum, item) => sum + item.mealsCount, 0)
  const avgCostPerMeal = mockHistory.reduce((sum, item) => sum + item.totalCost, 0) / totalMeals

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Meal Plan History
          </h1>
          <p className="text-xl text-gray-600">Track your meal planning journey and savings over time</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">${totalSaved.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Saved</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl shadow-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{totalMeals}</p>
                <p className="text-sm text-gray-600">Total Meals Planned</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl shadow-lg">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">${avgCostPerMeal.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Avg Cost/Meal</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by date or cost..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl h-12"
              />
            </div>
            <div className="flex gap-3">
              {["all", "completed", "partial"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  onClick={() => setSelectedFilter(filter)}
                  className={`capitalize rounded-2xl px-6 ${
                    selectedFilter === filter
                      ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 shadow-lg"
                      : "backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/30"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-6">
          {filteredHistory.map((item) => (
            <Card
              key={item.id}
              className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl rounded-3xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-100/80 to-purple-100/80 rounded-2xl border border-white/30">
                    <Calendar className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>{item.mealsCount} meals planned</span>
                      <span>{item.receipts} receipt(s)</span>
                      <Badge
                        className={`bg-gradient-to-r ${getStatusColor(item.status)} text-white border-0 rounded-xl px-3 py-1`}
                      >
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <span className="text-2xl font-bold text-gray-800">${item.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Saved ${item.savedAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="backdrop-blur-sm bg-white/40 hover:bg-white/60 border border-white/30 rounded-2xl px-6 py-3"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredHistory.length === 0 && (
          <Card className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-xl rounded-3xl p-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No meal plans found</h3>
            <p className="text-gray-500 mb-6 text-lg">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by uploading a receipt to create your first meal plan!"}
            </p>
            {!searchTerm && selectedFilter === "all" && (
              <Button className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-xl border-0">
                <Utensils className="h-5 w-5 mr-3" />
                Upload Receipt
              </Button>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 