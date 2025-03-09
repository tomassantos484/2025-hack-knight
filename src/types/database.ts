// Database types for Supabase

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in: string | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  buds_balance: number;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_actions_completed: number;
  total_carbon_footprint: number;
  total_buds_earned: number;
  total_buds_spent: number;
  eco_friendly_percentage: number;
  average_eco_score: number;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface EcoAction {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  impact: string;
  co2_saved: number | null;
  buds_reward: number;
  image_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface UserAction {
  id: string;
  user_id: string;
  action_id: string;
  completed_at: string;
  notes: string | null;
  buds_earned: number;
  is_verified: boolean;
  created_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  store_name: string | null;
  purchase_date: string;
  total_amount: number;
  eco_score: number | null;
  carbon_footprint: number | null;
  buds_earned: number;
  eco_items_count: number;
  total_items_count: number;
  created_at: string;
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  category: string | null;
  price: number;
  quantity: number;
  is_eco_friendly: boolean;
  carbon_footprint: number | null;
  suggestion: string | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  impact: string;
  buds_reward: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'active' | 'completed' | 'abandoned';
  joined_at: string;
  completed_at: string | null;
  buds_earned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  requirements: Record<string, unknown>; // JSONB type
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
} 