"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowRight,
  Receipt,
  Utensils,
  Brain,
  TrendingUp,
  DollarSign,
  ChefHat,
  Camera,
  ShoppingCart,
} from "lucide-react"
import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        } else {
          // Remove animate class when element goes out of view to allow re-triggering
          entry.target.classList.remove('animate');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-animate, .fall-animate');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="gradient-bg">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-1 lg:gap-12 items-center">
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="hero-title">SmartRation</span>
                </h1>
                <p className="text-lg hero-subtitle md:text-xl lg:text-2xl">
                  AI-Powered Meal Planning for Sustainable Living
                </p>
              </div>
              <p className="hero-subtitle md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
                Transform your grocery receipts into intelligent meal plans. Our
                advanced AI analyzes your purchases, creates sustainable recipes,
                and helps you save money while making the most of your ingredients.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row justify-center">
                <Link href="/upload">
                  <button className="btn-style5-black text-lg px-8 py-3">
                    Start Planning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </Link>
                <Link href="/how-it-works">
                  <button className="btn-style5-black text-lg px-8 py-3">
                    See How It Works
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 gradient-text-white">
              Why Choose <span className="text-green-400">SmartRation</span>?
            </h2>
            <p className="max-w-3xl mx-auto gradient-text-light md:text-xl">
              Our AI-powered platform combines cutting-edge technology with
              practical meal planning to revolutionize how you approach food and
              budgeting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="holographic-card-gradient rounded-2xl p-8 text-center scroll-animate">
              <div className="flex h-20 w-20 items-center justify-center rounded-full icon-container mx-auto mb-6">
                <Brain className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI-Powered Analysis</h3>
              <p>
                Our advanced AI analyzes your receipts, identifies ingredients,
                and creates personalized meal plans that maximize your grocery
                budget.
              </p>
            </div>

            <div className="holographic-card-gradient rounded-2xl p-8 text-center scroll-animate">
              <div className="flex h-20 w-20 items-center justify-center rounded-full icon-container mx-auto mb-6">
                <TrendingUp className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Budgeting</h3>
              <p>
                Get detailed cost analysis, spending insights, and recommendations
                to optimize your grocery budget and reduce unnecessary expenses.
              </p>
            </div>

            <div className="holographic-card-gradient rounded-2xl p-8 text-center scroll-animate">
              <div className="flex h-20 w-20 items-center justify-center rounded-full icon-container mx-auto mb-6">
                <ChefHat className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-4">Sustainable Recipes</h3>
              <p>
                Access thousands of AI-generated recipes that minimize food waste,
                use ingredients efficiently, and adapt to your dietary preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 gradient-text-white">
              How <span className="text-green-400">SmartRation</span> Works
            </h2>
            <p className="max-w-3xl mx-auto gradient-text-light md:text-xl">
              From receipt to meal plan in minutes. Our intelligent system
              processes your data and delivers actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="holographic-card-gradient rounded-2xl p-6 text-center scroll-animate">
              <div className="flex h-16 w-16 items-center justify-center rounded-full icon-container mx-auto mb-4">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold mb-3">1. Upload Receipt</h3>
              <p className="text-sm">
                Simply snap a photo of your grocery receipt. Our advanced OCR
                technology extracts all items, prices, and quantities automatically.
              </p>
            </div>

            <div className="holographic-card-gradient rounded-2xl p-6 text-center scroll-animate">
              <div className="flex h-16 w-16 items-center justify-center rounded-full icon-container mx-auto mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold mb-3">2. AI Analysis</h3>
              <p className="text-sm">
                FoodGPT analyzes your purchases, identifies ingredients, calculates
                costs, and considers your dietary preferences and restrictions.
              </p>
            </div>

            <div className="holographic-card-gradient rounded-2xl p-6 text-center scroll-animate">
              <div className="flex h-16 w-16 items-center justify-center rounded-full icon-container mx-auto mb-4">
                <ChefHat className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold mb-3">3. Smart Meal Plans</h3>
              <p className="text-sm">
                Receive personalized meal plans that maximize your ingredients,
                minimize waste, and provide nutritional balance for your household.
              </p>
            </div>

            <div className="holographic-card-gradient rounded-2xl p-6 text-center scroll-animate">
              <div className="flex h-16 w-16 items-center justify-center rounded-full icon-container mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold mb-3">4. Budget Insights</h3>
              <p className="text-sm">
                Get detailed spending analysis, cost-per-meal breakdowns, and
                recommendations for future grocery trips to optimize your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Detail Section */}
      <section className="w-full py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 gradient-text-white">
              Powerful Features for Smart Living
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 fall-animate feature-detail-item">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                    <Receipt className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Receipt Integration</h3>
                    <p>
                      Advanced OCR technology extracts detailed information from any grocery receipt, including item names, quantities, prices, and store information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 scroll-animate feature-detail-item">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">FoodGPT AI Engine</h3>
                    <p>
                      Our proprietary AI analyzes your food data, creates intelligent meal combinations, and generates recipes tailored to your preferences and available ingredients.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 scroll-animate feature-detail-item">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                    <Utensils className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Intelligent Meal Plans</h3>
                    <p>
                      Get comprehensive meal plans that consider nutritional balance, cooking time, skill level, and household size. Each plan includes detailed recipes and shopping lists.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 scroll-animate feature-detail-item">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Budget Analysis</h3>
                    <p>
                      Track spending patterns, analyze cost-per-meal, and receive personalized recommendations for future grocery trips to maximize your budget efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative scroll-animate">
              <div className="sample-analysis-card rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Sample Analysis</h3>
                    <p>See how SmartRation transforms your data</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Total Spent:</span>
                      <span className="text-green-600 font-bold">$127.45</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Meals Generated:</span>
                      <span className="text-blue-600 font-bold">21 meals</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Cost per Meal:</span>
                      <span className="text-purple-600 font-bold">$6.07</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Waste Reduction:</span>
                      <span className="text-orange-600 font-bold">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text-white mb-6">
            Ready to Transform Your Meal Planning?
          </h2>
          <p className="text-xl gradient-text-light mb-8 max-w-2xl mx-auto">
            Join thousands of users who are saving money, reducing waste, and
            enjoying better meals with SmartRation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="btn-style5-green text-lg px-8 py-3">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link href="/how-it-works">
              <button className="btn-style5-green text-lg px-8 py-3">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
