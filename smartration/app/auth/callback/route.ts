import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // Don't exchange the code for a session - just redirect to confirmation page
    // The code will be automatically consumed by Supabase when the user clicks the link
    return NextResponse.redirect(`${origin}/email-verified`)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/verify-email`)
} 