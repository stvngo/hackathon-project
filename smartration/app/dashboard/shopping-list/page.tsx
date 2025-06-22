"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  Users, 
  ChefHat,
  RefreshCw,
  Download,
  Plus,
  Minus,
  Target,
  AlertCircle,
  Sparkles,
  Leaf,
  TrendingUp
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"

interface ShoppingItem {
  id: string
  name: string
  category: string
  estimatedPrice: number
  quantity: number
  unit: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
}

interface ShoppingList {
  id: string
  name: string
  items: ShoppingItem[]
  totalCost: number
  estimatedMeals: number
  daysOfFood: number
  createdAt: string
  metadata?: {
    generatedBy: string
    timestamp: string
  }
}

interface UserPreferences {
  allergies: string[]
  dietaryRestrictions: string[]
  householdSize: number
  hasChildren: boolean
  childrenAges: string
  specialDietary: string
  foodPreferences: string[]
  cuisinePreferences: string[]
  spiceTolerance: number
  avoidIngredients: string
  maxSpending: number
  shoppingFrequency: string
}

export default function ShoppingListPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState(50)
  const [daysToPlan, setDaysToPlan] = useState(7)
  const [generatedList, setGeneratedList] = useState<ShoppingList | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'proteins', 'vegetables', 'grains', 'dairy', 'pantry'
  ])

  const categories = [
    { id: 'proteins', name: 'Proteins', icon: '🥩', color: 'bg-red-50 border-red-200' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬', color: 'bg-green-50 border-green-200' },
    { id: 'grains', name: 'Grains & Bread', icon: '🍞', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', color: 'bg-blue-50 border-blue-200' },
    { id: 'pantry', name: 'Pantry Items', icon: '🥫', color: 'bg-purple-50 border-purple-200' },
    { id: 'fruits', name: 'Fruits', icon: '🍎', color: 'bg-pink-50 border-pink-200' },
    { id: 'snacks', name: 'Snacks', icon: '🍿', color: 'bg-orange-50 border-orange-200' },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setUserPreferences(data.onboarding_data)
          setBudget(data.onboarding_data.maxSpending || 50)
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserPreferences()
    }
  }, [user])

  const generateShoppingList = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/shopping-list/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget,
          daysToPlan,
          categories: selectedCategories,
          preferences: userPreferences
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedList(data)
      } else {
        console.error('Failed to generate shopping list')
      }
    } catch (error) {
      console.error('Error generating shopping list:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (!generatedList) return
    
    setGeneratedList(prev => {
      if (!prev) return prev
      
      const updatedItems = prev.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
      
      const totalCost = updatedItems.reduce((sum, item) => 
        sum + (item.estimatedPrice * item.quantity), 0
      )
      
      return {
        ...prev,
        items: updatedItems,
        totalCost
      }
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const exportShoppingList = () => {
    if (!generatedList) return

    const listData = {
      name: generatedList.name,
      generatedBy: generatedList.metadata?.generatedBy || 'Unknown',
      totalCost: generatedList.totalCost,
      estimatedMeals: generatedList.estimatedMeals,
      daysOfFood: generatedList.daysOfFood,
      items: generatedList.items.map(item => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        price: item.estimatedPrice,
        totalPrice: item.estimatedPrice * item.quantity,
        priority: item.priority,
        notes: item.notes
      }))
    }

    const csvContent = [
      ['Item', 'Category', 'Quantity', 'Unit', 'Price', 'Total', 'Priority', 'Notes'],
      ...listData.items.map(item => [
        item.name,
        item.category,
        item.quantity,
        item.unit,
        `$${item.price.toFixed(2)}`,
        `$${item.totalPrice.toFixed(2)}`,
        item.priority,
        item.notes || ''
      ]),
      ['', '', '', '', '', '', '', ''],
      ['Total Cost:', '', '', '', '', `$${listData.totalCost.toFixed(2)}`, '', ''],
      ['Generated by:', listData.generatedBy, '', '', '', '', '', ''],
      ['Date:', new Date().toLocaleDateString(), '', '', '', '', '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedList.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-none mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 shadow-xl text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI-Powered Shopping List</h1>
                <p className="text-blue-100 text-lg">Claude AI generates sustainable, budget-friendly ingredient lists</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-blue-100">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">Powered by Claude AI</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Household</span>
              </div>
              <p className="text-2xl font-bold">{userPreferences?.householdSize || 1} person</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <p className="text-2xl font-bold">${budget}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Days</span>
              </div>
              <p className="text-2xl font-bold">{daysToPlan}</p>
            </div>
          </div>
        </div>

        {!generatedList ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enhanced Settings Panel */}
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Shopping Settings</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="budget" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Budget: ${budget}
                  </Label>
                  <Input
                    id="budget"
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>$20</span>
                    <span>$200</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="days" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Days to Plan: {daysToPlan}
                  </Label>
                  <Input
                    id="days"
                    type="range"
                    min="3"
                    max="14"
                    step="1"
                    value={daysToPlan}
                    onChange={(e) => setDaysToPlan(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>3 days</span>
                    <span>14 days</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                    Food Categories
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {categories.map((category) => (
                      <div 
                        key={category.id} 
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          selectedCategories.includes(category.id)
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={category.id} className="text-sm flex items-center gap-3 cursor-pointer flex-1">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={generateShoppingList}
                  disabled={isGenerating || selectedCategories.length === 0}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      Claude AI is generating your list...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-3" />
                      Generate Shopping List
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Enhanced User Preferences Summary */}
            {userPreferences && (
              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Preferences</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Household: {userPreferences.householdSize} people
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Max daily budget: ${userPreferences.maxSpending}
                    </span>
                  </div>

                  {userPreferences.dietaryRestrictions && userPreferences.dietaryRestrictions.length > 0 && (
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Dietary Restrictions</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userPreferences.dietaryRestrictions.map((restriction) => (
                          <Badge key={restriction} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {userPreferences.foodPreferences && userPreferences.foodPreferences.length > 0 && (
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <ChefHat className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Food Preferences</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userPreferences.foodPreferences.map((pref) => (
                          <Badge key={pref} variant="outline" className="text-xs border-green-200 text-green-700">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {userPreferences.allergies.length > 0 && (
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Allergies</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userPreferences.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Enhanced Shopping List Display */
          <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{generatedList.name}</h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <span>{generatedList.estimatedMeals} meals</span>
                  <span>•</span>
                  <span>{generatedList.daysOfFood} days of food</span>
                  {generatedList.metadata?.generatedBy === 'claude-ai' && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <Sparkles className="h-4 w-4" />
                        AI Generated
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  ${generatedList.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {((generatedList.totalCost / budget) * 100).toFixed(0)}% of budget
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(
                generatedList.items.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = []
                  acc[item.category].push(item)
                  return acc
                }, {} as Record<string, ShoppingItem[]>)
              ).map(([category, items]) => {
                const categoryInfo = categories.find(c => c.id === category)
                return (
                  <div key={category} className={`border-2 rounded-xl p-6 ${categoryInfo?.color || 'bg-gray-50 border-gray-200'}`}>
                    <h4 className="font-bold text-gray-900 mb-4 capitalize flex items-center gap-2">
                      <span className="text-2xl">{categoryInfo?.icon}</span>
                      {category.replace('-', ' ')}
                    </h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                          <div className="flex items-center gap-4">
                            <span className="text-xl">{getPriorityIcon(item.priority)}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                ${item.estimatedPrice.toFixed(2)} per {item.unit}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 text-lg">
                                ${(item.estimatedPrice * item.quantity).toFixed(2)}
                              </div>
                              <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <Button 
                onClick={exportShoppingList} 
                variant="outline" 
                className="flex-1 h-12 text-lg font-semibold border-2 hover:bg-gray-50"
              >
                <Download className="h-5 w-5 mr-3" />
                Export List
              </Button>
              <Button 
                onClick={() => setGeneratedList(null)} 
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className="h-5 w-5 mr-3" />
                Generate New List
              </Button>
            </div>
          </Card>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </DashboardLayout>
  )
} 