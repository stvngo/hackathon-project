import { NextRequest, NextResponse } from 'next/server'
import { hasCompletedOnboarding } from '@/app/actions'

export async function POST(request: NextRequest) {
  try {
    const completed = await hasCompletedOnboarding()
    
    return NextResponse.json({ 
      completed 
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json({ completed: false })
  }
} 