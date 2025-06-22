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
  RefreshCw,
  X,
  CheckCircle,
  XCircle
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { getCurrentWeeklyMealPlan } from "@/app/actions"

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

interface SavedMealState {
  [key: string]: boolean
}

interface MealRatingState {
  [key: string]: {
    rating: number
    review?: string
  }
}

interface Toast {
  id: string
  type: 'success' | 'error'
  message: string
  icon: React.ReactNode
}

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, review?: string) => void
  mealName: string
  currentRating?: number
  currentReview?: string
}

function Toast({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 ${
      toast.type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {toast.icon}
      <span className="font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function RatingModal({ isOpen, onClose, onSubmit, mealName, currentRating, currentReview }: RatingModalProps) {
  const [rating, setRating] = useState(currentRating || 0)
  const [review, setReview] = useState(currentReview || '')
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    setRating(currentRating || 0)
    setReview(currentReview || '')
  }, [currentRating, currentReview])

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review.trim() || undefined)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rate this meal</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">{mealName}</p>
          
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-500 mb-4">
            {rating === 0 && 'Click a star to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review (optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about this meal..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {currentRating ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AIMealPlansPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [mealPlans, setMealPlans] = useState<DayPlan[]>([])
  const [currentDay, setCurrentDay] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedMeals, setSavedMeals] = useState<SavedMealState>({})
  const [mealRatings, setMealRatings] = useState<MealRatingState>({})
  const [currentMealPlanId, setCurrentMealPlanId] = useState<string | null>(null)
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean
    mealName: string
    mealType: string
    meal: Meal
  } | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const icon = type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />
    const newToast: Toast = { id, type, message, icon }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    const loadMealPlans = async () => {
      // Get meal plans from URL params (passed from upload page)
      const mealPlansParam = searchParams.get('mealPlans')
      const mealPlanIdParam = searchParams.get('mealPlanId')
      
      if (mealPlanIdParam) {
        setCurrentMealPlanId(mealPlanIdParam)
        // Store in localStorage for persistence
        localStorage.setItem('currentMealPlanId', mealPlanIdParam)
      } else {
        // Try to get from localStorage
        const storedMealPlanId = localStorage.getItem('currentMealPlanId')
        if (storedMealPlanId) {
          console.log('📋 Found meal plan ID in localStorage:', storedMealPlanId)
          setCurrentMealPlanId(storedMealPlanId)
        }
      }
      
      // Always try to load from weekly meal plan first (this is the source of truth)
      console.log('📅 Loading weekly meal plan from database...')
      try {
        const weeklyPlan = await getCurrentWeeklyMealPlan()
        console.log('📊 Weekly meal plan from database:', weeklyPlan)
        
        if (weeklyPlan && weeklyPlan.meal_plan && weeklyPlan.meal_plan.length > 0) {
          console.log('✅ Found weekly meal plan with', weeklyPlan.meal_plan.length, 'meal plans')
          
          // Flatten all meal plans into individual days with proper labeling
          const flattenedMeals: DayPlan[] = []
          let globalDayCounter = 1
          
          weeklyPlan.meal_plan.forEach((mealPlan: any[], mealPlanIndex: number) => {
            // Only process meal plans that actually contain meals
            if (Array.isArray(mealPlan) && mealPlan.length > 0) {
              console.log(`📋 Processing meal plan ${mealPlanIndex + 1} with ${mealPlan.length} days`)
              mealPlan.forEach((dayPlan: any, dayIndex: number) => {
                const mealPlanNumber = mealPlanIndex + 1
                flattenedMeals.push({
                  ...dayPlan,
                  day: `Meal Plan ${mealPlanNumber} - Day ${globalDayCounter}`
                })
                globalDayCounter++
              })
            } else {
              console.log(`⏭️ Skipping empty meal plan ${mealPlanIndex + 1}`)
            }
          })
          
          console.log('📊 Flattened meals from refresh:', flattenedMeals.map((meal, index) => ({ day: meal.day, index })))
          
          setMealPlans(flattenedMeals)
          setCurrentMealPlanId(weeklyPlan.id)
          setCurrentDay(0)
          // Store in localStorage for future use
          localStorage.setItem('currentMealPlans', JSON.stringify(flattenedMeals))
          localStorage.setItem('currentMealPlanId', weeklyPlan.id)
          setIsLoading(false)
          return // Exit early since we have the data
        }
      } catch (error) {
        console.error('❌ Error loading weekly meal plan:', error)
      }
      
      // Fallback to URL parameters if no weekly plan found
      if (mealPlansParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(mealPlansParam))
          console.log('🔍 Parsed meal plans from URL:', parsed)
          console.log('📊 Meal plans structure:', JSON.stringify(parsed, null, 2))
          
          if (Array.isArray(parsed)) {
            // Handle both old format (flat array) and new format (array of arrays)
            let organizedMeals: DayPlan[]
            
            if (parsed.length > 0 && Array.isArray(parsed[0])) {
              // New format: array of meal plans (each meal plan is an array of days)
              const flattenedMeals: DayPlan[] = []
              let globalDayCounter = 1
              
              parsed.forEach((mealPlan: any[], mealPlanIndex: number) => {
                // Only process meal plans that actually contain meals
                if (Array.isArray(mealPlan) && mealPlan.length > 0) {
                  console.log(`📋 Processing meal plan ${mealPlanIndex + 1} with ${mealPlan.length} days from URL`)
                  mealPlan.forEach((dayPlan: any, dayIndex: number) => {
                    const mealPlanNumber = mealPlanIndex + 1
                    flattenedMeals.push({
                      ...dayPlan,
                      day: `Meal Plan ${mealPlanNumber} - Day ${globalDayCounter}`
                    })
                    globalDayCounter++
                  })
                } else {
                  console.log(`⏭️ Skipping empty meal plan ${mealPlanIndex + 1} from URL`)
                }
              })
              organizedMeals = flattenedMeals
            } else {
              // Old format: flat array of days
              organizedMeals = parsed.map((mealPlan, index) => ({
                ...mealPlan,
                day: `Day ${index + 1}` // Ensure proper day labeling
              }))
            }
            
            setMealPlans(organizedMeals)
            // Store in localStorage as backup
            localStorage.setItem('currentMealPlans', JSON.stringify(organizedMeals))
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
              // Handle both old format (flat array) and new format (array of arrays)
              let organizedMeals: DayPlan[]
              
              if (parsed.length > 0 && Array.isArray(parsed[0])) {
                // New format: array of meal plans (each meal plan is an array of days)
                const flattenedMeals: DayPlan[] = []
                parsed.forEach((mealPlan: any[], mealPlanIndex: number) => {
                  // Only process meal plans that actually contain meals
                  if (Array.isArray(mealPlan) && mealPlan.length > 0) {
                    console.log(`📋 Processing meal plan ${mealPlanIndex + 1} with ${mealPlan.length} days from localStorage`)
                    mealPlan.forEach((dayPlan: any, dayIndex: number) => {
                      const mealPlanNumber = mealPlanIndex + 1
                      flattenedMeals.push({
                        ...dayPlan,
                        day: `Meal Plan ${mealPlanNumber} - Day ${dayIndex + 1}`
                      })
                    })
                  } else {
                    console.log(`⏭️ Skipping empty meal plan ${mealPlanIndex + 1} from localStorage`)
                  }
                })
                organizedMeals = flattenedMeals
              } else {
                // Old format: flat array of days
                organizedMeals = parsed.map((mealPlan, index) => ({
                  ...mealPlan,
                  day: `Day ${index + 1}` // Ensure proper day labeling
                }))
              }
              
              setMealPlans(organizedMeals)
            } else {
              console.error('❌ Meal plans from localStorage is not an array:', parsed)
              setError('Invalid meal plan format')
            }
          } catch (error) {
            setError('Failed to load meal plans')
          }
        } else {
          setError('No meal plans found for this week')
        }
      }
      setIsLoading(false)
    }

    loadMealPlans()
  }, [searchParams])

  // Load saved/rated state for current meal plan
  useEffect(() => {
    console.log('🔄 State loading effect triggered:')
    console.log('- currentMealPlanId:', currentMealPlanId)
    console.log('- mealPlans.length:', mealPlans.length)
    
    if (currentMealPlanId && mealPlans.length > 0) {
      console.log('✅ Loading meal states...')
      loadMealStatesFromStorage() // Instant load from localStorage
      syncWithServer() // Background sync with server
    } else if (mealPlans.length > 0 && !currentMealPlanId) {
      // If we have meal plans but no meal plan ID, try to get it from the database
      console.log('🔍 No meal plan ID, trying to get from database...')
      getMealPlanIdFromDatabase()
    }
  }, [currentMealPlanId, mealPlans])

  const getMealPlanIdFromDatabase = async () => {
    try {
      const weeklyPlan = await getCurrentWeeklyMealPlan()
      if (weeklyPlan && weeklyPlan.id) {
        console.log('📋 Found weekly meal plan ID from database:', weeklyPlan.id)
        setCurrentMealPlanId(weeklyPlan.id)
        // Store in localStorage for persistence
        localStorage.setItem('currentMealPlanId', weeklyPlan.id)
      }
    } catch (error) {
      console.error('Error getting weekly meal plan ID from database:', error)
    }
  }

  const loadMealStatesFromStorage = () => {
    console.log('⚡ Loading states from localStorage for instant feedback...')
    
    // Load from localStorage for instant feedback
    const savedMealsStorage = JSON.parse(localStorage.getItem('savedMeals') || '{}')
    const mealRatingsStorage = JSON.parse(localStorage.getItem('mealRatings') || '{}')
    
    const newSavedMeals: SavedMealState = {}
    const newMealRatings: MealRatingState = {}

    // Check saved state and ratings for each meal
    for (const dayPlan of mealPlans) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const meal = dayPlan[mealType]
        if (!meal) continue

        const mealKey = `${currentMealPlanId}-${meal.name}-${mealType}`
        
        // Load from localStorage first
        newSavedMeals[mealKey] = savedMealsStorage[mealKey] || false
        if (mealRatingsStorage[mealKey]) {
          newMealRatings[mealKey] = mealRatingsStorage[mealKey]
        }
      }
    }

    console.log('📊 Instant saved meals state:', newSavedMeals)
    console.log('📊 Instant meal ratings state:', newMealRatings)
    setSavedMeals(newSavedMeals)
    setMealRatings(newMealRatings)
  }

  const syncWithServer = async () => {
    if (!currentMealPlanId) return
    
    console.log('🔄 Starting background server sync...')
    
    const savedMealsStorage = JSON.parse(localStorage.getItem('savedMeals') || '{}')
    const mealRatingsStorage = JSON.parse(localStorage.getItem('mealRatings') || '{}')
    
    let hasChanges = false

    // Check saved state and ratings for each meal
    for (const dayPlan of mealPlans) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const meal = dayPlan[mealType]
        if (!meal) continue

        const mealKey = `${currentMealPlanId}-${meal.name}-${mealType}`

        try {
          // Check if saved
          const savedResponse = await fetch(`/api/meals/check-saved?mealPlanId=${currentMealPlanId}&mealName=${encodeURIComponent(meal.name)}&mealType=${mealType}`)
          if (savedResponse.ok) {
            const savedData = await savedResponse.json()
            const serverSavedState = savedData.isSaved
            const localSavedState = savedMealsStorage[mealKey] || false
            
            // Update localStorage if server state differs
            if (serverSavedState !== localSavedState) {
              if (serverSavedState) {
                savedMealsStorage[mealKey] = true
              } else {
                delete savedMealsStorage[mealKey]
              }
              hasChanges = true
              console.log(`🔄 Synced ${meal.name} saved state: ${localSavedState} → ${serverSavedState}`)
            }
          }

          // Check rating
          const ratingResponse = await fetch(`/api/meals/rate?mealPlanId=${currentMealPlanId}&mealName=${encodeURIComponent(meal.name)}&mealType=${mealType}`)
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json()
            if (ratingData.rating) {
              const serverRating = {
                rating: ratingData.rating.rating,
                review: ratingData.rating.review
              }
              const localRating = mealRatingsStorage[mealKey]
              
              // Update localStorage if server rating differs
              if (JSON.stringify(serverRating) !== JSON.stringify(localRating)) {
                mealRatingsStorage[mealKey] = serverRating
                hasChanges = true
                console.log(`🔄 Synced ${meal.name} rating:`, serverRating.rating)
              }
            }
          }
        } catch (error) {
          console.error(`Error syncing state for ${meal.name}:`, error)
          // Keep localStorage state if server sync fails
        }
      }
    }

    // Update localStorage and state if there were changes
    if (hasChanges) {
      localStorage.setItem('savedMeals', JSON.stringify(savedMealsStorage))
      localStorage.setItem('mealRatings', JSON.stringify(mealRatingsStorage))
      
      // Update React state with synced data
      setSavedMeals(savedMealsStorage)
      setMealRatings(mealRatingsStorage)
      console.log('✅ Server sync completed with updates')
    } else {
      console.log('✅ Server sync completed - no changes needed')
    }
  }

  const handleSaveMeal = async (meal: Meal, mealType: string) => {
    if (!currentMealPlanId) return

    const mealKey = `${currentMealPlanId}-${meal.name}-${mealType}`
    const isCurrentlySaved = savedMeals[mealKey]

    // Immediately update local state for instant feedback
    const newSavedState = !isCurrentlySaved
    setSavedMeals(prev => ({ ...prev, [mealKey]: newSavedState }))
    
    // Store in localStorage for persistence
    const savedMealsStorage = JSON.parse(localStorage.getItem('savedMeals') || '{}')
    if (newSavedState) {
      savedMealsStorage[mealKey] = true
    } else {
      delete savedMealsStorage[mealKey]
    }
    localStorage.setItem('savedMeals', JSON.stringify(savedMealsStorage))

    try {
      if (isCurrentlySaved) {
        // Remove from saved
        const response = await fetch('/api/meals/save', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealPlanId: currentMealPlanId,
            mealName: meal.name,
            mealType
          })
        })

        if (response.ok) {
          addToast('success', `${meal.name} removed from saved meals`)
        } else {
          // Revert local state if server call fails
          setSavedMeals(prev => ({ ...prev, [mealKey]: true }))
          savedMealsStorage[mealKey] = true
          localStorage.setItem('savedMeals', JSON.stringify(savedMealsStorage))
          addToast('error', 'Failed to remove meal from saved meals')
        }
      } else {
        // Save meal
        const response = await fetch('/api/meals/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealPlanId: currentMealPlanId,
            mealName: meal.name,
            mealType,
            mealData: meal
          })
        })

        if (response.ok) {
          addToast('success', `${meal.name} saved to your favorites!`)
        } else {
          // Revert local state if server call fails
          setSavedMeals(prev => ({ ...prev, [mealKey]: false }))
          delete savedMealsStorage[mealKey]
          localStorage.setItem('savedMeals', JSON.stringify(savedMealsStorage))
          addToast('error', 'Failed to save meal')
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving meal:', error)
      // Revert local state if server call fails
      setSavedMeals(prev => ({ ...prev, [mealKey]: isCurrentlySaved }))
      if (isCurrentlySaved) {
        savedMealsStorage[mealKey] = true
      } else {
        delete savedMealsStorage[mealKey]
      }
      localStorage.setItem('savedMeals', JSON.stringify(savedMealsStorage))
      addToast('error', 'Failed to save meal')
    }
  }

  const handleRateMeal = async (meal: Meal, mealType: string, rating: number, review?: string) => {
    if (!currentMealPlanId) return

    const mealKey = `${currentMealPlanId}-${meal.name}-${mealType}`

    // Immediately update local state for instant feedback
    const newRating = { rating, review }
    setMealRatings(prev => ({
      ...prev,
      [mealKey]: newRating
    }))
    
    // Store in localStorage for persistence
    const mealRatingsStorage = JSON.parse(localStorage.getItem('mealRatings') || '{}')
    mealRatingsStorage[mealKey] = newRating
    localStorage.setItem('mealRatings', JSON.stringify(mealRatingsStorage))

    try {
      const response = await fetch('/api/meals/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealPlanId: currentMealPlanId,
          mealName: meal.name,
          mealType,
          rating,
          review
        })
      })

      if (response.ok) {
        addToast('success', `Rating submitted for ${meal.name}!`)
      } else {
        // Revert local state if server call fails
        setMealRatings(prev => ({
          ...prev,
          [mealKey]: undefined
        }))
        delete mealRatingsStorage[mealKey]
        localStorage.setItem('mealRatings', JSON.stringify(mealRatingsStorage))
        addToast('error', 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error rating meal:', error)
      // Revert local state if server call fails
      setMealRatings(prev => ({
        ...prev,
        [mealKey]: undefined
      }))
      delete mealRatingsStorage[mealKey]
      localStorage.setItem('mealRatings', JSON.stringify(mealRatingsStorage))
      addToast('error', 'Failed to submit rating')
    }
  }

  const openRatingModal = (meal: Meal, mealType: string) => {
    const mealKey = currentMealPlanId ? `${currentMealPlanId}-${meal.name}-${mealType}` : ''
    const currentRating = mealRatings[mealKey]
    
    setRatingModal({
      isOpen: true,
      mealName: meal.name,
      mealType,
      meal
    })
  }

  const closeRatingModal = () => {
    setRatingModal(null)
  }

  const currentPlan = mealPlans[currentDay]
  
  // Debug logging
  console.log('🎯 Current day:', currentDay)
  console.log('📋 Current plan:', currentPlan)
  console.log('🍽️ Current plan structure:', JSON.stringify(currentPlan, null, 2))
  console.log('📅 All meal plans:', mealPlans.map((plan, index) => ({ day: plan.day, index })))
  
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
    console.log('🔄 Refreshing weekly meal plan...')
    setIsLoading(true)
    setError(null)
    
    // Clear cached data
    localStorage.removeItem('currentMealPlans')
    localStorage.removeItem('currentMealPlanId')
    
    try {
      const weeklyPlan = await getCurrentWeeklyMealPlan()
      console.log('📊 Weekly meal plan:', weeklyPlan)
      
      if (weeklyPlan && weeklyPlan.meal_plan && weeklyPlan.meal_plan.length > 0) {
        // Flatten all meal plans into individual days with proper labeling
        const flattenedMeals: DayPlan[] = []
        let globalDayCounter = 1
        
        weeklyPlan.meal_plan.forEach((mealPlan: any[], mealPlanIndex: number) => {
          // Only process meal plans that actually contain meals
          if (Array.isArray(mealPlan) && mealPlan.length > 0) {
            console.log(`📋 Processing meal plan ${mealPlanIndex + 1} with ${mealPlan.length} days`)
            mealPlan.forEach((dayPlan: any, dayIndex: number) => {
              const mealPlanNumber = mealPlanIndex + 1
              flattenedMeals.push({
                ...dayPlan,
                day: `Meal Plan ${mealPlanNumber} - Day ${globalDayCounter}`
              })
              globalDayCounter++
            })
          } else {
            console.log(`⏭️ Skipping empty meal plan ${mealPlanIndex + 1}`)
          }
        })
        
        console.log('📊 Flattened meals from refresh:', flattenedMeals.map((meal, index) => ({ day: meal.day, index })))
        
        setMealPlans(flattenedMeals)
        setCurrentMealPlanId(weeklyPlan.id)
        setCurrentDay(0)
        // Store in localStorage for future use
        localStorage.setItem('currentMealPlans', JSON.stringify(flattenedMeals))
        localStorage.setItem('currentMealPlanId', weeklyPlan.id)
      } else {
        setError('No meal plans found for this week')
      }
    } catch (error) {
      console.error('❌ Error fetching weekly meal plan from database:', error)
      setError('Failed to load weekly meal plan from database')
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
                ${typeof currentPlan.totalDailyCost === 'number' ? currentPlan.totalDailyCost.toFixed(2) : '0.00'} total cost
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

            const mealKey = currentMealPlanId ? `${currentMealPlanId}-${meal.name}-${mealType}` : ''
            const isSaved = savedMeals[mealKey] || false
            const mealRating = mealRatings[mealKey]
            
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
                      {typeof meal.prepTime === 'number' ? meal.prepTime : 0}m
                    </div>
                  </div>

                  {/* Meal Name */}
                  <h3 className="text-lg font-semibold text-gray-900">{meal.name || 'Unnamed Meal'}</h3>

                  {/* Cost */}
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign className="h-4 w-4" />
                    {typeof meal.cost === 'number' ? meal.cost.toFixed(2) : '0.00'}
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
                    <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                      {(meal.instructions || 'No instructions available').split('\n').map((step, index) => {
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
                    <p className="text-sm text-gray-600">{meal.nutritionalInfo || 'Nutritional information not available'}</p>
                  </div>

                  {/* Rating Display */}
                  {mealRating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Your rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= mealRating.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant={isSaved ? "default" : "outline"} 
                      size="sm" 
                      className={`flex-1 transition-all duration-200 ${
                        isSaved 
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                          : 'hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                      }`}
                      onClick={() => handleSaveMeal(meal, mealType)}
                    >
                      <Heart className={`h-3 w-3 mr-1 transition-all duration-200 ${
                        isSaved ? 'fill-current scale-110' : ''
                      }`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                      onClick={() => openRatingModal(meal, mealType)}
                    >
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
                ${typeof currentPlan.totalDailyCost === 'number' ? currentPlan.totalDailyCost.toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Daily Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mealPlans.length}</div>
              <div className="text-sm text-gray-600">Days Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mealPlans.reduce((total, dayPlan) => {
                  let dayMeals = 0
                  if (dayPlan.breakfast) dayMeals++
                  if (dayPlan.lunch) dayMeals++
                  if (dayPlan.dinner) dayMeals++
                  return total + dayMeals
                }, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Meals</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={closeRatingModal}
          onSubmit={(rating, review) => handleRateMeal(ratingModal.meal, ratingModal.mealType, rating, review)}
          mealName={ratingModal.mealName}
          currentRating={mealRatings[`${currentMealPlanId}-${ratingModal.mealName}-${ratingModal.mealType}`]?.rating}
          currentReview={mealRatings[`${currentMealPlanId}-${ratingModal.mealName}-${ratingModal.mealType}`]?.review}
        />
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </DashboardLayout>
  )
} 