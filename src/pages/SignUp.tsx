import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SignUp as ClerkSignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';

const SignUp = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the redirect URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';
  
  // Debug log for authentication state
  useEffect(() => {
    console.log('Auth state in SignUp:', { isSignedIn });
  }, [isSignedIn]);
  
  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      toast.success('Account created successfully');
      
      // Add a small delay to ensure the toast is shown
      setTimeout(() => {
        // Store a flag to indicate we're coming from sign-up
        sessionStorage.setItem('justAuthenticated', 'true');
        
        // Use window.location for a full page reload to ensure Clerk state is synchronized
        window.location.href = redirectUrl.startsWith('/') 
          ? redirectUrl 
          : `/${redirectUrl}`;
      }, 300);
    }
  }, [isSignedIn, redirectUrl]);
  
  // Handle navigation to sign in page
  const handleSignInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    navigate('/sign-in');
  };
  
  return (
    <Layout>
      <section className="py-8 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto px-4"
        >
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-eco-dark mb-2">Join EcoVision</h1>
            <p className="text-eco-dark/70">Create an account to start your eco journey</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <ClerkSignUp 
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              redirectUrl={redirectUrl}
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none p-0 w-full max-w-full bg-white rounded-xl',
                  header: 'hidden',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50',
                  socialButtonsBlockButtonText: 'font-normal',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-500 text-sm',
                  formFieldLabel: 'text-eco-dark',
                  formFieldInput: 'border-gray-300 focus:border-eco-green focus:ring focus:ring-eco-green/20',
                  footer: 'pb-4',
                  main: 'pt-4 px-4 sm:px-6',
                  form: 'gap-3',
                  formButtonPrimary: 'bg-eco-green hover:bg-eco-green/90',
                  formButtonPrimary__loading: 'bg-eco-green/70',
                  footerActionLink: 'text-eco-green hover:text-eco-green/90',
                  identityPreview: 'hidden',
                  identityPreviewText: 'hidden',
                  identityPreviewEditButton: 'hidden',
                  formFieldAction: 'text-eco-green',
                  formFieldHintText: 'text-gray-500',
                  otpCodeFieldInputs: 'gap-2',
                  otpCodeFieldInput: 'border-gray-300 focus:border-eco-green focus:ring focus:ring-eco-green/20',
                  alert: 'bg-red-50 border-red-100 text-red-600',
                  alertText: 'text-red-600',
                  socialButtonsIconButton: 'border-gray-200 hover:bg-gray-50',
                  footerAction: 'custom-footer-action'
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  showOptionalFields: false,
                  shimmer: false
                },
                variables: {
                  borderRadius: '0.75rem',
                  colorBackground: 'white',
                  colorPrimary: '#2F855A',
                  colorText: '#333333',
                  colorTextSecondary: '#666666',
                  colorDanger: '#DC2626',
                  colorSuccess: '#059669'
                }
              }}
            />
          )}
          
          {/* Custom sign in link for smoother navigation */}
          <div className="text-center mt-4">
            <p className="text-eco-dark/70">
              Already have an account?{' '}
              <Link 
                to="/sign-in" 
                onClick={handleSignInClick}
                className="text-eco-green font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default SignUp; 