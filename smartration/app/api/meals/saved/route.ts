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

    // Get all saved meals for the user
    const { data: savedMeals, error } = await supabase
      .from('saved_meals')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved meals:', error)
      return NextResponse.json({ error: 'Failed to fetch saved meals' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      savedMeals: savedMeals || []
    })

  } catch (error) {
    console.error('❌ Error in get saved meals API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved meals' }, 
      { status: 500 }
    )
  }
} 