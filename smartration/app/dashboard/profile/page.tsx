"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LogOut, 
  Calendar, 
  DollarSign, 
  Users, 
  Heart, 
  ChefHat, 
  Utensils,
  AlertTriangle,
  Baby,
  ShoppingCart,
  Flame
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"

interface OnboardingData {
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

interface ProfileData {
  onboarding_data: OnboardingData
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfileData(data)
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (user) {
      fetchProfileData()
    }
  }, [user])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (loading || isLoadingProfile) {
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

  // Get user's name from metadata or email
  const fullName = user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.email?.split('@')[0] || 
                   'User'
  const firstName = fullName.split(' ')[0]
  const lastName = fullName.split(' ').slice(1).join(' ')

  const onboardingData = profileData?.onboarding_data

  const getSpiceLevelText = (level: number) => {
    switch (level) {
      case 1: return "Very Mild"
      case 2: return "Mild"
      case 3: return "Medium"
      case 4: return "Hot"
      case 5: return "Very Hot"
      default: return "Medium"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Info */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-xl font-semibold">{firstName[0]}</span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {firstName} {lastName}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Member since</span>
              </div>
              <p className="font-medium text-gray-900">
                {profileData ? formatDate(profileData.created_at) : 'Loading...'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Household size</span>
              </div>
              <p className="font-medium text-green-700">
                {onboardingData ? `${onboardingData.householdSize} people` : 'Loading...'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">Max daily budget</span>
              </div>
              <p className="font-medium text-blue-700">
                {onboardingData ? `$${onboardingData.maxSpending}` : 'Loading...'}
              </p>
            </div>
          </div>
        </Card>

        {/* Onboarding Data */}
        {onboardingData && (
          <div className="space-y-6">
            {/* Dietary Restrictions & Allergies */}
            <Card className="p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Dietary Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Allergies</h4>
                  {onboardingData.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.allergies.map((allergy) => (
                        <Badge key={allergy} variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No allergies specified</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Dietary Restrictions</h4>
                  {onboardingData.dietaryRestrictions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.dietaryRestrictions.map((restriction) => (
                        <Badge key={restriction} variant="outline" className="border-green-200 text-green-700">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No dietary restrictions</p>
                  )}
                </div>
              </div>

              {onboardingData.specialDietary && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Special Dietary Needs</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                    {onboardingData.specialDietary}
                  </p>
                </div>
              )}
            </Card>

            {/* Food Preferences */}
            <Card className="p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Food Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Food Preferences</h4>
                  {onboardingData.foodPreferences.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.foodPreferences.map((pref) => (
                        <Badge key={pref} variant="outline" className="border-blue-200 text-blue-700">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No specific food preferences</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cuisine Preferences</h4>
                  {onboardingData.cuisinePreferences.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.cuisinePreferences.map((cuisine) => (
                        <Badge key={cuisine} variant="outline" className="border-purple-200 text-purple-700">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No specific cuisine preferences</p>
                  )}
                </div>
              </div>

              {onboardingData.avoidIngredients && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Ingredients to Avoid</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                    {onboardingData.avoidIngredients}
                  </p>
                </div>
              )}
            </Card>

            {/* Household & Cooking Preferences */}
            <Card className="p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Household & Cooking</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Household Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Household size: {onboardingData.householdSize} people</span>
                    </div>
                    {onboardingData.hasChildren && (
                      <div className="flex items-center gap-2">
                        <Baby className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Children ages: {onboardingData.childrenAges}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cooking Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Spice tolerance: {getSpiceLevelText(onboardingData.spiceTolerance)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Shopping frequency: {onboardingData.shoppingFrequency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </DashboardLayout>
  )
} 