"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, DollarSign, Heart, Printer, Share2 } from "lucide-react"
import { getMealPlan } from "@/app/actions"

interface MealItem {
  name: string
  ingredients: string[]
  nutritionalInfo: string
  cost: number
  recipe: string
}

export default function ResultsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("day1")

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        // In a real implementation, this would fetch the actual meal plan
        // For this MVP, we'll use mock data
        await getMealPlan()
      } catch (error) {
        console.error("Error loading meal plan:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMealPlan()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Generating your personalized meal plan...</p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a moment as we analyze your ingredients and create budget-friendly recipes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/upload">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Your Weekly Meal Plan</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-2xl font-bold">$47.85</p>
                  <p className="text-xs text-green-600">$12.40 saved from your receipt</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium">Meal Coverage</p>
                  <p className="text-lg font-bold">7 days (21 meals)</p>
                </div>
              </div>

              <div className="flex items-center">
                <Heart className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium">Nutritional Balance</p>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Protein: Good</span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Fiber: Fair</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-2">Nutritional Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Consider adding more leafy greens to increase fiber intake</li>
                <li>• Your protein sources are well-balanced across the week</li>
                <li>• Try to space out carbohydrate-heavy meals throughout the day</li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 mb-6">
              <TabsTrigger value="day1">Mon</TabsTrigger>
              <TabsTrigger value="day2">Tue</TabsTrigger>
              <TabsTrigger value="day3">Wed</TabsTrigger>
              <TabsTrigger value="day4">Thu</TabsTrigger>
              <TabsTrigger value="day5">Fri</TabsTrigger>
              <TabsTrigger value="day6">Sat</TabsTrigger>
              <TabsTrigger value="day7">Sun</TabsTrigger>
            </TabsList>

            {/* Monday's Meal Plan */}
            <TabsContent value="day1">
              <div className="space-y-6">
                <MealCard
                  title="Breakfast"
                  meal={{
                    name: "Veggie Omelette with Toast",
                    ingredients: ["Eggs", "Bell peppers", "Onions", "Cheese", "Bread"],
                    nutritionalInfo: "Protein: 18g, Carbs: 22g, Fat: 14g",
                    cost: 2.15,
                    recipe:
                      "1. Whisk eggs in a bowl. 2. Sauté diced peppers and onions. 3. Pour eggs over vegetables and cook until set. 4. Sprinkle with cheese and fold. 5. Serve with toast.",
                  }}
                />

                <MealCard
                  title="Lunch"
                  meal={{
                    name: "Tuna Salad Sandwich",
                    ingredients: ["Canned tuna", "Mayonnaise", "Celery", "Bread", "Lettuce"],
                    nutritionalInfo: "Protein: 22g, Carbs: 28g, Fat: 12g",
                    cost: 3.4,
                    recipe:
                      "1. Mix tuna, mayo, and diced celery. 2. Spread on bread. 3. Add lettuce and top with second slice of bread. 4. Serve with any remaining vegetables on the side.",
                  }}
                />

                <MealCard
                  title="Dinner"
                  meal={{
                    name: "Pasta with Tomato Sauce and Ground Turkey",
                    ingredients: ["Pasta", "Canned tomatoes", "Ground turkey", "Onion", "Garlic", "Italian herbs"],
                    nutritionalInfo: "Protein: 28g, Carbs: 45g, Fat: 10g",
                    cost: 4.25,
                    recipe:
                      "1. Brown ground turkey in a pan. 2. Add diced onions and garlic, sauté until soft. 3. Add canned tomatoes and herbs, simmer for 15 minutes. 4. Cook pasta according to package directions. 5. Combine pasta and sauce.",
                  }}
                />
              </div>
            </TabsContent>

            {/* Placeholder for other days */}
            {["day2", "day3", "day4", "day5", "day6", "day7"].map((day) => (
              <TabsContent key={day} value={day}>
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    Meal plan for {day.replace("day", "Day ")} would appear here in the full version.
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function MealCard({ title, meal }: { title: string; meal: MealItem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {title}: {meal.name}
          </h3>
          <span className="text-sm font-medium text-green-600">${meal.cost.toFixed(2)}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {meal.ingredients.map((ingredient, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              {ingredient}
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-4">{meal.nutritionalInfo}</p>

        <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)} className="w-full justify-center">
          {expanded ? "Hide Recipe" : "Show Recipe"}
        </Button>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="text-sm text-gray-600 border-t pt-4">
            <h4 className="font-medium mb-2">Recipe Instructions:</h4>
            <p>{meal.recipe}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
