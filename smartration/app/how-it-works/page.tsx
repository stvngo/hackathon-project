import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Camera, ChefHat, Receipt, ShoppingCart, Utensils } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">How SmartRation Works</h1>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-green-200 transform -translate-x-1/2"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 text-center md:text-right">
              <h2 className="text-xl font-bold mb-2">Step 1: Snap Photos</h2>
              <p className="text-gray-600">
                Take a clear photo of your refrigerator contents to let our AI see what ingredients you already have.
              </p>
            </div>
            <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop&crop=center"
                    alt="Refrigerator with fresh ingredients"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    Our AI identifies ingredients like vegetables, meats, dairy products, and more.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col md:flex-row-reverse items-center mb-12">
            <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0 text-center md:text-left">
              <h2 className="text-xl font-bold mb-2">Step 2: Upload Receipt</h2>
              <p className="text-gray-600">
                Upload your grocery receipt so we can identify what you&apos;ve purchased and the associated costs.
              </p>
            </div>
            <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="md:w-1/2 md:pr-12 mt-4 md:mt-0">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center"
                    alt="Grocery receipt with items listed"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    Our OCR technology extracts item names, quantities, and prices from your receipt.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 text-center md:text-right">
              <h2 className="text-xl font-bold mb-2">Step 3: AI Analysis</h2>
              <p className="text-gray-600">
                Our AI analyzes your available ingredients, purchased items, and budget constraints.
              </p>
            </div>
            <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center"
                    alt="AI analysis dashboard with data visualization"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Identifies what you already have
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Calculates costs per meal
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Considers nutritional balance
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Prioritizes using perishable items first
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Minimizes food waste
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex flex-col md:flex-row-reverse items-center mb-12">
            <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0 text-center md:text-left">
              <h2 className="text-xl font-bold mb-2">Step 4: Recipe Generation</h2>
              <p className="text-gray-600">
                Our AI creates recipes based on your available ingredients and nutritional needs.
              </p>
            </div>
            <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white">
              <ChefHat className="h-5 w-5" />
            </div>
            <div className="md:w-1/2 md:pr-12 mt-4 md:mt-0">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=200&fit=crop&crop=center"
                    alt="Delicious home-cooked meal with recipe ingredients"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Simple, easy-to-follow recipes
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Minimal additional ingredients needed
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Variety of meal types
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Adaptable to dietary restrictions
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      Budget-conscious options
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 text-center md:text-right">
              <h2 className="text-xl font-bold mb-2">Step 5: Meal Plan Delivery</h2>
              <p className="text-gray-600">
                Receive your personalized weekly meal plan with recipes, nutritional information, and cost breakdown.
              </p>
            </div>
            <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white">
              <Utensils className="h-5 w-5" />
            </div>
            <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1547592180-85f173990888?w=400&h=200&fit=crop&crop=center" 
                    alt="Weekly meal plan with organized recipes" 
                    className="object-cover w-full h-full" 
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    Your meal plan includes breakfast, lunch, and dinner options for the entire week.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Ready to start saving money and reducing food waste with SmartRation?</p>
          <Link href="/upload">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
