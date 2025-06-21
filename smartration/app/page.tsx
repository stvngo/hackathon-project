import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Camera, Receipt, Utensils } from "lucide-react"

export default function Home() {
  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Smart Meal Planning for Budget-Conscious Living
              </h1>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Upload a photo of your fridge and your grocery receipt to get a budget-friendly meal plan with
                nutritional tips.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/upload">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" className="bg-white text-green-600 border-green-600">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-sm lg:max-w-none">
              <img
                alt="SmartRation app interface mockup"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                src="/placeholder.svg?height=400&width=600"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                SmartRation uses AI to help you make the most of your groceries and budget.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
            <Card className="flex flex-col items-center space-y-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Camera className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Snap Photos</h3>
              <p className="text-gray-500">
                Take a picture of your refrigerator contents to let our AI see what ingredients you have on hand.
              </p>
            </Card>
            <Card className="flex flex-col items-center space-y-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Receipt className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Upload Receipt</h3>
              <p className="text-gray-500">
                Upload your grocery receipt so we can identify what you've purchased and the associated costs.
              </p>
            </Card>
            <Card className="flex flex-col items-center space-y-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Utensils className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Get Meal Plans</h3>
              <p className="text-gray-500">
                Receive a customized meal plan that maximizes your ingredients and minimizes additional spending.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}



