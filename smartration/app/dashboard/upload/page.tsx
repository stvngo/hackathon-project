"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Receipt, Upload, Zap, Camera, FileText, Sparkles } from "lucide-react"
import ImageUploader from "@/components/image-uploader"
import DashboardLayout from "@/components/dashboard-layout"
import { processImages } from "@/app/actions"
import { useAuth } from "@/lib/auth-context"

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
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
        // For now, redirect to meal plans page
        // In the future, this will redirect to a page with AI-generated meal plans
        router.push("/dashboard/meal-plans")
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
    setShowDemo(true)
    setReceiptImage(new File([], "demo-receipt.jpg"))
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4">
            <Receipt className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Receipt</h1>
          <p className="text-gray-600">
            Snap a photo of your grocery receipt and let our AI create amazing meal plans for you! 📸✨
          </p>
        </div>

        {/* Upload Card */}
        <Card className="p-8 bg-gradient-to-br from-white to-green-50 border-green-200">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
                <Camera className="h-5 w-5 text-green-600" />
                Receipt Photo
              </h3>
              <p className="text-gray-600 text-sm">
                Take a clear photo of your grocery receipt so we can identify what you bought and create budget-friendly
                meals
              </p>
            </div>

            <ImageUploader
              icon={<Receipt className="h-8 w-8 text-green-600" />}
              label="Upload Receipt Photo"
              onChange={(file) => setReceiptImage(file)}
            />

            {showDemo && receiptImage && (
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Demo Receipt</p>
                    <p className="text-sm text-gray-400">Grocery Store - $47.85</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !receiptImage}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Receipt...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={useDemoReceipt} className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Try Demo
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Pro Tips for Best Results
          </h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Make sure your receipt is well-lit and all text is readable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Include the entire receipt from store name to total
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Recent receipts work best (within the last week)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Our AI works with receipts from most major grocery stores
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  )
} 