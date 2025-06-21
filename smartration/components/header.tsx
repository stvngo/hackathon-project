import Link from "next/link"
import { Utensils } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-green-600" />
          <span className="text-xl font-bold">SmartRation</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium">
            Contact
          </Link>
          <Link href="/login" className="text-sm font-medium">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  )
} 