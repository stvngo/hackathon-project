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

    const { mealPlanId, mealName, mealType, mealData } = await request.json()

    if (!mealPlanId || !mealName || !mealType || !mealData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if meal is already saved
    const { data: existingSave } = await supabase
      .from('saved_meals')
      .select('id')
      .eq('user_id', user.id)
      .eq('meal_plan_id', mealPlanId)
      .eq('meal_name', mealName)
      .eq('meal_type', mealType)
      .single()

    if (existingSave) {
      return NextResponse.json({ error: 'Meal already saved' }, { status: 409 })
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

    // Save the meal
    const { data: savedMeal, error } = await supabase
      .from('saved_meals')
      .insert({
        user_id: user.id,
        meal_plan_id: mealPlanId,
        meal_name: mealName,
        meal_type: mealType,
        meal_data: mealData
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving meal:', error)
      return NextResponse.json({ error: 'Failed to save meal' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      savedMeal,
      message: 'Meal saved successfully'
    })

  } catch (error) {
    console.error('❌ Error in save meal API:', error)
    return NextResponse.json(
      { error: 'Failed to save meal' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mealPlanId, mealName, mealType } = await request.json()

    if (!mealPlanId || !mealName || !mealType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Delete the saved meal
    const { error } = await supabase
      .from('saved_meals')
      .delete()
      .eq('user_id', user.id)
      .eq('meal_plan_id', mealPlanId)
      .eq('meal_name', mealName)
      .eq('meal_type', mealType)

    if (error) {
      console.error('Error deleting saved meal:', error)
      return NextResponse.json({ error: 'Failed to delete saved meal' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Meal removed from saved meals'
    })

  } catch (error) {
    console.error('❌ Error in delete saved meal API:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved meal' }, 
      { status: 500 }
    )
  }
} 