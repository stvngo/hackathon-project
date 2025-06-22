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
    console.log('📸 Starting receipt processing...')
    console.log('📄 Receipt file:', receiptImage.name, 'Size:', receiptImage.size, 'bytes')
    
    // Get the current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('👤 User authenticated:', user.id)

    // Convert the receipt image to base64
    console.log('🔄 Converting receipt image to base64...')
    const arrayBuffer = await receiptImage.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const imageBase64 = `data:${receiptImage.type};base64,${base64}`
    console.log('✅ Image converted to base64, length:', imageBase64.length)

    // Extract receipt data using Google Cloud Vision API
    console.log('🔍 Calling Google Vision API to extract receipt data...')
    const receiptData = await extractReceiptData(imageBase64)
    console.log('✅ Google Vision API response received')
    console.log('📋 Extracted receipt data:', JSON.stringify(receiptData, null, 2))
    
    // Store the receipt data in Supabase
    console.log('💾 Storing receipt data in database...')
    const { data: receiptRecord, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        store_name: receiptData.store || 'Unknown Store',
        total_amount: receiptData.total || 0,
        receipt_date: receiptData.date || new Date().toISOString().split('T')[0],
        items: receiptData.items || []
      })
      .select()
      .single()

    if (receiptError) {
      console.error('❌ Error storing receipt:', receiptError)
      // Continue without storing if there's an error
    } else {
      console.log('✅ Receipt stored in database with ID:', receiptRecord.id)
    }
    
    // Get user preferences from profile table - specifically onboarding_data
    console.log('👤 Fetching user preferences...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_data')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
    } else {
      console.log('✅ User preferences loaded')
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
    console.log('🤖 Generating meal plan with Claude AI...')
    const mealPlans = await generateMealPlan(receiptData, userPreferences)
    console.log('✅ Meal plan generation completed')

    // Get or create weekly meal plan and add new meals
    console.log('📅 Managing weekly meal plan...')
    const weeklyPlan = await getOrCreateWeeklyMealPlan()
    const updatedMealPlans = await addMealsToWeeklyPlan(mealPlans, weeklyPlan.week_start)
    console.log('✅ Weekly meal plan updated with', mealPlans.length, 'new meals')

    // Store the generated meal plan in the existing meal_plans table (for backward compatibility)
    let mealPlanId: string | null = null
    if (mealPlans.length > 0) {
      console.log('💾 Storing meal plan in database...')
      const { data: mealPlanRecord, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          receipt_id: receiptRecord?.id,
          meal_plan: mealPlans, // Using the existing meal_plan JSONB field
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (mealPlanError) {
        console.error('❌ Error storing meal plan:', mealPlanError)
        // Continue without storing if there's an error
      } else {
        console.log('✅ Meal plan stored successfully in database')
        mealPlanId = mealPlanRecord.id
      }
    }
    
    // Return success with the data
    console.log('🎉 Receipt processing completed successfully!')
    return { 
      success: true, 
      receiptData,
      receiptId: receiptRecord?.id,
      mealPlans: updatedMealPlans, // Return the full weekly meal plan
      mealPlanId: weeklyPlan.id // Return the weekly plan ID
    }
  } catch (error) {
    console.error('❌ Error processing receipt:', error)
    throw new Error('Failed to process receipt image')
  }
}

export async function saveOnboardingData(onboardingData: OnboardingData, userData: { email: string; fullName?: string }) {
  try {
    const supabase = await createClient()
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
    const supabase = await createClient()
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
    const supabase = await createClient()
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
    const supabase = await createClient()
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

    console.log('🗄️ Raw meal plans from database:', mealPlans)
    
    // Transform the data to match the expected format
    const transformedMealPlans = mealPlans.map(record => {
      console.log('📋 Meal plan record:', record)
      console.log('🍽️ Meal plan data:', record.meal_plan)
      
      // If meal_plan is an array, return it directly
      if (Array.isArray(record.meal_plan)) {
        return record.meal_plan
      }
      
      // If it's a single object, wrap it in an array
      if (record.meal_plan && typeof record.meal_plan === 'object') {
        return [record.meal_plan]
      }
      
      return []
    }).flat()

    console.log('🔄 Transformed meal plans:', transformedMealPlans)
    return transformedMealPlans
  } catch (error) {
    console.error('Error fetching user meal plans:', error)
    return []
  }
}

