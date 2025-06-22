-- Migration to fix foreign key constraints for weekly meal plan system

-- First, drop the existing foreign key constraints
ALTER TABLE saved_meals DROP CONSTRAINT IF EXISTS saved_meals_meal_plan_id_fkey;
ALTER TABLE meal_ratings DROP CONSTRAINT IF EXISTS meal_ratings_meal_plan_id_fkey;

-- Add new foreign key constraints pointing to weekly_meal_plans
ALTER TABLE saved_meals 
ADD CONSTRAINT saved_meals_meal_plan_id_fkey 
FOREIGN KEY (meal_plan_id) REFERENCES weekly_meal_plans(id) ON DELETE CASCADE;

ALTER TABLE meal_ratings 
ADD CONSTRAINT meal_ratings_meal_plan_id_fkey 
FOREIGN KEY (meal_plan_id) REFERENCES weekly_meal_plans(id) ON DELETE CASCADE;

-- Update the column comments to reflect the change
COMMENT ON COLUMN saved_meals.meal_plan_id IS 'References weekly_meal_plans.id';
COMMENT ON COLUMN meal_ratings.meal_plan_id IS 'References weekly_meal_plans.id'; 