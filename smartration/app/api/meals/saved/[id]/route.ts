import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 })
    }

    // Delete the saved meal (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('saved_meals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting saved meal:', error)
      return NextResponse.json({ error: 'Failed to delete saved meal' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Saved meal deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error in delete saved meal API:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved meal' }, 
      { status: 500 }
    )
  }
} 