export async function getOrCreateWeeklyMealPlan() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get the current week's start date (Monday)
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + 1) // Set to Monday
    monday.setHours(0, 0, 0, 0)
    
    const weekStart = monday.toISOString().split('T')[0]

    // Check if we have a weekly meal plan for this week
    const { data: existingPlan, error: fetchError } = await supabase
      .from('weekly_meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw fetchError
    }

    if (existingPlan) {
      console.log('📅 Found existing weekly meal plan for week starting:', weekStart)
      return existingPlan
    }

    // Create a new weekly meal plan
    console.log('📅 Creating new weekly meal plan for week starting:', weekStart)
    const { data: newPlan, error: createError } = await supabase
      .from('weekly_meal_plans')
      .insert({
        user_id: user.id,
        week_start: weekStart,
        meal_plan: [], // Start with empty meal plan
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return newPlan
  } catch (error) {
    console.error('Error getting or creating weekly meal plan:', error)
    throw error
  }
}

export async function addMealsToWeeklyPlan(newMeals: any[], weekStart: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get current weekly meal plan
    const { data: currentPlan, error: fetchError } = await supabase
      .from('weekly_meal_plans')
      .select('meal_plan')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Get existing meal plans and organize them
    const existingMealPlans = currentPlan.meal_plan || []
    
    // Count how many meal plans we already have
    const existingMealPlanCount = existingMealPlans.length
    
    console.log('📅 Adding meal plan to weekly plan:')
    console.log('- Existing meal plans count:', existingMealPlanCount)
    console.log('- New meals count:', newMeals.length)
    console.log('- Existing meal plans:', existingMealPlans.map((mealPlan: any, index: number) => ({ 
      mealPlanNumber: index + 1, 
      days: Array.isArray(mealPlan) ? mealPlan.length : 0 
    })))
    
    // Organize new meals as a complete meal plan with proper day labels
    const organizedNewMealPlan = newMeals.map((mealPlan, index) => {
      const dayNumber = index + 1
      const organizedMeal = {
        ...mealPlan,
        day: `Day ${dayNumber}`
      }
      console.log(`- Organizing meal ${index + 1} as Day ${dayNumber}:`, organizedMeal.day)
      return organizedMeal
    })

    // Add the new meal plan to the existing meal plans
    const updatedMealPlans = [...existingMealPlans, organizedNewMealPlan]
    
    console.log('📊 Final meal plans structure:', updatedMealPlans.map((mealPlan: any, index: number) => ({ 
      mealPlanNumber: index + 1, 
      days: Array.isArray(mealPlan) ? mealPlan.length : 0,
      dayLabels: Array.isArray(mealPlan) ? mealPlan.map((day: any) => day.day) : []
    })))

    // Update the weekly meal plan
    const { error: updateError } = await supabase
      .from('weekly_meal_plans')
      .update({
        meal_plan: updatedMealPlans,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('week_start', weekStart)

    if (updateError) {
      throw updateError
    }

    console.log('✅ Added Meal Plan', (existingMealPlanCount + 1), 'with', newMeals.length, 'days to weekly plan')
    return updatedMealPlans
  } catch (error) {
    console.error('Error adding meals to weekly plan:', error)
    throw error
  }
}

export async function getCurrentWeeklyMealPlan() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get the current week's start date (Monday)
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + 1) // Set to Monday
    monday.setHours(0, 0, 0, 0)
    
    const weekStart = monday.toISOString().split('T')[0]

    // Get the weekly meal plan for this week
    const { data: weeklyPlan, error } = await supabase
      .from('weekly_meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    if (!weeklyPlan) {
      console.log('📅 No weekly meal plan found for week starting:', weekStart)
      return { id: null, meal_plan: [], week_start: weekStart }
    }

    console.log('📅 Found weekly meal plan with', weeklyPlan.meal_plan?.length || 0, 'meals')
    return weeklyPlan
  } catch (error) {
    console.error('Error getting current weekly meal plan:', error)
    return { id: null, meal_plan: [], week_start: null }
  }
} 