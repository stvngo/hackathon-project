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
    const mealPlans = parseMealPlanResponse(responseText)
    
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
2. Create as many meals within reason for an average human being to consume 
3. Ensure meals are nutritious, balanced, and sustainable
4. Consider food preservation and storage to make ingredients last
5. Include detailed cooking instructions
6. Provide nutritional information (protein, carbs, fat, calories)
7. Calculate cost per meal using the provided prices
8. Include prep time for each meal
9. Make meals that can be prepared with basic cooking equipment
10. Consider leftovers and meal prep strategies
11. Respect all dietary restrictions and allergies
12. Incorporate user's food and cuisine preferences when possible
13. Avoid any ingredients the user has specified they don't want
14. If cooking for children, make meals kid-friendly and appropriate for their ages
15. Consider any special dietary needs or medical conditions
16. if its not a commonly eaten meal or a meal that is reasonable for human consumption, then don't include it. 

FORMAT YOUR RESPONSE AS JSON:
{
  "mealPlans": [
    {
      "day": "Day 1",
      "breakfast": {
        "name": "Meal Name",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "Step-by-step cooking instructions",
        "nutritionalInfo": "Protein: Xg, Carbs: Xg, Fat: Xg, Calories: X",
        "cost": 2.50,
        "prepTime": 15
      },
      "lunch": { ... },
      "dinner": { ... },
      "totalDailyCost": 8.50
    }
  ]
}

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

function parseMealPlanResponse(response: string): MealPlan[] {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const mealPlans = parsed.mealPlans || [];
    
    return mealPlans;
  } catch (error) {
    console.error('❌ Error parsing Claude response:', error);
    // Return a fallback meal plan if parsing fails
    return generateFallbackMealPlan();
  }
}

function generateFallbackMealPlan(): MealPlan[] {
  // Fallback meal plan if Claude fails
  return [
    {
      day: "Day 1",
      breakfast: {
        name: "Simple Breakfast",
        ingredients: ["Bread", "Eggs", "Butter"],
        instructions: "Toast bread and fry eggs. Serve with butter.",
        nutritionalInfo: "Protein: 12g, Carbs: 15g, Fat: 8g, Calories: 200",
        cost: 2.00,
        prepTime: 10
      },
      lunch: {
        name: "Basic Lunch",
        ingredients: ["Bread", "Cheese", "Vegetables"],
        instructions: "Make a sandwich with cheese and vegetables.",
        nutritionalInfo: "Protein: 15g, Carbs: 25g, Fat: 10g, Calories: 300",
        cost: 3.00,
        prepTime: 5
      },
      dinner: {
        name: "Simple Dinner",
        ingredients: ["Pasta", "Tomato sauce", "Cheese"],
        instructions: "Cook pasta, add sauce and cheese.",
        nutritionalInfo: "Protein: 18g, Carbs: 45g, Fat: 12g, Calories: 400",
        cost: 4.00,
        prepTime: 20
      },
      totalDailyCost: 9.00
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