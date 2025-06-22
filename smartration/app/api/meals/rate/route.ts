import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mealPlanId, mealName, mealType, rating, review } = await request.json()

    if (!mealPlanId || !mealName || !mealType || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Verify that the meal plan ID exists in either meal_plans or weekly_meal_plans
    const { data: mealPlan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('id', mealPlanId)
      .single()

    const { data: weeklyMealPlan } = await supabase
      .from('weekly_meal_plans')
      .select('id')
      .eq('id', mealPlanId)
      .single()

    if (!mealPlan && !weeklyMealPlan) {
      return NextResponse.json({ error: 'Invalid meal plan ID' }, { status: 400 })
    }

    // Check if user already rated this meal
    const { data: existingRating } = await supabase
      .from('meal_ratings')
      .select('id, rating, review')
      .eq('user_id', user.id)
      .eq('meal_plan_id', mealPlanId)
      .eq('meal_name', mealName)
      .eq('meal_type', mealType)
      .single()

    let result
    if (existingRating) {
      // Update existing rating
      const { data: updatedRating, error } = await supabase
        .from('meal_ratings')
        .update({
          rating,
          review: review || null,
          rated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating meal rating:', error)
        return NextResponse.json({ error: 'Failed to update meal rating' }, { status: 500 })
      }

      result = updatedRating
    } else {
      // Create new rating
      const { data: newRating, error } = await supabase
        .from('meal_ratings')
        .insert({
          user_id: user.id,
          meal_plan_id: mealPlanId,
          meal_name: mealName,
          meal_type: mealType,
          rating,
          review: review || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating meal rating:', error)
        return NextResponse.json({ error: 'Failed to create meal rating' }, { status: 500 })
      }

      result = newRating
    }

    return NextResponse.json({ 
      success: true, 
      rating: result,
      message: existingRating ? 'Rating updated successfully' : 'Rating created successfully'
    })

  } catch (error) {
    console.error('❌ Error in rate meal API:', error)
    return NextResponse.json(
      { error: 'Failed to rate meal' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mealPlanId = searchParams.get('mealPlanId')
    const mealName = searchParams.get('mealName')
    const mealType = searchParams.get('mealType')

    if (!mealPlanId || !mealName || !mealType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get user's rating for this meal
    const { data: rating, error } = await supabase
      .from('meal_ratings')
      .select('rating, review, rated_at')
      .eq('user_id', user.id)
      .eq('meal_plan_id', mealPlanId)
      .eq('meal_name', mealName)
      .eq('meal_type', mealType)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching meal rating:', error)
      return NextResponse.json({ error: 'Failed to fetch meal rating' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      rating: rating || null
    })

  } catch (error) {
    console.error('❌ Error in get meal rating API:', error)
    return NextResponse.json(
      { error: 'Failed to get meal rating' }, 
      { status: 500 }
    )
  }
} 