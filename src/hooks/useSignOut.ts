import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

/**
 * Custom hook to handle user sign-out functionality
 * @returns An object containing the signOut handler function
 */
export const useSignOut = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('signed out successfully');
      navigate('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('failed to sign out. please try again.');
    }
  };

  return { handleSignOut };
}; 