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

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.role !== "user" || msg.id !== "1") // Exclude the initial greeting
        .map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))

      // Call the FoodGPT API
      const response = await fetch('/api/foodgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Error getting FoodGPT response:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 🤖",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
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
                placeholder="Ask me anything about food, recipes, or cooking..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 