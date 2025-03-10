import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Send, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

//
// Support request categories
const categories = [
  'Account Issues',
  'App Functionality',
  'Trash Scanner',
  'Eco Actions',
  'Badges & Rewards',
  'Billing & Payments',
  'Bug Report',
  'Feature Request',
  'Other'
];

const ContactSupport = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    category: '',
    subject: '',
    message: '',
    attachScreenshot: false
  });
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Submit form
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast.success('Your support request has been submitted successfully');
      
      // Reset form
      setFormData({
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        category: '',
        subject: '',
        message: '',
        attachScreenshot: false
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Contact Support
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-eco-dark/70 mb-8"
        >
          Need help? Fill out the form below and our support team will get back to you within 24 hours.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-eco-lightGray rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-eco-lightGray rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-eco-lightGray rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-eco-lightGray rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-eco-lightGray rounded-md"
                required
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="attachScreenshot"
                  checked={formData.attachScreenshot}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <span className="text-sm">Attach system information to help us troubleshoot</span>
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-green/90 transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-eco-cream/30 rounded-xl p-6 flex">
            <Mail size={24} className="text-eco-green mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Email Us Directly</h3>
              <p className="text-sm text-eco-dark/70 mb-2">
                For urgent matters, you can email our support team directly.
              </p>
              <a 
                href="mailto:support@ecovision.example.com" 
                className="text-eco-green hover:underline"
              >
                support@ecovision.example.com
              </a>
            </div>
          </div>
          
          <div className="bg-eco-cream/30 rounded-xl p-6 flex">
            <MessageSquare size={24} className="text-eco-green mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Live Chat</h3>
              <p className="text-sm text-eco-dark/70 mb-2">
                Available Monday to Friday, 9am to 5pm EST.
              </p>
              <button className="text-eco-green hover:underline">
                Start a chat session
              </button>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex"
        >
          <AlertCircle size={24} className="text-yellow-600 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-1">Before Contacting Support</h3>
            <p className="text-sm text-yellow-700">
              Please check our <a href="/faqs" className="text-eco-green hover:underline">FAQs</a> to see if your question has already been answered. This may save you time and help you resolve your issue faster.
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ContactSupport; 