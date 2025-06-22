"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!loading) {
      // If user is logged in and verified, redirect to email verified page
      if (user && user.email_confirmed_at) {
        router.push('/email-verified')
        return
      }

      // If user is logged in but not verified, set their email
      if (user) {
        setEmail(user.email || '')
      } else {
        // If no user is logged in, try to get email from localStorage
        const onboardingUser = localStorage.getItem('onboarding_user')
        if (onboardingUser) {
          const userData = JSON.parse(onboardingUser)
          setEmail(userData.email || '')
        } else {
          // If no user data in localStorage, redirect to signup
          router.push('/signup')
        }
      }
    }
  }, [user, loading, router])

  const handleResendEmail = async () => {
    try {
      // Resend verification email
      const { error } = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(res => res.json())

      if (error) {
        console.error('Error resending email:', error)
      }
    } catch (error) {
      console.error('Error resending email:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <Mail className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to your email address
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Please check your email at <strong>{email}</strong> and click the verification link to continue.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                If you don't see the email, check your spam folder.
              </p>
              <p className="text-sm text-gray-600 font-medium">
                After clicking the verification link, come back here and sign in to your account.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
              >
                Resend verification email
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already verified?{' '}
                <Link href="/login" className="font-medium text-green-600 hover:text-green-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 