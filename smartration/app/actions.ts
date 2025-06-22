"use server"

import { extractReceiptData } from "@/lib/vision-api"
import { generateMealPlan } from "@/lib/claude-ai"
import { createClient } from "@/lib/supabase-server"

// In a real implementation, these functions would interact with AI models
// For this MVP, we'll simulate the process with mock data

interface ReceiptItem {
  name: string
  price: number
  quantity?: number
}

interface ReceiptData {
  items: ReceiptItem[]
  total: number
  store?: string
  date?: string
}

interface MealItem {
  name: string
  ingredients: string[]
  nutritionalInfo: string
  cost: number
  recipe: string
}

interface DayPlan {
  day: string
  breakfast: MealItem
  lunch: MealItem
  dinner: MealItem
}

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

export async function processImages(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _fridgeImage: File | null,
  receiptImage: File
) {
  try {
    // Get the current user
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Convert the receipt image to base64
    const arrayBuffer = await receiptImage.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const imageBase64 = `data:${receiptImage.type};base64,${base64}`

    // Extract receipt data using Google Cloud Vision API
    const receiptData = await extractReceiptData(imageBase64)
    
    // Store the receipt data in Supabase
    const { data: receiptRecord, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        store_name: receiptData.store,
        total_amount: receiptData.total,
        receipt_date: receiptData.date,
        items: receiptData.items
      })
      .select()
      .single()

    if (receiptError) {
      console.error('Error storing receipt:', receiptError)
      // Continue without storing if there's an error
    }

    // Get user preferences from profile table - specifically onboarding_data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_data')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
    }

    // Prepare user preferences for Claude AI from onboarding_data
    const userPreferences = profile?.onboarding_data ? {
      dietaryRestrictions: profile.onboarding_data.dietaryRestrictions || [],
      allergies: profile.onboarding_data.allergies || [],
      householdSize: profile.onboarding_data.householdSize || 1,
      spiceTolerance: profile.onboarding_data.spiceTolerance || 3,
      maxSpending: profile.onboarding_data.maxSpending || 15,
      foodPreferences: profile.onboarding_data.foodPreferences || [],
      cuisinePreferences: profile.onboarding_data.cuisinePreferences || [],
      avoidIngredients: profile.onboarding_data.avoidIngredients || '',
      hasChildren: profile.onboarding_data.hasChildren || false,
      childrenAges: profile.onboarding_data.childrenAges || '',
      specialDietary: profile.onboarding_data.specialDietary || ''
    } : {}

    // Generate meal plan using Claude AI with user preferences
    console.log('🚀 Starting meal plan generation...')
    console.log('👤 User preferences for meal planning:', JSON.stringify(userPreferences, null, 2))
    
    const mealPlans = await generateMealPlan(receiptData, userPreferences)
    
    console.log('🎉 Meal plan generation completed!')
    console.log('📊 Generated', mealPlans.length, 'days of meal plans')
    console.log('🍽️ First day sample:', JSON.stringify(mealPlans[0], null, 2))

    // Store the generated meal plan in the existing meal_plans table
    if (mealPlans.length > 0) {
      console.log('💾 Storing meal plan in database...')
      const { error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          receipt_id: receiptRecord?.id,
          meal_plan: mealPlans, // Using the existing meal_plan JSONB field
          created_at: new Date().toISOString()
        })

      if (mealPlanError) {
        console.error('❌ Error storing meal plan:', mealPlanError)
        // Continue without storing if there's an error
      } else {
        console.log('✅ Meal plan stored successfully in database')
      }
    }
    
    // Return success with the data
    return { 
      success: true, 
      receiptData,
      receiptId: receiptRecord?.id,
      mealPlans
    }
  } catch (error) {
    console.error('Error processing receipt:', error)
    throw new Error('Failed to process receipt image')
  }
}

export async function saveOnboardingData(onboardingData: OnboardingData, userData: { email: string; fullName?: string }) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Create or update user profile with onboarding data
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: userData.fullName || user.user_metadata?.full_name || '',
        email: user.email,
        onboarding_data: onboardingData,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error saving profile:', profileError)
      throw new Error('Failed to save onboarding data')
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving onboarding data:', error)
    throw new Error('Failed to save onboarding data')
  }
}

export async function getMealPlan(): Promise<DayPlan[]> {
  // In a real implementation, this would generate a meal plan based on the processed receipt data
  // For this MVP, we'll return mock data

  // Simulate a delay to represent AI processing time
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Mock data for a 7-day meal plan
  const mockMealPlan: DayPlan[] = [
    {
      day: "Monday",
      breakfast: {
        name: "Veggie Omelette with Toast",
        ingredients: ["Eggs", "Bell peppers", "Onions", "Cheese", "Bread"],
        nutritionalInfo: "Protein: 18g, Carbs: 22g, Fat: 14g",
        cost: 2.15,
        recipe:
          "1. Whisk eggs in a bowl. 2. Sauté diced peppers and onions. 3. Pour eggs over vegetables and cook until set. 4. Sprinkle with cheese and fold. 5. Serve with toast.",
      },
      lunch: {
        name: "Tuna Salad Sandwich",
        ingredients: ["Canned tuna", "Mayonnaise", "Celery", "Bread", "Lettuce"],
        nutritionalInfo: "Protein: 22g, Carbs: 28g, Fat: 12g",
        cost: 3.4,
        recipe:
          "1. Mix tuna, mayo, and diced celery. 2. Spread on bread. 3. Add lettuce and top with second slice of bread. 4. Serve with any remaining vegetables on the side.",
      },
      dinner: {
        name: "Pasta with Tomato Sauce and Ground Turkey",
        ingredients: ["Pasta", "Canned tomatoes", "Ground turkey", "Onion", "Garlic", "Italian herbs"],
        nutritionalInfo: "Protein: 28g, Carbs: 45g, Fat: 10g",
        cost: 4.25,
        recipe:
          "1. Brown ground turkey in a pan. 2. Add diced onions and garlic, sauté until soft. 3. Add canned tomatoes and herbs, simmer for 15 minutes. 4. Cook pasta according to package directions. 5. Combine pasta and sauce.",
      },
    },
    // Additional days would be added here in a full implementation
  ]

  return mockMealPlan
}

export async function getUserReceipts() {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data: receipts, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return receipts
  } catch (error) {
    console.error('Error fetching user receipts:', error)
    return []
  }
}

export async function hasCompletedOnboarding() {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return false
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (error) {
      return false
    }

    return profile?.onboarding_completed === true
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

export async function getUserMealPlans() {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data: mealPlans, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        receipts (
          store_name,
          total_amount,
          receipt_date,
          items
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return mealPlans
  } catch (error) {
    console.error('Error fetching user meal plans:', error)
    return []
  }
} 