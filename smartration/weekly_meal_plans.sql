-- Create weekly_meal_plans table
CREATE TABLE IF NOT EXISTS weekly_meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  meal_plan JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one meal plan per user per week
CREATE UNIQUE INDEX IF NOT EXISTS weekly_meal_plans_user_week_idx 
ON weekly_meal_plans(user_id, week_start);

-- Enable RLS
ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own weekly meal plans" ON weekly_meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly meal plans" ON weekly_meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly meal plans" ON weekly_meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly meal plans" ON weekly_meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_weekly_meal_plans_updated_at 
  BEFORE UPDATE ON weekly_meal_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 