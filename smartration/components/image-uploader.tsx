"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface ImageUploaderProps {
  onChange: (file: File) => void
  icon?: ReactNode
  label: string
}

export default function ImageUploader({ onChange, icon, label }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onChange(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-2 right-2 bg-white"
            onClick={(e) => {
              e.stopPropagation()
              setPreview(null)
              onChange(null as unknown as File)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          {icon || <Upload className="h-8 w-8 text-gray-400 mb-2" />}
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-xs text-gray-500">Drag and drop or click to browse</p>
        </div>
      )}
    </div>
  )
}
