'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Utensils, User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {user ? (
          <div className="flex items-center gap-3">
            <Utensils className="h-7 w-7 text-green-600" />
            <span className="text-2xl font-bold">SmartRation</span>
          </div>
        ) : (
        <Link href="/" className="flex items-center gap-3">
          <Utensils className="h-7 w-7 text-green-600" />
          <span className="text-2xl font-bold">SmartRation</span>
        </Link>
        )}
        
        <nav className="flex gap-4 sm:gap-6 items-center">
          {!user && (
            <>
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium">
            Contact
          </Link>
            </>
          )}
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center gap-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-medium bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
} 