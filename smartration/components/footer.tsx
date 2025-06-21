import { Utensils } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 py-10 md:flex-row md:gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-green-600" />
          <span className="text-lg font-semibold">SmartRation</span>
        </div>
        <p className="text-sm text-gray-500 md:ml-auto">© 2025 SmartRation. UC Berkeley AI Hackathon Project.</p>
      </div>
    </footer>
  )
} 