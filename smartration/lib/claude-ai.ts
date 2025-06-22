import Anthropic from '@anthropic-ai/sdk';

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

interface MealPlan {
  day: string;
  breakfast: {
    name: string;
    ingredients: string[];
    instructions: string;
    nutritionalInfo: string;
    cost: number;
    prepTime: number;
  };
  lunch: {
    name: string;
    ingredients: string[];
    instructions: string;
    nutritionalInfo: string;
    cost: number;
    prepTime: number;
  };
  dinner: {
    name: string;
    ingredients: string[];
    instructions: string;
    nutritionalInfo: string;
    cost: number;
    prepTime: number;
  };
  totalDailyCost: number;
}

interface UserPreferences {
  dietaryRestrictions?: string[];
  allergies?: string[];
  householdSize?: number;
  spiceTolerance?: number;
  maxSpending?: number;
  foodPreferences?: string[];
  cuisinePreferences?: string[];
  avoidIngredients?: string;
  hasChildren?: boolean;
  childrenAges?: string;
  specialDietary?: string;
}

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateMealPlan(
  receiptData: ReceiptData,
  userPreferences: UserPreferences = {}
): Promise<MealPlan[]> {
  try {
    // Create a comprehensive prompt for Claude
    const prompt = createMealPlanPrompt(receiptData, userPreferences)

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse the response to extract meal plans
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const mealPlans = parseMealPlanResponse(responseText, receiptData)
    
    return mealPlans;
  } catch (error) {
    console.error('❌ Error generating meal plan with Claude:', error)
    throw new Error('Failed to generate meal plan')
  }
}

function createMealPlanPrompt(receiptData: ReceiptData, userPreferences: UserPreferences): string {
  const itemsList = receiptData.items
    .map(item => `- ${item.name} ($${item.price.toFixed(2)})`)
    .join('\n');

  const dietaryInfo = userPreferences.dietaryRestrictions?.length 
    ? `\nDietary Restrictions: ${userPreferences.dietaryRestrictions.join(', ')}`
    : '';

  const allergyInfo = userPreferences.allergies?.length
    ? `\nAllergies: ${userPreferences.allergies.join(', ')}`
    : '';

  const householdInfo = userPreferences.householdSize
    ? `\nHousehold Size: ${userPreferences.householdSize} people`
    : '';

  const foodPrefInfo = userPreferences.foodPreferences?.length
    ? `\nFood Preferences: ${userPreferences.foodPreferences.join(', ')}`
    : '';

  const cuisinePrefInfo = userPreferences.cuisinePreferences?.length
    ? `\nCuisine Preferences: ${userPreferences.cuisinePreferences.join(', ')}`
    : '';

  const avoidInfo = userPreferences.avoidIngredients
    ? `\nIngredients to Avoid: ${userPreferences.avoidIngredients}`
    : '';

  const childrenInfo = userPreferences.hasChildren
    ? `\nCooking for Children: Yes (Ages: ${userPreferences.childrenAges || 'Not specified'})`
    : '';

  const specialDietaryInfo = userPreferences.specialDietary
    ? `\nSpecial Dietary Needs: ${userPreferences.specialDietary}`
    : '';

  return `You are a professional nutritionist and meal planning expert. Create a personalized meal plan using ONLY the ingredients from this grocery receipt. The goal is to make nutritious, delicious meals that will last until the next grocery shopping trip.

RECEIPT DATA:
Store: ${receiptData.store || 'Unknown'}
Total Spent: $${receiptData.total.toFixed(2)}
Date: ${receiptData.date || 'Recent'}

INGREDIENTS AVAILABLE:
${itemsList}

USER PREFERENCES:${dietaryInfo}${allergyInfo}${householdInfo}${foodPrefInfo}${cuisinePrefInfo}${avoidInfo}${childrenInfo}${specialDietaryInfo}
Spice Tolerance: ${userPreferences.spiceTolerance || 3}/5
Max Daily Budget: $${userPreferences.maxSpending || 15}

REQUIREMENTS:
1. Use ONLY the ingredients listed above - be creative with substitutions and combinations
2. Create complete daily meal plans with breakfast, lunch, and dinner for each day
3. Each day MUST include all three meals: breakfast, lunch, and dinner
4. Ensure meals are nutritious, balanced, and sustainable
5. Consider food preservation and storage to make ingredients last
6. Include detailed cooking instructions
7. Provide nutritional information (protein, carbs, fat, calories)
8. Calculate cost per meal using the provided prices
9. Include prep time for each meal
10. Make meals that can be prepared with basic cooking equipment
11. Consider leftovers and meal prep strategies
12. Respect all dietary restrictions and allergies
13. Incorporate user's food and cuisine preferences when possible
14. Avoid any ingredients the user has specified they don't want
15. If cooking for children, make meals kid-friendly and appropriate for their ages
16. Consider any special dietary needs or medical conditions
17. If it's not a commonly eaten meal or a meal that is reasonable for human consumption, then don't include it
18. Create as many complete days as possible with the available ingredients

FORMAT YOUR RESPONSE AS JSON:
{
  "mealPlans": [
    {
      "day": "Day 1",
      "breakfast": {
        "name": "Breakfast Meal Name",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "Step-by-step cooking instructions",
        "nutritionalInfo": "Protein: Xg, Carbs: Xg, Fat: Xg, Calories: X",
        "cost": 2.50,
        "prepTime": 15
      },
      "lunch": {
        "name": "Lunch Meal Name",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "Step-by-step cooking instructions",
        "nutritionalInfo": "Protein: Xg, Carbs: Xg, Fat: Xg, Calories: X",
        "cost": 3.50,
        "prepTime": 20
      },
      "dinner": {
        "name": "Dinner Meal Name",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "Step-by-step cooking instructions",
        "nutritionalInfo": "Protein: Xg, Carbs: Xg, Fat: Xg, Calories: X",
        "cost": 4.50,
        "prepTime": 25
      },
      "totalDailyCost": 10.50
    },
    {
      "day": "Day 2",
      "breakfast": { ... },
      "lunch": { ... },
      "dinner": { ... },
      "totalDailyCost": 9.75
    }
  ]
}

IMPORTANT: Each day MUST have breakfast, lunch, and dinner. Do not create partial days or single meals. Create complete daily meal plans.

Focus on creating meals that are:
- Nutritious and balanced
- Cost-effective
- Easy to prepare
- Sustainable (will last until next shopping trip)
- Delicious and satisfying
- Personalized to the user's preferences and restrictions
- Safe for any allergies or dietary restrictions

Be creative with ingredient combinations and cooking methods to maximize the use of available ingredients while respecting all user preferences.`;
}

