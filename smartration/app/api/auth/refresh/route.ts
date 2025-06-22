import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      user: data.user,
      session: data.session 
    })
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 