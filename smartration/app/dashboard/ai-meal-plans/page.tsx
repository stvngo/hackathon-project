"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChefHat, 
  Clock, 
  DollarSign, 
  Users, 
  Utensils, 
  Calendar,
  ArrowLeft,
  Download,
  Share2,
  Heart,
  Star,
  RefreshCw
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { getUserMealPlans } from "@/app/actions"

interface Meal {
  name: string
  ingredients: string[]
  instructions: string
  nutritionalInfo: string
  cost: number
  prepTime: number
}

interface DayPlan {
  day: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  totalDailyCost: number
}

export default function AIMealPlansPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [mealPlans, setMealPlans] = useState<DayPlan[]>([])
  const [currentDay, setCurrentDay] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMealPlans = async () => {
      // Get meal plans from URL params (passed from upload page)
      const mealPlansParam = searchParams.get('mealPlans')
      if (mealPlansParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(mealPlansParam))
          console.log('🔍 Parsed meal plans from URL:', parsed)
          console.log('📊 Meal plans structure:', JSON.stringify(parsed, null, 2))
          
          // Validate that parsed is an array
          if (Array.isArray(parsed)) {
            setMealPlans(parsed)
            // Store in localStorage as backup
            localStorage.setItem('currentMealPlans', JSON.stringify(parsed))
          } else {
            console.error('❌ Meal plans is not an array:', parsed)
            setError('Invalid meal plan format')
          }
        } catch (error) {
          console.error('Error parsing meal plans:', error)
          setError('Failed to load meal plans')
        }
      } else {
        // If no meal plans in URL, try to get from localStorage (fallback)
        const stored = localStorage.getItem('currentMealPlans')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            console.log('🔍 Parsed meal plans from localStorage:', parsed)
            console.log('📊 Meal plans structure:', JSON.stringify(parsed, null, 2))
            
            // Validate that parsed is an array
            if (Array.isArray(parsed)) {
              setMealPlans(parsed)
            } else {
              console.error('❌ Meal plans from localStorage is not an array:', parsed)
              setError('Invalid meal plan format')
            }
          } catch (error) {
            setError('Failed to load meal plans')
          }
        } else {
          // If no cached data, try to fetch from database
          console.log('🗄️ No cached meal plans, fetching from database...')
          try {
            const dbMealPlans = await getUserMealPlans()
            console.log('📊 Database meal plans:', dbMealPlans)
            
            if (dbMealPlans && dbMealPlans.length > 0) {
              // Extract meal plan data from database records
              const extractedMealPlans = dbMealPlans.map(record => record.meal_plan).flat()
              console.log('🔄 Extracted meal plans from database:', extractedMealPlans)
              
              if (Array.isArray(extractedMealPlans) && extractedMealPlans.length > 0) {
                setMealPlans(extractedMealPlans)
                // Store in localStorage for future use
                localStorage.setItem('currentMealPlans', JSON.stringify(extractedMealPlans))
              } else {
                setError('No meal plans found in database')
              }
            } else {
              setError('No meal plans found in database')
            }
          } catch (error) {
            console.error('❌ Error fetching meal plans from database:', error)
            setError('Failed to load meal plans from database')
          }
        }
      }
      setIsLoading(false)
    }

    loadMealPlans()
  }, [searchParams])

  const currentPlan = mealPlans[currentDay]
  
  // Debug logging
  console.log('🎯 Current day:', currentDay)
  console.log('📋 Current plan:', currentPlan)
  console.log('🍽️ Current plan structure:', JSON.stringify(currentPlan, null, 2))
  
  // Validate current plan structure
  const isValidPlan = currentPlan && 
    typeof currentPlan === 'object' && 
    (currentPlan.breakfast || currentPlan.lunch || currentPlan.dinner)

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

  const refreshMealPlans = async () => {
    console.log('🔄 Refreshing meal plans...')
    setIsLoading(true)
    setError(null)
    
    // Clear cached data
    localStorage.removeItem('currentMealPlans')
    
    try {
      const dbMealPlans = await getUserMealPlans()
      console.log('📊 Database meal plans:', dbMealPlans)
      
      if (dbMealPlans && dbMealPlans.length > 0) {
        // Extract meal plan data from database records
        const extractedMealPlans = dbMealPlans.map(record => record.meal_plan).flat()
        console.log('🔄 Extracted meal plans from database:', extractedMealPlans)
        
        if (Array.isArray(extractedMealPlans) && extractedMealPlans.length > 0) {
          setMealPlans(extractedMealPlans)
          setCurrentDay(0)
          // Store in localStorage for future use
          localStorage.setItem('currentMealPlans', JSON.stringify(extractedMealPlans))
        } else {
          setError('No meal plans found in database')
        }
      } else {
        setError('No meal plans found in database')
      }
    } catch (error) {
      console.error('❌ Error fetching meal plans from database:', error)
      setError('Failed to load meal plans from database')
    }
    
    setIsLoading(false)
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

  if (error || !currentPlan || !isValidPlan) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
          <div className="text-center">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Meal Plans Found</h1>
            <p className="text-gray-600 mb-6">
              {error || (!currentPlan ? 'No meal plan data available' : 'Invalid meal plan structure')}
            </p>
            <Button onClick={() => router.push('/dashboard/upload')} className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Upload Receipt
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">AI-Generated Meal Plan</h1>
                <p className="text-gray-600">Personalized recipes based on your groceries</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshMealPlans}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
              disabled={currentDay === 0}
              size="sm"
            >
              Previous Day
            </Button>

            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900">{currentPlan.day}</h2>
              <p className="text-sm text-gray-600">
                ${(currentPlan.totalDailyCost || 0).toFixed(2)} total cost
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setCurrentDay(Math.min(mealPlans.length - 1, currentDay + 1))}
              disabled={currentDay === mealPlans.length - 1}
              size="sm"
            >
              Next Day
            </Button>
          </div>

          {/* Day indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {mealPlans.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  index === currentDay ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={() => setCurrentDay(index)}
              />
            ))}
          </div>
        </div>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
            const meal = currentPlan[mealType]
            
            // Skip rendering if meal is undefined
            if (!meal) {
              return (
                <Card key={mealType} className="p-6 border border-gray-200 shadow-sm">
                  <div className="text-center text-gray-500">
                    <span className="text-2xl">{getMealTypeIcon(mealType)}</span>
                    <p className="mt-2">No {mealType} planned</p>
                  </div>
                </Card>
              )
            }
            
            return (
              <Card key={mealType} className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Meal Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMealTypeIcon(mealType)}</span>
                      <Badge className={`capitalize ${getMealTypeColor(mealType)}`}>
                        {mealType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {(meal.prepTime || 0)}m
                    </div>
                  </div>

                  {/* Meal Name */}
                  <h3 className="text-lg font-semibold text-gray-900">{meal.name || 'Unnamed Meal'}</h3>

                  {/* Cost */}
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign className="h-4 w-4" />
                    {(meal.cost || 0).toFixed(2)}
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(meal.ingredients || []).map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{meal.instructions || 'No instructions available'}</p>
                  </div>

                  {/* Nutritional Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1">Nutrition:</h4>
                    <p className="text-sm text-gray-600">{meal.nutritionalInfo || 'Nutritional information not available'}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Star className="h-3 w-3 mr-1" />
                      Rate
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Summary Card */}
        <Card className="p-6 border border-gray-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${(currentPlan.totalDailyCost || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Daily Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mealPlans.length}</div>
              <div className="text-sm text-gray-600">Days Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">21</div>
              <div className="text-sm text-gray-600">Total Meals</div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 