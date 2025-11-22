import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          age: number;
          weight: number;
          height: number;
          gender: 'male' | 'female' | 'other';
          goal: 'lose' | 'gain' | 'maintain';
          target_weight: number;
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          daily_calorie_goal: number;
          workouts_per_week: '0-2' | '3-5' | '6+';
          weight_goal: 'lose_fast' | 'lose_moderate' | 'lose_slow' | 'maintain' | 'gain_slow' | 'gain_moderate' | 'gain_fast';
          has_used_calorie_apps: boolean;
          previous_apps: string[] | null;
          barriers: string[] | null;
          aspirations: string[] | null;
          subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
          trial_start_date: string;
          subscription_end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          image_url: string | null;
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['meals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['meals']['Insert']>;
      };
      food_items: {
        Row: {
          id: string;
          meal_id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          portion: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['food_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['food_items']['Insert']>;
      };
      weight_progress: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weight_progress']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['weight_progress']['Insert']>;
      };
      daily_progress: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          calories_consumed: number;
          calories_goal: number;
          weight: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_progress']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['daily_progress']['Insert']>;
      };
    };
  };
}
