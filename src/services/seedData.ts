import { supabase } from './supabaseClient';
import { Category, EcoAction } from '@/types/database';
import { Badge } from './badgeService';

/**
 * Seed categories if they don't exist
 */
export const seedCategories = async (): Promise<void> => {
  const categories: Partial<Category>[] = [
    { name: 'transportation', description: 'Transportation and mobility choices', icon: 'car' },
    { name: 'waste', description: 'Waste reduction and recycling', icon: 'trash' },
    { name: 'energy', description: 'Energy conservation and efficiency', icon: 'zap' },
    { name: 'water', description: 'Water conservation', icon: 'droplet' },
    { name: 'food', description: 'Sustainable food choices', icon: 'utensils' },
    { name: 'shopping', description: 'Eco-friendly purchasing decisions', icon: 'shopping-bag' }
  ];

  // Check if categories already exist
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('name');

  if (existingCategories && existingCategories.length > 0) {
    console.log('Categories already exist, skipping seed');
    return;
  }

  // Insert categories
  const { error } = await supabase
    .from('categories')
    .insert(categories);

  if (error) {
    console.error('Error seeding categories:', error);
  } else {
    console.log('Categories seeded successfully');
  }
};

/**
 * Seed eco actions if they don't exist
 */
export const seedEcoActions = async (): Promise<void> => {
  // First get category IDs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name');

  if (!categories || categories.length === 0) {
    console.error('No categories found, please seed categories first');
    return;
  }

  // Create a map of category names to IDs
  const categoryMap = categories.reduce((map, category) => {
    map[category.name] = category.id;
    return map;
  }, {} as Record<string, string>);

  // Define actions
  const actions: Partial<EcoAction>[] = [
    {
      title: 'Use public transportation',
      description: 'Take the bus or train instead of driving',
      category_id: categoryMap['transportation'],
      impact: 'Reduces carbon emissions by up to 20%',
      co2_saved: 2.5,
      buds_reward: 50,
      is_verified: true
    },
    {
      title: 'Recycle paper and cardboard',
      description: 'Properly sort and recycle paper products',
      category_id: categoryMap['waste'],
      impact: 'Saves trees and reduces landfill waste',
      co2_saved: 1.2,
      buds_reward: 30,
      is_verified: true
    },
    {
      title: 'Use LED light bulbs',
      description: 'Replace incandescent bulbs with energy-efficient LEDs',
      category_id: categoryMap['energy'],
      impact: 'Uses 75% less energy than traditional bulbs',
      co2_saved: 0.8,
      buds_reward: 25,
      is_verified: true
    },
    {
      title: 'Take shorter showers',
      description: 'Limit showers to 5 minutes or less',
      category_id: categoryMap['water'],
      impact: 'Saves up to 10 gallons of water per shower',
      co2_saved: 0.5,
      buds_reward: 20,
      is_verified: true
    }
  ];

  // Check if actions already exist
  const { data: existingActions } = await supabase
    .from('eco_actions')
    .select('title');

  if (existingActions && existingActions.length > 0) {
    console.log('Actions already exist, skipping seed');
    return;
  }

  // Insert actions
  const { error } = await supabase
    .from('eco_actions')
    .insert(actions);

  if (error) {
    console.error('Error seeding eco actions:', error);
  } else {
    console.log('Eco actions seeded successfully');
  }
};

/**
 * Seed badges if they don't exist
 */
export const seedBadges = async (): Promise<void> => {
  const badges: Partial<Badge>[] = [
    { 
      name: 'Early Adopter', 
      description: 'Joined during the platform\'s early days', 
      icon: 'award', 
      category: 'general',
      buds_reward: 100,
      requirements: '{}'
    },
    { 
      name: 'Waste Warrior', 
      description: 'Completed 50+ waste reduction actions', 
      icon: 'trash-2', 
      category: 'waste',
      buds_reward: 200,
      requirements: '{"actions":50,"category":"waste"}'
    },
    { 
      name: 'Transit Champion', 
      description: 'Completed 10+ sustainable transportation actions', 
      icon: 'bus', 
      category: 'transportation',
      buds_reward: 150,
      requirements: '{"actions":10,"category":"transportation"}'
    },
    { 
      name: 'Plant Power', 
      description: 'Enjoyed 15+ meatless meals', 
      icon: 'leaf', 
      category: 'food',
      buds_reward: 150,
      requirements: '{"actions":15,"title":"Ate a meatless meal"}'
    },
    { 
      name: 'Eco Streak', 
      description: 'Completed eco actions for 7 consecutive days', 
      icon: 'calendar', 
      category: 'general',
      buds_reward: 250,
      requirements: '{"streak":7}'
    },
    { 
      name: 'Energy Saver', 
      description: 'Completed energy-saving actions on 30+ different days', 
      icon: 'zap', 
      category: 'energy',
      buds_reward: 300,
      requirements: '{"uniqueDays":30,"category":"energy"}'
    },
    { 
      name: 'Carbon Cutter', 
      description: 'Saved 100+ kg of CO2 emissions', 
      icon: 'cloud', 
      category: 'general',
      buds_reward: 400,
      requirements: '{"co2Saved":100}'
    }
  ];

  // Check if badges already exist
  const { data: existingBadges } = await supabase
    .from('badges')
    .select('name');

  if (existingBadges && existingBadges.length > 0) {
    console.log('Badges already exist, skipping seed');
    return;
  }

  // Insert badges
  const { error } = await supabase
    .from('badges')
    .insert(badges);

  if (error) {
    console.error('Error seeding badges:', error);
  } else {
    console.log('Badges seeded successfully');
  }
};

/**
 * Run all seed functions
 */
export const seedDatabase = async (): Promise<void> => {
  await seedCategories();
  await seedEcoActions();
  await seedBadges();
  console.log('Database seeding complete');
}; 