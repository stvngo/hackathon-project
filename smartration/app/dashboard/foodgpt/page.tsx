"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, ChefHat, Sparkles, Clock, Users, DollarSign } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function FoodGPTPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm FoodGPT, your personal food assistant! 🍳 I can help you with recipes, meal planning, cooking tips, dietary advice, and more. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateMockResponse(userMessage.content),
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("recipe") || input.includes("cook")) {
      return "I'd love to help you with a recipe! Based on your recent meal plans, I see you enjoy quick and healthy options. Here's a simple recipe idea:\n\n**15-Minute Veggie Stir-Fry:**\n• Heat 2 tbsp oil in a wok\n• Add your favorite vegetables (bell peppers, broccoli, carrots)\n• Stir-fry for 5-7 minutes\n• Add soy sauce and garlic\n• Serve over rice or noodles\n\nWould you like me to suggest variations based on what's in your fridge?"
    }

    if (input.includes("budget") || input.includes("cheap") || input.includes("save")) {
      return "Great question about budget-friendly cooking! Here are my top money-saving tips:\n\n💰 **Smart Shopping:**\n• Buy seasonal produce\n• Use store brands for basics\n• Plan meals around sales\n\n🍳 **Cooking Tips:**\n• Batch cook grains and proteins\n• Use cheaper cuts of meat in slow cooker\n• Make your own sauces and dressings\n\nBased on your meal history, you're already saving about $12-15 per week! Want specific recipe ideas for under $3 per serving?"
    }

    if (input.includes("healthy") || input.includes("nutrition")) {
      return "I'm happy to help with healthy eating! Looking at your meal plans, you're doing well with protein variety. Here are some nutritional tips:\n\n🥗 **Balance Your Plate:**\n• 1/2 vegetables and fruits\n• 1/4 lean protein\n• 1/4 whole grains\n\n💪 **Quick Wins:**\n• Add spinach to smoothies\n• Swap white rice for quinoa\n• Include nuts/seeds for healthy fats\n\nWould you like me to analyze the nutritional balance of your current meal plan?"
    }

    if (input.includes("meal plan") || input.includes("planning")) {
      return "Meal planning is one of my favorite topics! 📅 Here's how to make it easier:\n\n**Weekly Planning Strategy:**\n1. Check your calendar for busy days\n2. Plan 2-3 base proteins for the week\n3. Prep ingredients on Sunday\n4. Keep 2-3 backup quick meals ready\n\n**Pro Tips:**\n• Theme nights (Meatless Monday, Taco Tuesday)\n• Double recipes for leftovers\n• Prep sauces and marinades in advance\n\nWant me to suggest a meal plan based on your recent grocery receipts?"
    }

    return "That's a great question! I'm here to help with all things food-related. Whether you need recipe ideas, cooking tips, meal planning advice, or nutritional guidance, I've got you covered. Could you tell me a bit more about what you're looking for? For example:\n\n• Are you looking for a specific type of recipe?\n• Do you have dietary restrictions I should know about?\n• Are you trying to achieve a particular goal (save money, eat healthier, save time)?\n\nI'm here to make your food journey easier and more delicious! 🍽️"
  }

  const suggestedQuestions = [
    { text: "Quick dinner ideas for tonight", icon: Clock },
    { text: "Budget-friendly meal prep", icon: DollarSign },
    { text: "Healthy recipes for my family", icon: Users },
    { text: "What can I make with chicken?", icon: ChefHat },
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-[calc(100vh-8rem)] flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 text-center">
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Ask FoodGPT</h1>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Assistant
            </Badge>
          </div>
          <p className="text-gray-600">Your personal food assistant for recipes, meal planning, and cooking tips</p>
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <ChefHat className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">FoodGPT</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  <div className={`text-xs mt-2 ${message.role === "user" ? "text-green-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">FoodGPT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">Try asking me about:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question.text)}
                    className="text-xs border-gray-300 hover:bg-white hover:border-green-300 hover:text-green-700"
                  >
                    <question.icon className="h-3 w-3 mr-1" />
                    {question.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about food, recipes, or meal planning..."
                className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 