import { ImageAnnotatorClient } from '@google-cloud/vision';

interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

interface ReceiptData {
  items: ReceiptItem[];
  total: number;
  store?: string;
  date?: string;
}

// Initialize the Vision API client
const client = new ImageAnnotatorClient({
  keyFilename: undefined, // We'll use API key instead
  apiKey: process.env.GOOGLE_VISION_API_KEY || 'AIzaSyBP0CSodhGQi_fcKGnUJpySn1n4iyslsM8' // Fallback for development
});

export async function extractReceiptData(imageBase64: string): Promise<ReceiptData> {
  try {
    // Remove the data URL prefix to get just the base64 string
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Create the request
    const request = {
      image: {
        content: base64Image
      },
      features: [
        {
          type: 'TEXT_DETECTION' as const,
          maxResults: 50
        }
      ]
    };

    // Perform text detection
    const [result] = await client.annotateImage(request);
    const textAnnotations = result.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      throw new Error('No text found in the image');
    }

    // Get the full text
    const fullText = textAnnotations[0].description || '';
    
    // Parse the receipt data
    const receiptData = parseReceiptText(fullText);
    
    return receiptData;
  } catch (error) {
    console.error('Error extracting receipt data:', error);
    throw new Error('Failed to process receipt image');
  }
}

function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const items: ReceiptItem[] = [];
  let total = 0;
  let store = '';
  let date = '';

  // Common patterns for receipt parsing
  const pricePattern = /\$?\d+\.\d{2}/;
  const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for store name (usually at the top)
    if (i < 3 && !store && line.length > 3 && !pricePattern.test(line)) {
      store = line;
    }
    
    // Look for date
    if (datePattern.test(line) && !date) {
      date = line;
    }
    
    // Look for items with prices
    if (pricePattern.test(line)) {
      const priceMatch = line.match(pricePattern);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace('$', ''));
        
        // Skip if it's likely a total or subtotal
        if (line.toLowerCase().includes('total') || line.toLowerCase().includes('subtotal')) {
          if (price > total) {
            total = price;
          }
          continue;
        }
        
        // Extract item name (everything before the price)
        const itemName = line.substring(0, line.indexOf(priceMatch[0])).trim();
        
        if (itemName.length > 0 && price > 0 && price < 100) { // Reasonable price range
          items.push({
            name: itemName,
            price: price,
            quantity: 1
          });
        }
      }
    }
  }

  // If we couldn't find a total, sum up the items
  if (total === 0) {
    total = items.reduce((sum, item) => sum + item.price, 0);
  }

  return {
    items,
    total,
    store,
    date
  };
} 