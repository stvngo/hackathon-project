"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Receipt, Sparkles } from "lucide-react"
import ImageUploader from "@/components/image-uploader"
import DashboardLayout from "@/components/dashboard-layout"
import { processImages } from "@/app/actions"
import { useAuth } from "@/lib/auth-context"

export default function UploadReceiptPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!receiptImage) {
      setError("Please upload a receipt photo")
      return
    }

    if (!user) {
      setError("You must be logged in to upload receipts")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Process the receipt using the server action
      const result = await processImages(null, receiptImage)
      
      if (result.success) {
        console.log("Receipt processed successfully:", result)
        // Store meal plans in localStorage as fallback
        if (result.mealPlans) {
          localStorage.setItem('currentMealPlans', JSON.stringify(result.mealPlans))
        }
        // Redirect to AI meal plans page with the generated data
        const mealPlansParam = encodeURIComponent(JSON.stringify(result.mealPlans || []))
        router.push(`/dashboard/ai-meal-plans?mealPlans=${mealPlansParam}`)
      } else {
        setError("Failed to process receipt. Please try again.")
      }
    } catch (error) {
      console.error("Error processing receipt:", error)
      setError("There was an error processing your receipt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const useDemoReceipt = () => {
    setReceiptImage(new File([], "demo-receipt.jpg"))
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Upload Receipt</h1>
          <p className="text-gray-600">Upload your grocery receipt to generate meal plans</p>
        </div>

        {/* Upload Card */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Receipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drag and drop your receipt or click to browse</p>
            </div>

            <ImageUploader
              icon={<Receipt className="h-6 w-6 text-gray-400" />}
              label="Upload Receipt Photo"
              onChange={(file) => setReceiptImage(file)}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !receiptImage}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-shadow"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={useDemoReceipt} className="border-gray-300 hover:bg-gray-50">
                Try Demo
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-6 border border-gray-200 shadow-sm bg-blue-50">
          <h3 className="font-medium text-blue-900 mb-3">Tips for best results</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Make sure your receipt is well-lit and readable</p>
            <p>• Include the entire receipt from store name to total</p>
            <p>• Works with receipts from most major grocery stores</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 