function parseMealPlanResponse(response: string, receiptData?: ReceiptData): MealPlan[] {
  try {
    console.log('🔍 Claude AI response:', response.substring(0, 500) + '...')
    
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON pattern found in Claude response')
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const mealPlans = parsed.mealPlans || [];
    
    console.log('✅ Successfully parsed meal plans:', mealPlans.length)
    return mealPlans;
  } catch (error) {
    console.error('❌ Error parsing Claude response:', error);
    console.error('❌ Full response:', response);
    // Return a fallback meal plan if parsing fails
    return generateFallbackMealPlan(receiptData);
  }
}

function generateFallbackMealPlan(receiptData?: ReceiptData): MealPlan[] {
  // Fallback meal plan if Claude fails
  const items = receiptData?.items || []
  const availableIngredients = items.map(item => item.name).slice(0, 5) // Use first 5 items
  
  return [
    {
      day: "Day 1",
      breakfast: {
        name: "Simple Breakfast",
        ingredients: availableIngredients.length > 0 ? [availableIngredients[0]] : ["Bread", "Eggs"],
        instructions: "Prepare a simple breakfast using available ingredients.",
        nutritionalInfo: "Protein: 12g, Carbs: 15g, Fat: 8g, Calories: 200",
        cost: items.length > 0 ? Math.min(items[0].price, 3.00) : 2.00,
        prepTime: 10
      },
      lunch: {
        name: "Basic Lunch",
        ingredients: availableIngredients.length > 1 ? [availableIngredients[1]] : ["Bread", "Cheese"],
        instructions: "Make a simple lunch using available ingredients.",
        nutritionalInfo: "Protein: 15g, Carbs: 25g, Fat: 10g, Calories: 300",
        cost: items.length > 1 ? Math.min(items[1].price, 4.00) : 3.00,
        prepTime: 5
      },
      dinner: {
        name: "Simple Dinner",
        ingredients: availableIngredients.length > 2 ? [availableIngredients[2]] : ["Pasta", "Sauce"],
        instructions: "Prepare a simple dinner using available ingredients.",
        nutritionalInfo: "Protein: 18g, Carbs: 45g, Fat: 12g, Calories: 400",
        cost: items.length > 2 ? Math.min(items[2].price, 5.00) : 4.00,
        prepTime: 20
      },
      totalDailyCost: items.length > 0 ? 
        Math.min(items.reduce((sum, item) => sum + item.price, 0), 10.00) : 9.00
    }
  ];
}

export async function generateFoodGPTResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  try {
    // Create a comprehensive prompt for FoodGPT
    const prompt = createFoodGPTPrompt(userMessage, conversationHistory)

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return responseText;
  } catch (error) {
    console.error('❌ Error generating FoodGPT response:', error)
    throw new Error('Failed to generate response')
  }
}

function createFoodGPTPrompt(
  userMessage: string, 
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  const historyContext = conversationHistory.length > 0 
    ? `\n\nCONVERSATION HISTORY:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
    : '';

  return `You are FoodGPT, a friendly and knowledgeable food assistant. You help users with recipes, meal planning, cooking tips, dietary advice, and all things food-related. You should be:

1. **Helpful and Informative**: Provide practical, actionable advice
2. **Friendly and Engaging**: Use a warm, conversational tone with food emojis when appropriate
3. **Personalized**: Consider the user's context and previous questions
4. **Safe**: Always mention food safety and allergy considerations when relevant
5. **Creative**: Suggest interesting recipe variations and cooking techniques
6. **Budget-Conscious**: Include cost-saving tips and budget-friendly alternatives
7. **Health-Focused**: Provide nutritional insights and healthy eating tips

Your expertise includes:
- Recipe development and modification
- Meal planning and prep strategies
- Cooking techniques and tips
- Dietary restrictions and allergies
- Budget-friendly cooking
- Food storage and preservation
- Nutritional guidance
- Kitchen equipment recommendations
- Time-saving cooking methods
- Family-friendly meal ideas

${historyContext}

USER'S QUESTION: ${userMessage}

Please provide a helpful, engaging response that addresses their question. If they're asking about recipes, include ingredients, instructions, and tips. If they're asking about meal planning, provide actionable strategies. If they're asking about cooking techniques, explain the process clearly. Always be encouraging and make cooking feel accessible and enjoyable!`;
} 