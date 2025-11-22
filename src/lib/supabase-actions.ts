import { supabase } from './supabase';
import { UserProfile, Meal, FoodItem, WeightProgress, DailyProgress } from './types';

// ============ USER PROFILE ============

export async function createUserProfile(profile: UserProfile): Promise<{ data: any; error: any }> {
  // Calcular data de fim do trial (1 dia a partir de agora)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 1);

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      name: profile.name,
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      gender: profile.gender,
      goal: profile.goal,
      target_weight: profile.targetWeight,
      activity_level: profile.activityLevel,
      daily_calorie_goal: profile.dailyCalorieGoal,
      workouts_per_week: profile.workoutsPerWeek,
      weight_goal: profile.weightGoal,
      has_used_calorie_apps: profile.hasUsedCalorieApps,
      previous_apps: profile.previousApps || [],
      barriers: [],
      aspirations: [],
      subscription_status: profile.subscriptionStatus,
      trial_start_date: profile.trialStartDate,
      subscription_end_date: trialEndDate.toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function getUserProfile(userId: string): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.age && { age: updates.age }),
      ...(updates.weight && { weight: updates.weight }),
      ...(updates.height && { height: updates.height }),
      ...(updates.targetWeight && { target_weight: updates.targetWeight }),
      ...(updates.dailyCalorieGoal && { daily_calorie_goal: updates.dailyCalorieGoal }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// ============ MEALS ============

export async function createMeal(userId: string, meal: Omit<Meal, 'id'>): Promise<{ data: any; error: any }> {
  // Criar a refeição
  const { data: mealData, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      timestamp: meal.timestamp.toISOString(),
      image_url: meal.imageUrl || null,
      total_calories: meal.totalCalories,
      total_protein: meal.totalProtein,
      total_carbs: meal.totalCarbs,
      total_fat: meal.totalFat,
    })
    .select()
    .single();

  if (mealError) return { data: null, error: mealError };

  // Criar os itens de comida
  if (meal.foods.length > 0) {
    const foodItems = meal.foods.map(food => ({
      meal_id: mealData.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      portion: food.portion,
    }));

    const { error: foodError } = await supabase
      .from('food_items')
      .insert(foodItems);

    if (foodError) return { data: null, error: foodError };
  }

  // Atualizar progresso diário
  await updateDailyProgress(userId, meal.timestamp, meal.totalCalories);

  return { data: mealData, error: null };
}

export async function getMealsByDate(userId: string, date: Date): Promise<{ data: any[]; error: any }> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Buscar refeições
  const { data: meals, error: mealsError } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startOfDay.toISOString())
    .lte('timestamp', endOfDay.toISOString())
    .order('timestamp', { ascending: false });

  if (mealsError) return { data: [], error: mealsError };
  if (!meals || meals.length === 0) return { data: [], error: null };

  // Buscar food_items para cada refeição
  const mealIds = meals.map(m => m.id);
  const { data: foodItems, error: foodError } = await supabase
    .from('food_items')
    .select('*')
    .in('meal_id', mealIds);

  if (foodError) return { data: [], error: foodError };

  // Combinar meals com seus food_items
  const mealsWithFoods = meals.map(meal => ({
    ...meal,
    food_items: foodItems?.filter(item => item.meal_id === meal.id) || []
  }));

  return { data: mealsWithFoods, error: null };
}

export async function deleteMeal(mealId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId);

  return { error };
}

// ============ WEIGHT PROGRESS ============

export async function addWeightEntry(userId: string, date: Date, weight: number): Promise<{ data: any; error: any }> {
  const dateStr = date.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('weight_progress')
    .upsert({
      user_id: userId,
      date: dateStr,
      weight: weight,
    })
    .select()
    .single();

  return { data, error };
}

export async function getWeightProgress(userId: string, days: number = 30): Promise<{ data: any[]; error: any }> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('weight_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  return { data: data || [], error };
}

// ============ DAILY PROGRESS ============

export async function updateDailyProgress(userId: string, date: Date, caloriesConsumed: number): Promise<{ data: any; error: any }> {
  const dateStr = date.toISOString().split('T')[0];

  // Buscar progresso existente
  const { data: existing } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .single();

  if (existing) {
    // Atualizar existente
    const { data, error } = await supabase
      .from('daily_progress')
      .update({
        calories_consumed: existing.calories_consumed + caloriesConsumed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    return { data, error };
  } else {
    // Buscar meta de calorias do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('daily_calorie_goal')
      .eq('id', userId)
      .single();

    // Criar novo
    const { data, error } = await supabase
      .from('daily_progress')
      .insert({
        user_id: userId,
        date: dateStr,
        calories_consumed: caloriesConsumed,
        calories_goal: profile?.daily_calorie_goal || 2000,
      })
      .select()
      .single();

    return { data, error };
  }
}

export async function getDailyProgress(userId: string, date: Date): Promise<{ data: any; error: any }> {
  const dateStr = date.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .single();

  return { data, error };
}

export async function getProgressHistory(userId: string, days: number = 7): Promise<{ data: any[]; error: any }> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  return { data: data || [], error };
}

// ============ STATS ============

export async function getUserStats(userId: string): Promise<{
  totalMeals: number;
  averageCalories: number;
  currentStreak: number;
  totalDays: number;
}> {
  // Total de refeições
  const { count: totalMeals } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Média de calorias (últimos 7 dias)
  const { data: recentProgress } = await getProgressHistory(userId, 7);
  const averageCalories = recentProgress && recentProgress.length > 0
    ? Math.round(recentProgress.reduce((sum, day) => sum + day.calories_consumed, 0) / recentProgress.length)
    : 0;

  // Streak atual (dias consecutivos com registro)
  const { data: allProgress } = await supabase
    .from('daily_progress')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  let currentStreak = 0;
  if (allProgress && allProgress.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < allProgress.length; i++) {
      const progressDate = new Date(allProgress[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (progressDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    totalMeals: totalMeals || 0,
    averageCalories,
    currentStreak,
    totalDays: allProgress?.length || 0,
  };
}
