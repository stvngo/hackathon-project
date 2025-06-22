import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { MealPlanningService } from '../../lib/meal-planning'
import { AnthropicClient } from '../../lib/anthropicClient'
import type { MealPlanningRequest, MealPlanningResponse } from '../../types/meal-planning.types'

export async function POST(request: NextRequest) {
  try {
    const body: MealPlanningRequest = await request.json()
    const { userId, receiptId, daysToPlan = 7, preferences } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Initialize services
    const mealPlanningService = new MealPlanningService()
    
    // Get Anthropic API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicApiKey) {
      return NextResponse.json(
        { success: false, error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const anthropicClient = new AnthropicClient({ apiKey: anthropicApiKey })

    // Fetch user data from Supabase
    const userProfile = await mealPlanningService.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    const receipts = await mealPlanningService.getUserReceipts(userId)
    if (receipts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No receipts found. Please upload some receipts first.' },
        { status: 400 }
      )
    }

    // Prepare context for Claude
    const context = mealPlanningService.prepareClaudeContext(userProfile, receipts)
    
    // Add user preferences to context
    const preferencesContext = preferences ? `
Additional Preferences:
- Cuisine types: ${preferences.cuisine?.join(', ') || 'Any'}
- Difficulty level: ${preferences.difficulty || 'Any'}
- Max prep time: ${preferences.maxPrepTime || 'No limit'} minutes
- Max cook time: ${preferences.maxCookTime || 'No limit'} minutes
` : ''

    const fullContext = context + preferencesContext + `

Please respond with a JSON object in this exact format:
{
  "days": [
    {
      "day": 1,
      "date": "2024-01-01",
      "meals": {
        "breakfast": {
          "name": "Meal Name",
          "description": "Brief description",
          "ingredients": [
            {
              "name": "ingredient name",
              "amount": 1,
              "unit": "cup",
              "available": true
            }
          ],
          "instructions": ["Step 1", "Step 2"],
          "prepTime": 10,
          "cookTime": 15,
          "servings": 2,
          "calories": 300,
          "nutrition": {
            "protein": 15,
            "carbs": 30,
            "fat": 10,
            "fiber": 5
          }
        },
        "lunch": { /* similar structure */ },
        "dinner": { /* similar structure */ }
      },
      "totalCalories": 1800,
      "ingredientsUsed": ["ingredient1", "ingredient2"]
    }
  ],
  "summary": {
    "totalMeals": 21,
    "estimatedCalories": 12600,
    "estimatedCost": 45.50,
    "sustainabilityScore": 8.5
  },
  "recommendations": [
    "Use leftover vegetables in tomorrow's soup",
    "Freeze unused portions for later use"
  ]
}
`

    // Call Claude API
    const claudeResponse = await anthropicClient.createMessage({
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        {
          role: 'system',
          content: 'You are a sustainable meal planning expert. Create detailed, practical meal plans that minimize food waste and use available ingredients efficiently.'
        },
        {
          role: 'user',
          content: fullContext
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })

    // Parse Claude's response
    const responseContent = claudeResponse.content[0]?.text
    if (!responseContent) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate meal plan' },
        { status: 500 }
      )
    }

    // Extract JSON from Claude's response
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid response format from Claude' },
        { status: 500 }
      )
    }

    const mealPlanData = JSON.parse(jsonMatch[0])

    // Save meal plan to database
    const latestReceiptId = receiptId || receipts[0].id
    const saved = await mealPlanningService.saveMealPlan(userId, latestReceiptId, mealPlanData)
    
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save meal plan' },
        { status: 500 }
      )
    }

    const response: MealPlanningResponse = {
      success: true,
      mealPlan: {
        id: '', // Will be set by database
        user_id: userId,
        receipt_id: latestReceiptId,
        meal_plan: mealPlanData,
        created_at: new Date().toISOString()
      },
      context: fullContext
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Meal planning error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const mealPlanningService = new MealPlanningService()
    const previousMealPlans = await mealPlanningService.getPreviousMealPlans(userId)

    return NextResponse.json({
      success: true,
      mealPlans: previousMealPlans
    })

  } catch (error) {
    console.error('Error fetching meal plans:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 