"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChefHat, 
  Clock, 
  DollarSign, 
  Heart,
  Trash2,
  Calendar,
  Star
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface SavedMeal {
  id: string
  meal_name: string
  meal_type: string
  meal_data: {
    name: string
    ingredients: string[]
    instructions: string
    nutritionalInfo: string
    cost: number
    prepTime: number
  }
  saved_at: string
  meal_plan_id?: string
}

interface MealRating {
  rating: number
  review?: string
}

export default function SavedMealsPage() {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([])
  const [mealRatings, setMealRatings] = useState<{[key: string]: MealRating}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSavedMeals()
  }, [])

  const loadSavedMeals = async () => {
    try {
      const response = await fetch('/api/meals/saved')
      if (response.ok) {
        const data = await response.json()
        setSavedMeals(data.savedMeals || [])
        
        // Load ratings for all saved meals
        await loadMealRatings(data.savedMeals || [])
      } else {
        setError('Failed to load saved meals')
      }
    } catch (error) {
      console.error('Error loading saved meals:', error)
      setError('Failed to load saved meals')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMealRatings = async (meals: SavedMeal[]) => {
    const ratings: {[key: string]: MealRating} = {}
    
    // First load from localStorage for instant feedback
    const mealRatingsStorage = JSON.parse(localStorage.getItem('mealRatings') || '{}')
    
    for (const meal of meals) {
      // Try to get rating from localStorage first
      if (meal.meal_plan_id) {
        const mealKey = `${meal.meal_plan_id}-${meal.meal_name}-${meal.meal_type}`
        if (mealRatingsStorage[mealKey]) {
          ratings[mealKey] = mealRatingsStorage[mealKey]
        }
      }
      
      // Then try to get from server if we have meal_plan_id
      if (meal.meal_plan_id) {
        try {
          const response = await fetch(`/api/meals/rate?mealPlanId=${meal.meal_plan_id}&mealName=${encodeURIComponent(meal.meal_name)}&mealType=${meal.meal_type}`)
          if (response.ok) {
            const data = await response.json()
            if (data.rating) {
              const mealKey = `${meal.meal_plan_id}-${meal.meal_name}-${meal.meal_type}`
              ratings[mealKey] = {
                rating: data.rating.rating,
                review: data.rating.review
              }
              // Update localStorage
              mealRatingsStorage[mealKey] = ratings[mealKey]
            }
          }
        } catch (error) {
          console.error(`Error loading rating for ${meal.meal_name}:`, error)
        }
      }
    }
    
    // Update localStorage with any new ratings
    localStorage.setItem('mealRatings', JSON.stringify(mealRatingsStorage))
    setMealRatings(ratings)
  }

  const handleRemoveSavedMeal = async (mealId: string) => {
    try {
      const response = await fetch(`/api/meals/saved/${mealId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSavedMeals(prev => prev.filter(meal => meal.id !== mealId))
      }
    } catch (error) {
      console.error('Error removing saved meal:', error)
    }
  }

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "lunch":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "dinner":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "☀️"
      case "dinner":
        return "🌙"
      default:
        return "🍽️"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 shadow-sm border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Saved Meals</h1>
            <Badge className="bg-red-100 text-red-700 border-red-200">
              {savedMeals.length} meals
            </Badge>
          </div>
          <p className="text-gray-600">Your favorite recipes and meal ideas</p>
        </div>

        {error && (
          <Card className="p-6 border border-red-200 bg-red-50">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {savedMeals.length === 0 && !error ? (
          <Card className="p-12 text-center border border-gray-200">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Meals Yet</h2>
            <p className="text-gray-600 mb-6">
              Start saving your favorite meals from your meal plans to access them here later!
            </p>
            <Button onClick={() => window.history.back()} className="bg-green-600 hover:bg-green-700">
              <ChefHat className="h-4 w-4 mr-2" />
              View Meal Plans
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedMeals.map((savedMeal) => (
              <Card key={savedMeal.id} className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Meal Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMealTypeIcon(savedMeal.meal_type)}</span>
                      <Badge className={`capitalize ${getMealTypeColor(savedMeal.meal_type)}`}>
                        {savedMeal.meal_type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSavedMeal(savedMeal.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Meal Name */}
                  <h3 className="text-lg font-semibold text-gray-900">{savedMeal.meal_data.name}</h3>

                  {/* Cost and Time */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign className="h-4 w-4" />
                      {(savedMeal.meal_data.cost || 0).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      {(savedMeal.meal_data.prepTime || 0)}m
                    </div>
                  </div>

                  {/* Rating Display */}
                  {savedMeal.meal_plan_id && mealRatings[`${savedMeal.meal_plan_id}-${savedMeal.meal_name}-${savedMeal.meal_type}`] && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Your rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= mealRatings[`${savedMeal.meal_plan_id}-${savedMeal.meal_name}-${savedMeal.meal_type}`].rating
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {mealRatings[`${savedMeal.meal_plan_id}-${savedMeal.meal_name}-${savedMeal.meal_type}`].review && (
                        <span className="text-xs text-gray-500 ml-2">
                          "{mealRatings[`${savedMeal.meal_plan_id}-${savedMeal.meal_name}-${savedMeal.meal_type}`].review}"
                        </span>
                      )}
                    </div>
                  )}

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(savedMeal.meal_data.ingredients || []).map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                    <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                      {(savedMeal.meal_data.instructions || 'No instructions available').split('\n').map((step, index) => {
                        const trimmedStep = step.trim()
                        if (trimmedStep) {
                          return (
                            <div key={index} className="pl-0">
                              {trimmedStep}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>

                  {/* Nutritional Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1">Nutrition:</h4>
                    <p className="text-sm text-gray-600">{savedMeal.meal_data.nutritionalInfo || 'Nutritional information not available'}</p>
                  </div>

                  {/* Saved Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <Calendar className="h-3 w-3" />
                    Saved on {new Date(savedMeal.saved_at).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 