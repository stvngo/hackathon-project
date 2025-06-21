"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Receipt, CheckCircle } from "lucide-react"
import { processImages } from "@/app/actions"
import ImageUploader from "@/components/image-uploader"

interface ReceiptItem {
  name: string
  price: number
  quantity?: number
}

interface ReceiptData {
  items: ReceiptItem[]
  total: number
  store?: string
  date?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!receiptImage) {
      alert("Please upload a receipt photo")
      return
    }

    setIsProcessing(true)

    try {
      // Process the receipt image using Google Cloud Vision API
      const result = await processImages(null, receiptImage)
      
      if (result.success && result.receiptData) {
        setReceiptData(result.receiptData)
      }
    } catch (error) {
      console.error("Error processing image:", error)
      alert("There was an error processing your image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateMealPlan = () => {
    setIsLoading(true)
    // Navigate to results page
    router.push("/results")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Upload Your Receipt</h1>

      <div className="max-w-3xl mx-auto">
        {!receiptData ? (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Receipt Photo</h2>
                <p className="text-gray-500">
                  Upload a clear photo of your grocery receipt so we can identify purchased items and their costs.
                </p>
                <ImageUploader
                  icon={<Receipt className="h-8 w-8 text-green-600" />}
                  label="Upload Receipt Photo"
                  onChange={(file) => setReceiptImage(file)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isProcessing || !receiptImage}
              >
                {isProcessing ? "Processing Receipt..." : "Process Receipt"}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Receipt Processed Successfully!</h2>
              </div>

              {receiptData.store && (
                <div>
                  <h3 className="font-medium text-gray-900">Store: {receiptData.store}</h3>
                </div>
              )}

              {receiptData.date && (
                <div>
                  <h3 className="font-medium text-gray-900">Date: {receiptData.date}</h3>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Items Found:</h3>
                <div className="space-y-2">
                  {receiptData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-green-600">${receiptData.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleGenerateMealPlan}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Generating Meal Plan..." : "Generate Meal Plan"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
