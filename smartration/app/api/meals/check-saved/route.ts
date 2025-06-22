import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    // Check if meal is saved
    const { data: savedMeal, error } = await supabase
      .from('saved_meals')
      .select('id, saved_at')
      .eq('user_id', user.id)
      .eq('meal_plan_id', mealPlanId)
      .eq('meal_name', mealName)
      .eq('meal_type', mealType)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking saved meal:', error)
      return NextResponse.json({ error: 'Failed to check saved meal' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      isSaved: !!savedMeal,
      savedMeal: savedMeal || null
    })

  } catch (error) {
    console.error('❌ Error in check saved meal API:', error)
    return NextResponse.json(
      { error: 'Failed to check saved meal' }, 
      { status: 500 }
    )
  }
} 