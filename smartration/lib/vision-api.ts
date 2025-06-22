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
    console.log('🔍 Starting Google Vision API text extraction...')
    
    // Remove the data URL prefix to get just the base64 string
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    console.log('✅ Base64 image prepared, length:', base64Image.length)
    
    // Try TEXT_DETECTION first for line-by-line reading
    const textRequest = {
      image: {
        content: base64Image
      },
      features: [
        {
          type: 'TEXT_DETECTION' as const, // Use TEXT_DETECTION for line-by-line reading
          maxResults: 100 // Increase max results to get more individual text blocks
        }
      ]
    };

    console.log('📤 Sending request to Google Vision API with TEXT_DETECTION...')
    // Perform text detection
    const [result] = await client.annotateImage(textRequest);
    console.log('📥 Google Vision API response received')
    
    const textAnnotations = result.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      console.error('❌ No text annotations found in response')
      throw new Error('No text found in the image');
    }

    console.log('📊 Found', textAnnotations.length, 'text annotations')
    
    // Reconstruct lines based on Y-coordinates
    const reconstructedText = reconstructLinesFromAnnotations(textAnnotations);
    console.log('📄 Reconstructed text:')
    console.log('---START OF RECONSTRUCTED TEXT---')
    console.log(reconstructedText)
    console.log('---END OF RECONSTRUCTED TEXT---')
    
    // Parse the receipt data
    console.log('🔍 Parsing receipt text...')
    const receiptData = parseReceiptText(reconstructedText);
    console.log('✅ Receipt parsing completed')
    
    return receiptData;
  } catch (error) {
    console.error('❌ Error extracting receipt data:', error);
    throw new Error('Failed to process receipt image');
  }
}

function reconstructLinesFromAnnotations(annotations: any[]): string {
  if (annotations.length === 0) return '';
  
  // Skip the first annotation as it contains the full text
  const individualTexts = annotations.slice(1);
  
  // Group texts by their Y-coordinate (with some tolerance)
  const tolerance = 10; // pixels
  const lines: { y: number; texts: { text: string; x: number }[] }[] = [];
  
  individualTexts.forEach(annotation => {
    if (!annotation.boundingPoly || !annotation.boundingPoly.vertices) return;
    
    const vertices = annotation.boundingPoly.vertices;
    const text = annotation.description || '';
    
    // Calculate center Y coordinate
    const y = (vertices[0].y + vertices[1].y + vertices[2].y + vertices[3].y) / 4;
    const x = (vertices[0].x + vertices[1].x + vertices[2].x + vertices[3].x) / 4;
    
    // Find existing line or create new one
    let lineFound = false;
    for (const line of lines) {
      if (Math.abs(line.y - y) <= tolerance) {
        line.texts.push({ text, x });
        lineFound = true;
        break;
      }
    }
    
    if (!lineFound) {
      lines.push({ y, texts: [{ text, x }] });
    }
  });
  
  // Sort lines by Y coordinate and texts within each line by X coordinate
  lines.sort((a, b) => a.y - b.y);
  lines.forEach(line => {
    line.texts.sort((a, b) => a.x - b.x);
  });
  
  // Reconstruct text
  const reconstructedLines = lines.map(line => 
    line.texts.map(t => t.text).join(' ')
  );
  
  return reconstructedLines.join('\n');
}

function parseReceiptText(text: string): ReceiptData {
  console.log('🔍 Parsing receipt text with', text.split('\n').length, 'lines')
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('📋 Filtered to', lines.length, 'non-empty lines')
  
  const items: ReceiptItem[] = [];
  let total = 0;
  let store = '';
  let date = '';

  // Look for store name - skip common receipt headers
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    if (line.length > 3 && 
        !line.toLowerCase().includes('saved') &&
        line !== 'PUB' &&
        !line.includes('PUB DICED') &&
        !line.includes('PUBLIX TOM') &&
        !/\d+\.\d{2}/.test(line)) { // Skip lines with prices
      store = line;
      console.log('🏪 Found store name:', store)
      break;
    }
  }
  
  // Look for date
  const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (datePattern.test(line) && !date) {
      date = line;
      console.log('📅 Found date:', date)
      break;
    }
  }
  
  // Parse items - look for lines with item name on left and price on right
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines that are likely totals or headers
    if (line.toLowerCase().includes('total') || 
        line.toLowerCase().includes('tax') || 
        line.toLowerCase().includes('payment') ||
        line.toLowerCase().includes('change') ||
        line.toLowerCase().includes('credit') ||
        line.toLowerCase().includes('saved') ||
        line === 'PUB' ||
        line === 'F' ||
        line === '1 @ 2 FOR' ||
        line === '3 @') {
      continue;
    }
    
    // Look for price at the end of the line
    const priceMatch = line.match(/\$?\d+\.\d{2}\s*F?$/);
    if (priceMatch) {
      const priceStr = priceMatch[0].replace('$', '').replace('F', '').trim();
      const price = parseFloat(priceStr);
      
      // Skip if it's likely a total amount
      if (price > 50) {
        if (price > total) {
          total = price;
          console.log('💰 Found total:', total)
        }
        continue;
      }
      
      // Extract item name - everything before the price
      const priceIndex = line.lastIndexOf(priceMatch[0]);
      let itemName = line.substring(0, priceIndex).trim();
      
      // Clean up item name
      itemName = itemName.replace(/\d+\s*@\s*\d+\.\d+\/\s*\w+/, '').trim(); // Remove quantity/price per unit
      itemName = itemName.replace(/\d+\s*@\s*/, '').trim(); // Remove quantity @
      itemName = itemName.replace(/\d+\s*FOR\s*/, '').trim(); // Remove "X FOR" patterns
      itemName = itemName.replace(/\s*lb\s*@\s*\d+\.\d+\/\s*lb/, '').trim(); // Remove weight/price per lb
      itemName = itemName.replace(/\s*F$/, '').trim(); // Remove trailing "F"
      
      if (itemName.length > 0 && price > 0 && price < 50) { // Reasonable price range
        items.push({
          name: itemName,
          price: price,
          quantity: 1
        });
        console.log('�� Found item:', itemName, 'at $', price)
      }
    }
  }

  // If we couldn't find a total, look for "Order Total" or "Grand Total"
  if (total === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('order total') || line.toLowerCase().includes('grand total')) {
        const priceMatch = line.match(/\$?\d+\.\d{2}/);
        if (priceMatch) {
          total = parseFloat(priceMatch[0].replace('$', ''));
          console.log('💰 Found total from total line:', total)
          break;
        }
      }
    }
  }

  // If still no total, sum up the items
  if (total === 0) {
    total = items.reduce((sum, item) => sum + item.price, 0);
    console.log('💰 Calculated total from items:', total)
  }

  // Ensure we don't return empty strings for database
  if (!store) store = 'Unknown Store';
  if (!date) date = new Date().toISOString().split('T')[0]; // Use today's date as fallback

  console.log('📊 Final receipt data:')
  console.log('- Store:', store)
  console.log('- Date:', date)
  console.log('- Items found:', items.length)
  console.log('- Total:', total)
  console.log('- Items:', items.map(item => `${item.name}: $${item.price}`))

  return {
    items,
    total,
    store,
    date
  };
} 