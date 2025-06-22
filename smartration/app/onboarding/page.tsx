"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Users, Heart, ChefHat, DollarSign, Utensils } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { saveOnboardingData } from "@/app/actions"

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

interface UserData {
  email: string
  firstName?: string
  fullName?: string
}

const STEPS = [
  { id: 1, title: "Dietary Restrictions", icon: Heart },
  { id: 2, title: "Household Info", icon: Users },
  { id: 3, title: "Food Preferences", icon: ChefHat },
  { id: 4, title: "Spice & Limits", icon: Utensils },
  { id: 5, title: "Budget Settings", icon: DollarSign },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  const [formData, setFormData] = useState<OnboardingData>({
    allergies: [],
    dietaryRestrictions: [],
    householdSize: 1,
    hasChildren: false,
    childrenAges: "",
    specialDietary: "",
    foodPreferences: [],
    cuisinePreferences: [],
    spiceTolerance: 3,
    avoidIngredients: "",
    maxSpending: 50,
    shoppingFrequency: "weekly",
  })

  useEffect(() => {
    // Check if user is authenticated
    if (!loading) {
      if (!user) {
        // If no user, redirect to login
        router.push("/login")
        return
      }

      // Check if user has verified their email
      if (!user.email_confirmed_at) {
        // If email not verified, redirect to email verification
        router.push("/verify-email")
        return
      }

      // User is authenticated and verified, get their data
      setUserData({
        email: user.email || '',
        firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '',
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || ''
      })

      // Check if there's onboarding data from signup (for users who signed up before email verification)
      const onboardingUser = localStorage.getItem("onboarding_user")
      if (onboardingUser) {
        const storedData = JSON.parse(onboardingUser)
        setUserData(prev => ({
          ...prev,
          ...storedData
        }))
      }
    }
  }, [user, loading, router])

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      // Save onboarding data using server action
      if (user && userData) {
        await saveOnboardingData(formData, {
          email: userData.email,
          fullName: userData.fullName
        })
      }

      // Clear onboarding data from localStorage
      localStorage.removeItem('onboarding_user')

      // Redirect to upload page
      router.push("/upload")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof OnboardingData, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
  }

  const progress = (currentStep / STEPS.length) * 100

  if (loading || !userData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {userData.firstName || userData.email}!</h1>
          <p className="text-gray-600">Let&apos;s personalize your meal planning experience</p>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        <Card className="p-8">
          {/* Step 1: Dietary Restrictions */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Dietary Restrictions & Allergies</h2>
                <p className="text-gray-600">Help us keep you safe and comfortable with your meal choices</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Do you have any food allergies?</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Nuts", "Dairy", "Eggs", "Shellfish", "Fish", "Soy", "Wheat/Gluten", "Sesame"].map((allergy) => (
                      <div key={allergy} className="flex items-center space-x-2">
                        <Checkbox
                          id={allergy}
                          checked={formData.allergies.includes(allergy)}
                          onCheckedChange={() =>
                            updateFormData("allergies", toggleArrayItem(formData.allergies, allergy))
                          }
                        />
                        <Label htmlFor={allergy}>{allergy}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Any dietary preferences or restrictions?</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Vegetarian", "Vegan", "Pescatarian", "Keto", "Paleo", "Low-carb", "Halal", "Kosher"].map(
                      (diet) => (
                        <div key={diet} className="flex items-center space-x-2">
                          <Checkbox
                            id={diet}
                            checked={formData.dietaryRestrictions.includes(diet)}
                            onCheckedChange={() =>
                              updateFormData("dietaryRestrictions", toggleArrayItem(formData.dietaryRestrictions, diet))
                            }
                          />
                          <Label htmlFor={diet}>{diet}</Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Household Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Tell Us About Your Household</h2>
                <p className="text-gray-600">This helps us plan the right portion sizes and meal types</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">How many people are you cooking for?</Label>
                  <div className="mt-3">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.householdSize}
                      onChange={(e) => updateFormData("householdSize", Number.parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Are you cooking for children?</Label>
                  <RadioGroup
                    value={formData.hasChildren ? "yes" : "no"}
                    onValueChange={(value) => updateFormData("hasChildren", value === "yes")}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="children-yes" />
                      <Label htmlFor="children-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="children-no" />
                      <Label htmlFor="children-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.hasChildren && (
                  <div>
                    <Label htmlFor="childrenAges" className="text-base font-medium">
                      What are the ages of the children?
                    </Label>
                    <p className="text-sm text-gray-500 mb-2">
                      This helps us suggest kid-friendly meals and appropriate portions
                    </p>
                    <Input
                      id="childrenAges"
                      value={formData.childrenAges}
                      onChange={(e) => updateFormData("childrenAges", e.target.value)}
                      placeholder="e.g., 3, 7, 12 years old"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="specialDietary" className="text-base font-medium">
                    Does anyone have special dietary needs we should know about?
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">Medical conditions, texture preferences, etc.</p>
                  <Textarea
                    id="specialDietary"
                    value={formData.specialDietary}
                    onChange={(e) => updateFormData("specialDietary", e.target.value)}
                    placeholder="Optional: Tell us about any special considerations..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Food Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <ChefHat className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">What Do You Love to Eat?</h2>
                <p className="text-gray-600">
                  This helps us recommend groceries and create meals you&apos;ll actually enjoy
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">What types of food do you enjoy?</Label>
                  <p className="text-sm text-gray-500 mb-3">Select your favorites</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Pasta",
                      "Rice dishes",
                      "Sandwiches",
                      "Salads",
                      "Soups",
                      "Stir-fries",
                      "Casseroles",
                      "Grilled foods",
                    ].map((food) => (
                      <div key={food} className="flex items-center space-x-2">
                        <Checkbox
                          id={food}
                          checked={formData.foodPreferences.includes(food)}
                          onCheckedChange={() =>
                            updateFormData("foodPreferences", toggleArrayItem(formData.foodPreferences, food))
                          }
                        />
                        <Label htmlFor={food}>{food}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">What cuisines do you enjoy?</Label>
                  <p className="text-sm text-gray-500 mb-3">This helps us suggest diverse meal options</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "American",
                      "Italian",
                      "Mexican",
                      "Asian",
                      "Mediterranean",
                      "Indian",
                      "Middle Eastern",
                      "Latin American",
                    ].map((cuisine) => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox
                          id={cuisine}
                          checked={formData.cuisinePreferences.includes(cuisine)}
                          onCheckedChange={() =>
                            updateFormData("cuisinePreferences", toggleArrayItem(formData.cuisinePreferences, cuisine))
                          }
                        />
                        <Label htmlFor={cuisine}>{cuisine}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Spice & Limits */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Utensils className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Spice Level & Food Limits</h2>
                <p className="text-gray-600">Let us know your spice tolerance and any ingredients to avoid</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">How much spice can you handle?</Label>
                  <p className="text-sm text-gray-500 mb-4">1 = Very mild, 5 = Bring on the heat!</p>
                  <div className="px-4">
                    <Slider
                      value={[formData.spiceTolerance]}
                      onValueChange={(value) => updateFormData("spiceTolerance", value[0])}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Very Mild</span>
                      <span>Mild</span>
                      <span>Medium</span>
                      <span>Hot</span>
                      <span>Very Hot</span>
                    </div>
                    <p className="text-center mt-2 font-medium">Current level: {formData.spiceTolerance}/5</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="avoidIngredients" className="text-base font-medium">
                    Are there any specific ingredients you want to avoid?
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Besides allergies - maybe you just don&apos;t like certain foods
                  </p>
                  <Textarea
                    id="avoidIngredients"
                    value={formData.avoidIngredients}
                    onChange={(e) => updateFormData("avoidIngredients", e.target.value)}
                    placeholder="e.g., mushrooms, cilantro, liver, very fishy seafood..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Budget Settings */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Budget & Shopping Preferences</h2>
                <p className="text-gray-600">Help us recommend groceries that fit your budget</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">
                    When you run out of food, what&apos;s your maximum spending limit for restocking?
                  </Label>
                  <p className="text-sm text-gray-500 mb-4">
                    This helps us prioritize essential items and suggest budget-friendly alternatives
                  </p>
                  <div className="space-y-4">
                    <div className="px-4">
                      <Slider
                        value={[formData.maxSpending]}
                        onValueChange={(value) => updateFormData("maxSpending", value[0])}
                        max={200}
                        min={20}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>$20</span>
                        <span>$50</span>
                        <span>$100</span>
                        <span>$150</span>
                        <span>$200+</span>
                      </div>
                      <p className="text-center mt-2 font-medium text-lg">${formData.maxSpending}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">How often do you typically shop for groceries?</Label>
                  <RadioGroup
                    value={formData.shoppingFrequency}
                    onValueChange={(value) => updateFormData("shoppingFrequency", value)}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Daily (as needed)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="biweekly" id="biweekly" />
                      <Label htmlFor="biweekly">Every 2 weeks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center"
            >
              {isLoading ? (
                "Setting up your account..."
              ) : currentStep === STEPS.length ? (
                "Complete Setup"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
