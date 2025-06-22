import { NextRequest, NextResponse } from 'next/server'
import { generateFoodGPTResponse } from '@/lib/claude-ai'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationHistory = [] } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Generate response using Claude AI
    const response = await generateFoodGPTResponse(message, conversationHistory)

    return NextResponse.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in FoodGPT API:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' }, 
      { status: 500 }
    )
  }
} 