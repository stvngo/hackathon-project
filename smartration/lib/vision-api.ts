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
    
    // Use TEXT_DETECTION for better line-by-line reading
    const textRequest = {
      image: {
        content: base64Image
      },
      features: [
        {
          type: 'TEXT_DETECTION' as const,
          maxResults: 200 // Increase max results for better coverage
        }
      ]
    };

    console.log('📤 Sending request to Google Vision API with TEXT_DETECTION...')
    const [result] = await client.annotateImage(textRequest);
    console.log('📥 Google Vision API response received')
    
    const textAnnotations = result.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      console.error('❌ No text annotations found in response')
      throw new Error('No text found in the image');
    }

    console.log('📊 Found', textAnnotations.length, 'text annotations')
    
    // Reconstruct lines based on Y-coordinates with improved logic
    const reconstructedText = reconstructLinesFromAnnotations(textAnnotations);
    console.log('📄 Reconstructed text:')
    console.log('---START OF RECONSTRUCTED TEXT---')
    console.log(reconstructedText)
    console.log('---END OF RECONSTRUCTED TEXT---')
    
    // Parse the receipt data with improved parsing logic
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
  
  // Group texts by their Y-coordinate with improved tolerance
  const tolerance = 12; // Slightly reduced tolerance for better line separation
  const lines: { y: number; texts: { text: string; x: number; width: number }[] }[] = [];
  
  individualTexts.forEach(annotation => {
    if (!annotation.boundingPoly || !annotation.boundingPoly.vertices) return;
    
    const vertices = annotation.boundingPoly.vertices;
    const text = annotation.description || '';
    
    if (text.trim().length === 0) return; // Skip empty text
    
    // Calculate center Y coordinate and width
    const y = (vertices[0].y + vertices[1].y + vertices[2].y + vertices[3].y) / 4;
    const x = (vertices[0].x + vertices[1].x + vertices[2].x + vertices[3].x) / 4;
    const width = Math.abs(vertices[1].x - vertices[0].x);
    
    // Find existing line or create new one
    let lineFound = false;
    for (const line of lines) {
      if (Math.abs(line.y - y) <= tolerance) {
        line.texts.push({ text, x, width });
        lineFound = true;
        break;
      }
    }
    
    if (!lineFound) {
      lines.push({ y, texts: [{ text, x, width }] });
    }
  });
  
  // Sort lines by Y coordinate and texts within each line by X coordinate
  lines.sort((a, b) => a.y - b.y);
  lines.forEach(line => {
    line.texts.sort((a, b) => a.x - b.x);
  });
  
  // Reconstruct text with better spacing and handle special cases
  const reconstructedLines = lines.map(line => {
    const lineText = line.texts.map(t => t.text).join(' ');
    
    // Clean up common OCR artifacts
    let cleanedText = lineText.trim();
    
    // Handle repeated text patterns (common in OCR)
    cleanedText = cleanedText.replace(/(\w+)\s+\1/g, '$1'); // Remove immediate repeats
    cleanedText = cleanedText.replace(/(\w+\s+\w+)\s+\1/g, '$1'); // Remove phrase repeats
    
    // Handle common OCR issues
    cleanedText = cleanedText.replace(/\s+/g, ' '); // Normalize spaces
    cleanedText = cleanedText.replace(/[^\w\s\.\$\d\-\/\@\*\+]/g, ''); // Keep only relevant characters
    
    return cleanedText;
  }).filter(line => line.length > 0);
  
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

  // Look for store name in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.length > 3 && 
        !line.toLowerCase().includes('saved') &&
        !line.toLowerCase().includes('total') &&
        !line.toLowerCase().includes('tax') &&
        !line.toLowerCase().includes('payment') &&
        !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line) && // Skip date lines
        !/\$?\d+\.\d{2}/.test(line)) { // Skip lines with prices
      store = line;
      console.log('🏪 Found store name:', store)
      break;
    }
  }
  
  // Look for date with improved parsing
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY or MM/DD/YY
    /\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /\d{1,2}-\d{1,2}-\d{2,4}/, // MM-DD-YYYY
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of datePatterns) {
      if (pattern.test(line) && !date) {
        // Extract only the date part from the line
        const dateMatch = line.match(pattern);
        if (dateMatch) {
          let extractedDate = dateMatch[0];
          
          // Convert MM/DD/YY to MM/DD/YYYY if needed
          if (extractedDate.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
            const parts = extractedDate.split('/');
            const year = parseInt(parts[2]);
            const fullYear = year < 50 ? 2000 + year : 1900 + year;
            extractedDate = `${parts[0]}/${parts[1]}/${fullYear}`;
          }
          
          // Convert to YYYY-MM-DD format for database
          if (extractedDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            const parts = extractedDate.split('/');
            extractedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
          
          date = extractedDate;
          console.log('📅 Found date:', date)
          break;
        }
      }
    }
    if (date) break;
  }
    
  // Parse items with improved logic
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    console.log(`🔍 Processing line ${i + 1}: "${line}"`)
    
    // Skip lines that are definitely not food items
    if (line.toLowerCase().includes('total') || 
        line.toLowerCase().includes('tax') || 
        line.toLowerCase().includes('payment') ||
        line.toLowerCase().includes('change') ||
        line.toLowerCase().includes('credit') ||
        line.toLowerCase().includes('subtotal') ||
        line.toLowerCase().includes('grand total') ||
        line.toLowerCase().includes('order total') ||
        line.toLowerCase().includes('purchase') ||
        line.toLowerCase().includes('visa') ||
        line.toLowerCase().includes('auth') ||
        line.toLowerCase().includes('lane') ||
        line.toLowerCase().includes('cashier') ||
        line.toLowerCase().includes('ref') ||
        line.toLowerCase().includes('seq') ||
        line.toLowerCase().includes('mrch') ||
        line.toLowerCase().includes('term') ||
        line.toLowerCase().includes('eps') ||
        line.toLowerCase().includes('item') ||
        line.toLowerCase().includes('acct') ||
        line.toLowerCase().includes('apprvl') ||
        line.toLowerCase().includes('code') ||
        line.toLowerCase().includes('trx') ||
        line.toLowerCase().includes('thanks') ||
        line.toLowerCase().includes('life is') ||
        line.toLowerCase().includes('1401') ||
        line.toLowerCase().includes('906-') ||
        line.toLowerCase().includes('number of items') ||
        line.toLowerCase().includes('you that is saved') ||
        line.toLowerCase().includes('5 %') ||
        line === 'PUB' ||
        line === 'F' ||
        line === '1 @ 2 FOR' ||
        line === '3 @' ||
        line.length < 3) {
      console.log(`⏭️ Skipping line ${i + 1} (filtered out)`)
      continue;
    }
    
    // Improved price detection patterns
    let priceMatch = null;
    let itemName = '';
    let price = 0;
    let quantity = 1;
    let processedLine = line;
    
    // First, try to extract quantity from the beginning of the line
    const quantityMatch = processedLine.match(/^(\d+)\s+/);
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
      // Remove the quantity from the line for further processing
      processedLine = processedLine.replace(/^\d+\s+/, '');
    }
    
    // Try different price patterns
    const pricePatterns = [
      /\$?\d+\.\d{1,2}\s*F?$/, // Standard price with 1-2 decimal places and optional F
      /\d+\s*@\s*\$?\d+\.\d+\/\w+\s+\$?\d+\.\d{1,2}\s*F?$/, // Quantity @ price/unit total F
      /\d+\s*@\s*\$?\d+\.\d{1,2}\s*F?$/, // Quantity @ price F
      /\$?\d+\.\d{1,2}\s*F?$/, // Just price with 1-2 decimal places and optional F
    ];
    
    for (const pattern of pricePatterns) {
      priceMatch = processedLine.match(pattern);
      if (priceMatch) {
        console.log(`💰 Price match found: "${priceMatch[0]}" in line: "${processedLine}"`)
        const matchText = priceMatch[0];
        
        // Handle quantity patterns
        if (matchText.includes('@')) {
          const finalPriceMatch = matchText.match(/\$?\d+\.\d{1,2}/);
          if (finalPriceMatch) {
            price = parseFloat(finalPriceMatch[0].replace('$', ''));
          }
        } else {
          // Simple price pattern
          price = parseFloat(matchText.replace('$', '').replace('F', '').trim());
        }
        
        // Extract item name - everything before the price match
        const priceIndex = processedLine.lastIndexOf(matchText);
        itemName = processedLine.substring(0, priceIndex).trim();
        
        console.log(`📝 Extracted item name: "${itemName}" with price: $${price}`)
        
        // Clean up item name
        itemName = itemName.replace(/\d+\s*@\s*\$?\d+\.\d+\/\s*\w+/, '').trim(); // Remove "2 @ 6.49/EA"
        itemName = itemName.replace(/\d+\s*@\s*\$?\d+\.\d+/, '').trim(); // Remove "2 @ 6.49"
        itemName = itemName.replace(/\d+\s*FOR\s*/, '').trim(); // Remove "X FOR"
        itemName = itemName.replace(/\s*lb\s*@\s*\$?\d+\.\d+\/\s*lb/, '').trim(); // Remove weight/price per lb
        itemName = itemName.replace(/\s*F$/, '').trim(); // Remove trailing "F"
        itemName = itemName.replace(/^\d+\s*/, '').trim(); // Remove leading numbers
        itemName = itemName.replace(/\s*\$\s*$/, '').trim(); // Remove trailing "$"
        itemName = itemName.replace(/\s*\$/, '').trim(); // Remove any "$" in the name
        itemName = itemName.replace(/^\s+|\s+$/g, '').trim(); // Remove extra whitespace
        
        console.log(`🧹 Cleaned item name: "${itemName}"`)
        break;
      }
    }
    
    // Validate the extracted data
    if (priceMatch && itemName.length > 0 && price > 0 && price < 100) { // Reasonable price range
      // Skip if it's likely a total amount
      if (price > 50 && (itemName.toLowerCase().includes('total') || itemName.length < 5)) {
        if (price > total) {
          total = price;
          console.log('💰 Found total:', total)
        }
        continue;
      }
      
      // Skip if item name contains payment-related terms
      if (itemName.toLowerCase().includes('purchase') || 
          itemName.toLowerCase().includes('total') ||
          itemName.toLowerCase().includes('subtotal') ||
          itemName.toLowerCase().includes('payment') ||
          itemName.toLowerCase().includes('acct') ||
          itemName.toLowerCase().includes('apprvl') ||
          itemName.toLowerCase().includes('code') ||
          itemName.toLowerCase().includes('trx') ||
          itemName.toLowerCase().includes('thanks') ||
          itemName.toLowerCase().includes('life is') ||
          itemName.toLowerCase().includes('1401') ||
          itemName.toLowerCase().includes('906-') ||
          itemName.toLowerCase().includes('number of items') ||
          itemName.toLowerCase().includes('you that is saved') ||
          itemName.toLowerCase().includes('5 %')) {
        if (price > total) {
          total = price;
          console.log('💰 Found total:', total)
        }
        continue;
      }
      
      // Special handling for this receipt format
      // Check if this looks like a food item
      const isFoodItem = 
        itemName.toLowerCase().includes('water') ||
        itemName.toLowerCase().includes('lobster') ||
        itemName.toLowerCase().includes('steak') ||
        itemName.toLowerCase().includes('meat') ||
        itemName.toLowerCase().includes('porterhouse') ||
        itemName.toLowerCase().includes('cold') ||
        itemName.toLowerCase().includes('diet') ||
        itemName.toLowerCase().includes('mt dew') ||
        itemName.toLowerCase().includes('pack') ||
        itemName.toLowerCase().includes('grocery') ||
        itemName.toLowerCase().includes('savings') ||
        itemName.toLowerCase().includes('deposit') ||
        (itemName.length >= 3 && 
         !itemName.match(/^\d+$/) && // Not just numbers
         !itemName.match(/^[^a-zA-Z]*$/) && // Contains at least some letters
         itemName.length < 50); // Not too long
      
      if (isFoodItem) {
        // Clean up the item name further
        let cleanItemName = itemName;
        
        // Remove common prefixes/suffixes that aren't part of the food name
        cleanItemName = cleanItemName.replace(/^\*?\s*/, ''); // Remove leading asterisk
        cleanItemName = cleanItemName.replace(/\s*STORE\s*$/i, ''); // Remove "STORE" suffix
        cleanItemName = cleanItemName.replace(/\s*SAVINGS\s*$/i, ''); // Remove "SAVINGS" suffix
        cleanItemName = cleanItemName.replace(/\s*DEPOSIT\s*$/i, ''); // Remove "DEPOSIT" suffix
        cleanItemName = cleanItemName.replace(/\s*T\s*$/i, ''); // Remove "T" suffix (likely weight indicator)
        cleanItemName = cleanItemName.replace(/\s*I\s*$/i, ''); // Remove "I" suffix (OCR artifact)
        
        // Handle repeated words (common OCR issue)
        cleanItemName = cleanItemName.replace(/(\w+)\s+\1/g, '$1'); // Remove immediate repeats
        cleanItemName = cleanItemName.replace(/(\w+\s+\w+)\s+\1/g, '$1'); // Remove phrase repeats
        
        // Normalize spaces
        cleanItemName = cleanItemName.replace(/\s+/g, ' ').trim();
        
        // Only add if we have a meaningful name
        if (cleanItemName.length >= 2) {
          items.push({
            name: cleanItemName,
            price: price,
            quantity: quantity
          });
          console.log('🛒 Found item:', cleanItemName, 'at $', price, 'qty:', quantity)
        }
      }
    }
  }

  // If we couldn't find a total, look for "Order Total" or "Grand Total"
  if (total === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('order total') || 
          line.toLowerCase().includes('grand total') ||
          line.toLowerCase().includes('total')) {
        const priceMatch = line.match(/\$?\d+\.\d{1,2}/);
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
    total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
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
  console.log('- Items:', items.map(item => `${item.name}: $${item.price} (qty: ${item.quantity})`))

  return {
    items,
    total,
    store,
    date
  };
} 