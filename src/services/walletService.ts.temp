// This is a temporary version to help debug

// Interface for transaction
export interface Transaction {
  id: number;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  date: string;
  userId: string;
}

/**
 * Get user's Buds balance
 * @param userId User ID
 * @returns User's Buds balance
 */
export const getBudsBalance = async (userId: string): Promise<number> => {
  try {
    // For testing, return a mock value
    return 150;
  } catch (error) {
    console.error('Error getting Buds balance:', error);
    return 0;
  }
};

/**
 * Update user's Buds balance
 * @param userId User ID
 * @param newBalance New Buds balance
 */
export const updateBudsBalance = async (userId: string, newBalance: number): Promise<void> => {
  try {
    // For testing, just log
    console.log(`Updated buds balance for ${userId} to ${newBalance}`);
  } catch (error) {
    console.error('Error updating Buds balance:', error);
    throw error;
  }
};

/**
 * Get user's transaction history
 * @param userId User ID
 * @returns Array of transactions
 */
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    return generateMockTransactions(userId);
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

/**
 * Earn Buds for an eco-friendly action
 * @param userId User ID
 * @param amount Amount of Buds to earn
 * @param description Description of the action
 */
export const earnBuds = async (
  userId: string,
  amount: number,
  description: string
): Promise<void> => {
  try {
    console.log(`User ${userId} earned ${amount} Buds for: ${description}`);
  } catch (error) {
    console.error('Error earning Buds:', error);
    throw error;
  }
};

/**
 * Spend Buds for a redemption
 * @param userId User ID
 * @param amount Amount of Buds to spend
 * @param description Description of the redemption
 */
export const spendBuds = async (
  userId: string,
  amount: number,
  description: string
): Promise<boolean> => {
  try {
    console.log(`User ${userId} spent ${amount} Buds for: ${description}`);
    return true;
  } catch (error) {
    console.error('Error spending Buds:', error);
    throw error;
  }
};

// Helper function to generate mock transactions for development
const generateMockTransactions = (userId: string): Transaction[] => {
  const now = new Date();
  
  return [
    {
      id: 1,
      type: 'earned',
      amount: 50,
      description: 'Scanned eco-friendly receipt',
      date: new Date(now.setDate(now.getDate() - 1)).toLocaleDateString(),
      userId
    },
    {
      id: 2,
      type: 'earned',
      amount: 25,
      description: 'Recycled plastic bottle',
      date: new Date(now.setDate(now.getDate() - 3)).toLocaleDateString(),
      userId
    },
    {
      id: 3,
      type: 'earned',
      amount: 100,
      description: 'Completed eco challenge',
      date: new Date(now.setDate(now.getDate() - 7)).toLocaleDateString(),
      userId
    },
    {
      id: 4,
      type: 'spent',
      amount: 75,
      description: 'Redeemed: Early Adopter Badge',
      date: new Date(now.setDate(now.getDate() - 10)).toLocaleDateString(),
      userId
    }
  ];
}; 