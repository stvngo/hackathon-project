"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Receipt } from "lucide-react"
import { processImages } from "@/app/actions"
import ImageUploader from "@/components/image-uploader"

export default function UploadPage() {
  const router = useRouter()
  const [fridgeImage, setFridgeImage] = useState<File | null>(null)
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fridgeImage || !receiptImage) {
      alert("Please upload both a fridge photo and a receipt photo")
      return
    }

    setIsLoading(true)

    try {
      // In a real implementation, we would upload the images and process them
      // For this MVP, we'll simulate the process and redirect to results
      await processImages(fridgeImage, receiptImage)
      router.push("/results")
    } catch (error) {
      console.error("Error processing images:", error)
      alert("There was an error processing your images. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Upload Your Photos</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Photos</TabsTrigger>
          <TabsTrigger value="camera">Take Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Fridge Photo</h2>
                <p className="text-gray-500">
                  Upload a clear photo of your refrigerator contents so we can identify available ingredients.
                </p>
                <ImageUploader
                  icon={<Camera className="h-8 w-8 text-green-600" />}
                  label="Upload Fridge Photo"
                  onChange={(file) => setFridgeImage(file)}
                  imagePreview={fridgeImage}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Receipt Photo</h2>
                <p className="text-gray-500">
                  Upload a photo of your grocery receipt so we can identify purchased items and their costs.
                </p>
                <ImageUploader
                  icon={<Receipt className="h-8 w-8 text-green-600" />}
                  label="Upload Receipt Photo"
                  onChange={(file) => setReceiptImage(file)}
                  imagePreview={receiptImage}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading || !fridgeImage || !receiptImage}
              >
                {isLoading ? "Processing..." : "Generate Meal Plan"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="camera" className="mt-6">
          <Card className="p-6">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Take Fridge Photo</h2>
                <p className="text-gray-500">Use your camera to take a clear photo of your refrigerator contents.</p>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">Camera functionality will be available in the full version</p>
                  <Button
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setActiveTab("upload")}
                  >
                    Switch to Upload
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
