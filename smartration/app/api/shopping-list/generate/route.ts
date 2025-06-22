import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ShoppingItem {
  id: string
  name: string
  category: string
  estimatedPrice: number
  quantity: number
  unit: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
}

interface ShoppingList {
  id: string
  name: string
  items: ShoppingItem[]
  totalCost: number
  estimatedMeals: number
  daysOfFood: number
  createdAt: string
}

// Fallback budget-friendly food database for when Claude fails
const fallbackFoodDatabase = {
  proteins: [
    { name: 'Chicken Breast', price: 2.99, unit: 'lb', priority: 'high' as const },
    { name: 'Ground Beef (80/20)', price: 3.49, unit: 'lb', priority: 'high' as const },
    { name: 'Eggs (Dozen)', price: 2.49, unit: 'dozen', priority: 'high' as const },
    { name: 'Canned Tuna', price: 1.29, unit: 'can', priority: 'medium' as const },
    { name: 'Pork Chops', price: 2.79, unit: 'lb', priority: 'medium' as const },
    { name: 'Turkey Ground', price: 3.99, unit: 'lb', priority: 'medium' as const },
    { name: 'Canned Beans (Black)', price: 0.89, unit: 'can', priority: 'low' as const },
    { name: 'Lentils (Dry)', price: 1.49, unit: 'lb', priority: 'low' as const },
  ],
  vegetables: [
    { name: 'Onions', price: 0.99, unit: 'lb', priority: 'high' as const },
    { name: 'Carrots', price: 0.89, unit: 'lb', priority: 'high' as const },
    { name: 'Potatoes', price: 0.79, unit: 'lb', priority: 'high' as const },
    { name: 'Cabbage', price: 0.69, unit: 'lb', priority: 'medium' as const },
    { name: 'Frozen Mixed Vegetables', price: 1.49, unit: 'bag', priority: 'medium' as const },
    { name: 'Spinach (Frozen)', price: 1.29, unit: 'bag', priority: 'medium' as const },
    { name: 'Bell Peppers', price: 1.99, unit: 'lb', priority: 'low' as const },
    { name: 'Broccoli', price: 1.49, unit: 'lb', priority: 'low' as const },
  ],
  grains: [
    { name: 'White Rice (5lb)', price: 4.99, unit: 'bag', priority: 'high' as const },
    { name: 'Bread (Whole Wheat)', price: 2.49, unit: 'loaf', priority: 'high' as const },
    { name: 'Pasta (Spaghetti)', price: 1.29, unit: 'lb', priority: 'high' as const },
    { name: 'Oatmeal (Quick)', price: 2.99, unit: 'container', priority: 'medium' as const },
    { name: 'Tortillas (Corn)', price: 1.99, unit: 'pack', priority: 'medium' as const },
    { name: 'Flour (All Purpose)', price: 2.49, unit: '5lb', priority: 'low' as const },
  ],
  dairy: [
    { name: 'Milk (2%)', price: 3.49, unit: 'gallon', priority: 'high' as const },
    { name: 'Cheese (Cheddar)', price: 2.99, unit: '8oz', priority: 'medium' as const },
    { name: 'Butter', price: 3.99, unit: 'lb', priority: 'medium' as const },
    { name: 'Yogurt (Plain)', price: 2.49, unit: '32oz', priority: 'low' as const },
    { name: 'Cottage Cheese', price: 2.99, unit: '16oz', priority: 'low' as const },
  ],
  pantry: [
    { name: 'Cooking Oil', price: 2.99, unit: 'bottle', priority: 'high' as const },
    { name: 'Salt', price: 0.99, unit: 'container', priority: 'high' as const },
    { name: 'Black Pepper', price: 1.49, unit: 'container', priority: 'medium' as const },
    { name: 'Garlic Powder', price: 1.29, unit: 'container', priority: 'medium' as const },
    { name: 'Tomato Sauce', price: 1.19, unit: 'can', priority: 'medium' as const },
    { name: 'Chicken Broth', price: 1.49, unit: 'box', priority: 'low' as const },
    { name: 'Soy Sauce', price: 1.99, unit: 'bottle', priority: 'low' as const },
  ],
  fruits: [
    { name: 'Bananas', price: 0.59, unit: 'lb', priority: 'high' as const },
    { name: 'Apples', price: 1.99, unit: 'lb', priority: 'medium' as const },
    { name: 'Oranges', price: 1.49, unit: 'lb', priority: 'medium' as const },
    { name: 'Frozen Mixed Berries', price: 2.99, unit: 'bag', priority: 'low' as const },
  ],
  snacks: [
    { name: 'Peanut Butter', price: 2.49, unit: 'jar', priority: 'medium' as const },
    { name: 'Crackers', price: 1.99, unit: 'box', priority: 'low' as const },
    { name: 'Popcorn Kernels', price: 1.49, unit: 'bag', priority: 'low' as const },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { budget, daysToPlan, categories, preferences } = body

    console.log('🔄 Attempting to generate shopping list with Claude AI...')
    console.log('📊 User preferences:', JSON.stringify(preferences, null, 2))
    console.log('💰 Budget:', budget)
    console.log('📅 Days to plan:', daysToPlan)
    console.log('🏷️ Categories:', categories)

    // Try to generate shopping list with Claude first
    let shoppingList: ShoppingList
    let usedClaude = false
    
    try {
      console.log('🚀 Starting Claude AI generation...')
      shoppingList = await generateClaudeShoppingList(budget, daysToPlan, categories, preferences)
      usedClaude = true
      console.log('✅ Successfully generated shopping list with Claude AI')
    } catch (error) {
      console.error('❌ Claude generation failed, using fallback:', error)
      console.log('🔄 Switching to fallback shopping list generation...')
      shoppingList = generateFallbackShoppingList(budget, daysToPlan, categories, preferences)
      usedClaude = false
      console.log('✅ Generated fallback shopping list')
    }

    console.log('📋 Final shopping list generated by:', usedClaude ? 'Claude AI' : 'Fallback Database')
    console.log('📦 Total items:', shoppingList.items.length)
    console.log('💵 Total cost:', shoppingList.totalCost)

    // Add metadata to response
    const response = {
      ...shoppingList,
      metadata: {
        generatedBy: usedClaude ? 'claude-ai' : 'fallback-database',
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('💥 Error generating shopping list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateClaudeShoppingList(
  budget: number,
  daysToPlan: number,
  categories: string[],
  preferences: any
): Promise<ShoppingList> {
  const householdSize = preferences?.householdSize || 1
  const allergies = preferences?.allergies || []
  const dietaryRestrictions = preferences?.dietaryRestrictions || []
  const avoidIngredients = preferences?.avoidIngredients || ''
  const foodPreferences = preferences?.foodPreferences || []
  const cuisinePreferences = preferences?.cuisinePreferences || []
  const spiceTolerance = preferences?.spiceTolerance || 5
  const specialDietary = preferences?.specialDietary || ''

  const prompt = `You are a sustainable food shopping expert. Generate a shopping list for ${daysToPlan} days of meals for ${householdSize} person(s) with a budget of $${budget}.

User Preferences:
- Allergies: ${allergies.join(', ') || 'None'}
- Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
- Avoid Ingredients: ${avoidIngredients || 'None'}
- Food Preferences: ${foodPreferences.join(', ') || 'None'}
- Cuisine Preferences: ${cuisinePreferences.join(', ') || 'None'}
- Spice Tolerance: ${spiceTolerance}/10
- Special Dietary: ${specialDietary || 'None'}
- Categories to include: ${categories.join(', ')}

Requirements:
1. Focus on sustainable, budget-friendly ingredients
2. Prioritize whole foods and seasonal produce
3. Include ingredients for complete meals (breakfast, lunch, dinner)
4. Respect all allergies and dietary restrictions
5. Stay within budget
6. Provide realistic quantities for the household size
7. Include estimated prices per unit

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Shopping List Name",
  "items": [
    {
      "name": "Ingredient Name",
      "category": "proteins|vegetables|grains|dairy|pantry|fruits|snacks",
      "estimatedPrice": 2.99,
      "quantity": 2,
      "unit": "lb",
      "priority": "high|medium|low",
      "notes": "Optional notes about the ingredient"
    }
  ],
  "totalCost": 45.67,
  "estimatedMeals": 21,
  "daysOfFood": 7
}

Ensure the JSON is valid and all prices are realistic for a grocery store.`

  console.log('🤖 Sending prompt to Claude AI...')
  console.log('📝 Prompt:', prompt)

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  console.log('📨 Claude response received')
  console.log('🔍 Response type:', response.content[0].type)

  const content = response.content[0]
  if (content.type !== 'text') {
    console.error('❌ Invalid response type from Claude:', content.type)
    throw new Error('Invalid response type from Claude')
  }

  console.log('📄 Claude raw response:')
  console.log(content.text)

  // Extract JSON from Claude's response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('❌ No JSON found in Claude response')
    throw new Error('No JSON found in Claude response')
  }

  console.log('🔍 Extracted JSON:')
  console.log(jsonMatch[0])

  let claudeData
  try {
    claudeData = JSON.parse(jsonMatch[0])
    console.log('✅ Successfully parsed Claude JSON')
    console.log('📊 Parsed data:', JSON.stringify(claudeData, null, 2))
  } catch (parseError) {
    console.error('❌ Failed to parse Claude JSON:', parseError)
    throw new Error(`Failed to parse Claude JSON: ${parseError}`)
  }
  
  // Convert Claude response to our ShoppingList format
  const items: ShoppingItem[] = claudeData.items.map((item: any, index: number) => ({
    id: `${item.category}-${item.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: item.name,
    category: item.category,
    estimatedPrice: parseFloat(item.estimatedPrice) || 0,
    quantity: parseInt(item.quantity) || 1,
    unit: item.unit || 'unit',
    priority: item.priority || 'medium',
    notes: item.notes
  }))

  console.log('🛒 Converted items:', JSON.stringify(items, null, 2))

  return {
    id: `shopping-list-${Date.now()}`,
    name: claudeData.name || `${daysToPlan}-Day Sustainable Shopping List`,
    items,
    totalCost: parseFloat(claudeData.totalCost) || 0,
    estimatedMeals: parseInt(claudeData.estimatedMeals) || (daysToPlan * 3 * householdSize),
    daysOfFood: parseInt(claudeData.daysOfFood) || daysToPlan,
    createdAt: new Date().toISOString()
  }
}

function generateFallbackShoppingList(
  budget: number,
  daysToPlan: number,
  categories: string[],
  preferences: any
): ShoppingList {
  const items: ShoppingItem[] = []
  let totalCost = 0
  const householdSize = preferences?.householdSize || 1
  const allergies = preferences?.allergies || []
  const dietaryRestrictions = preferences?.dietaryRestrictions || []
  const avoidIngredients = preferences?.avoidIngredients || ''

  // Calculate budget allocation per category
  const categoryBudget = budget / categories.length
  const mealsPerDay = 3
  const totalMeals = daysToPlan * mealsPerDay * householdSize

  // Generate items for each selected category
  categories.forEach(category => {
    const categoryItems = fallbackFoodDatabase[category as keyof typeof fallbackFoodDatabase] || []
    let categorySpent = 0
    const maxCategoryBudget = categoryBudget * 1.2 // Allow 20% flexibility

    // Filter out items based on allergies and restrictions
    const safeItems = categoryItems.filter(item => {
      const itemName = item.name.toLowerCase()
      
      // Check allergies
      for (const allergy of allergies) {
        if (itemName.includes(allergy.toLowerCase())) {
          return false
        }
      }

      // Check dietary restrictions
      if (dietaryRestrictions.includes('Vegetarian') && 
          ['chicken', 'beef', 'pork', 'turkey', 'tuna'].some(meat => itemName.includes(meat))) {
        return false
      }

      if (dietaryRestrictions.includes('Vegan') && 
          ['milk', 'cheese', 'butter', 'yogurt', 'eggs'].some(dairy => itemName.includes(dairy))) {
        return false
      }

      // Check avoid ingredients
      if (avoidIngredients && avoidIngredients.toLowerCase().includes(itemName)) {
        return false
      }

      return true
    })

    // Prioritize high priority items first
    const priorityOrder = ['high', 'medium', 'low']
    
    for (const priority of priorityOrder) {
      const priorityItems = safeItems.filter(item => item.priority === priority)
      
      for (const item of priorityItems) {
        if (categorySpent >= maxCategoryBudget) break

        // Calculate quantity based on household size and days
        let quantity = 1
        if (category === 'proteins') {
          quantity = Math.ceil((householdSize * daysToPlan) / 3) // 3 days per protein item
        } else if (category === 'vegetables') {
          quantity = Math.ceil((householdSize * daysToPlan) / 2) // 2 days per veggie item
        } else if (category === 'grains') {
          quantity = Math.ceil((householdSize * daysToPlan) / 4) // 4 days per grain item
        } else if (category === 'dairy') {
          quantity = Math.ceil((householdSize * daysToPlan) / 5) // 5 days per dairy item
        } else {
          quantity = Math.ceil((householdSize * daysToPlan) / 7) // 7 days per other item
        }

        const itemCost = item.price * quantity
        
        if (categorySpent + itemCost <= maxCategoryBudget) {
          items.push({
            id: `${category}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: item.name,
            category,
            estimatedPrice: item.price,
            quantity,
            unit: item.unit,
            priority: item.priority,
            notes: getItemNotes(item, preferences)
          })
          
          categorySpent += itemCost
          totalCost += itemCost
        }
      }
    }
  })

  // Ensure we stay within budget
  if (totalCost > budget) {
    // Remove low priority items to get within budget
    const lowPriorityItems = items.filter(item => item.priority === 'low')
    for (const item of lowPriorityItems) {
      if (totalCost <= budget) break
      totalCost -= item.estimatedPrice * item.quantity
      const index = items.findIndex(i => i.id === item.id)
      if (index > -1) {
        items.splice(index, 1)
      }
    }
  }

  return {
    id: `shopping-list-${Date.now()}`,
    name: `${daysToPlan}-Day Budget Shopping List`,
    items,
    totalCost,
    estimatedMeals: totalMeals,
    daysOfFood: daysToPlan,
    createdAt: new Date().toISOString()
  }
}

function getItemNotes(item: any, preferences: any): string | undefined {
  const notes = []
  
  if (preferences?.hasChildren && item.name.toLowerCase().includes('chicken')) {
    notes.push('Great for kids')
  }
  
  if (preferences?.spiceTolerance && preferences.spiceTolerance < 3) {
    if (item.name.toLowerCase().includes('pepper') || item.name.toLowerCase().includes('hot')) {
      notes.push('Use sparingly')
    }
  }
  
  if (preferences?.shoppingFrequency === 'weekly' && item.name.toLowerCase().includes('milk')) {
    notes.push('Buy fresh')
  }
  
  return notes.length > 0 ? notes.join(', ') : undefined
} 