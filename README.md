# SmartRation - AI-Powered Meal Planning & Nutrition

SmartRation is an intelligent meal planning application that uses AI to help users create personalized meal plans, analyze food intake, and make healthier dietary choices.

## Features

- 🤖 **AI-Powered Meal Planning** - Get personalized meal recommendations based on your preferences and dietary needs
- 📸 **Receipt Analysis** - Upload grocery receipts to automatically track your food purchases
- 🛒 **Smart Shopping Lists** - Generate shopping lists based on your meal plans
- 📊 **Nutrition Analytics** - Track your eating habits and nutritional intake
- 💾 **Save & Rate Meals** - Save your favorite meals and rate them for better recommendations
- 🔐 **User Authentication** - Secure login with email verification

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (Auth, Database)
- **AI**: Anthropic Claude AI, Google Cloud Vision API
- **Deployment**: Vercel

## Getting Started

1. Navigate to the `smartration` directory:
   ```bash
   cd smartration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (see `smartration/SUPABASE_SETUP.md`)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

```
smartration/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   └── ...
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with descriptive messages
5. Push to your branch
6. Create a pull request

## License

This project is part of a hackathon submission. 