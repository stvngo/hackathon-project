import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Brain, HeartHandshake, Lightbulb, Target } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">About SmartRation</h1>

      <div className="max-w-3xl mx-auto">
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            SmartRation was created for the UC Berkeley AI Hackathon with a mission to help underpaid, low-income
            individuals and families maximize their food budgets through intelligent meal planning. By combining receipt
            scanning technology with refrigerator content analysis, we create personalized meal plans that reduce food
            waste and stretch grocery budgets further.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Our Goal</h3>
                <p className="text-gray-600">
                  To reduce food insecurity by helping people make the most of their available food resources through
                  AI-powered meal planning.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <HeartHandshake className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Our Impact</h3>
                <p className="text-gray-600">
                  By reducing food waste and optimizing grocery budgets, we aim to help families save up to 25% on their
                  food expenses.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">The Technology</h2>
          <p className="text-gray-600 mb-6">
            SmartRation leverages cutting-edge AI technologies to deliver personalized meal planning:
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Our system uses computer vision and OCR (Optical Character Recognition) to identify food items in your
                  refrigerator and extract purchase information from receipts.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Smart Meal Planning</h3>
                <p className="text-gray-600">
                  Using large language models and nutritional databases, we generate meal plans that maximize the use of
                  available ingredients while ensuring nutritional balance and variety.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">The Team</h2>
          <p className="text-gray-600 mb-6">
            SmartRation was developed by a team of UC Berkeley students passionate about using technology to address
            real-world problems. Our diverse backgrounds in computer science, nutrition, and social impact drive our
            commitment to creating accessible solutions for food insecurity.
          </p>

          <div className="text-center mt-8">
            <Link href="/contact">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
