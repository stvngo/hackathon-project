# Supabase Setup Guide for SmartRation

## Prerequisites
1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. A Google Cloud Vision API key

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 2: Get Your Google Vision API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Cloud Vision API
4. Go to **APIs & Services** → **Credentials**
5. Create a new API key
6. Copy the API key (starts with `AIza...`)

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Cloud Vision API
GOOGLE_VISION_API_KEY=your_google_vision_api_key
```

Replace the values with your actual credentials:
- `your_supabase_project_url`: Your Supabase project URL
- `your_supabase_anon_key`: Your Supabase anon/public key
- `your_google_vision_api_key`: Your Google Vision API key

## Step 4: Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add the following URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/verify-email`
     - `http://localhost:3000/email-verified`
     - `http://localhost:3000/onboarding`
   - **Email Templates**: Customize if desired

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email settings as needed

## Step 6: Create Database Tables

Create these tables in your Supabase database:

```sql
-- Users profile table with onboarding data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  onboarding_data JSONB,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts table
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  store_name TEXT,
  total_amount DECIMAL(10,2),
  receipt_date DATE,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal plans table
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  receipt_id UUID REFERENCES receipts(id),
  meal_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 7: Set Up Row Level Security (RLS)

Enable RLS on your tables and create policies:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Receipts policies
CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meal plans policies
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 8: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try signing up with a new account
4. Complete the onboarding process
5. Test the receipt upload functionality

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**: Double-check your Supabase URL and anon key
2. **Google Vision API errors**: Verify your Google Vision API key is correct and the API is enabled
3. **CORS errors**: Make sure your site URL is correctly configured in Supabase
4. **Email not sending**: Check your Supabase email settings and spam folder
5. **Authentication redirect loops**: Verify your redirect URLs are correct
6. **Onboarding data not saving**: Check that the profiles table has the onboarding_data JSONB column

### Getting Help:

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js Supabase integration guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- Check the [Google Cloud Vision API documentation](https://cloud.google.com/vision/docs)
- Check the browser console for detailed error messages

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your API keys
- Monitor your Supabase usage and billing
- Set up API key restrictions in Google Cloud Console for production 