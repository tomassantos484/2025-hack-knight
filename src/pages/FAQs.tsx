import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { ChevronDown, ChevronUp } from 'lucide-react';

// FAQ item interface
interface FAQItem {
  question: string;
  answer: string;
}

const FAQs = () => {
  // State to track which FAQ is expanded
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // Toggle FAQ expansion
  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  // FAQ data
  const faqs: FAQItem[] = [
    {
      question: "What is EcoVision Tracker?",
      answer: "EcoVision Tracker is your personal sustainability companion that makes eco-friendly living accessible and rewarding. By combining intuitive tracking tools with AI-powered features, we help you build sustainable habits and measure your positive environmental impact."
    },
    {
      question: "How does the AI Trash Scanner work?",
      answer: "Our AI Trash Scanner uses Google's Gemini AI to analyze photos of waste items. Simply take a photo of an item, and our AI will classify it as recyclable, compostable, or landfill waste. You'll also receive educational tips on proper disposal and earn Buds rewards for recycling correctly."
    },
    {
      question: "What are Buds and how do I earn them?",
      answer: "Buds are our eco-currency that you earn for sustainable actions. You can earn Buds by logging eco-friendly activities, using our AI Trash Scanner, completing challenges, and maintaining eco streaks. Buds can be redeemed for merchandise or donations to environmental causes."
    },
    {
      question: "How do I track my environmental impact?",
      answer: "Your Dashboard shows metrics like your eco streak, carbon footprint reduction, and waste diversion rate. Each eco action you log contributes to these metrics, giving you a clear picture of your environmental impact over time."
    },
    {
      question: "What are badges and how do I earn them?",
      answer: "Badges are achievements you earn for reaching sustainability milestones. You can earn badges like 'Early Adopter,' 'Waste Warrior,' and 'Carbon Cutter' by completing specific actions or challenges. View your badges in your Profile section."
    },
    {
      question: "Is my data private and secure?",
      answer: "Yes, we take your privacy seriously. Your personal information is encrypted and stored securely. You can control your privacy settings in your Profile, including options to anonymize your statistics and manage how your data is used."
    },
    {
      question: "How can I contact support?",
      answer: "If you have any questions or issues, you can contact our support team through the Contact Support page in your Profile settings, or email us directly at support@ecovision.example.com."
    }
  ];
  
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Frequently Asked Questions
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-eco-dark/70 mb-8"
        >
          Find answers to common questions about EcoVision Tracker.
        </motion.p>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.05) }}
              className="border border-eco-lightGray rounded-lg overflow-hidden"
            >
              <div 
                className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-eco-cream/20"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="font-medium">{faq.question}</h3>
                {expandedIndex === index ? (
                  <ChevronUp size={20} className="text-eco-dark/60" />
                ) : (
                  <ChevronDown size={20} className="text-eco-dark/60" />
                )}
              </div>
              
              {expandedIndex === index && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-4 bg-eco-cream/10 border-t border-eco-lightGray"
                >
                  <p className="text-eco-dark/80">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-eco-green/5 border border-eco-green/20 rounded-xl">
          <h2 className="font-medium mb-2">Still have questions?</h2>
          <p className="text-eco-dark/70 mb-4">
            If you couldn't find the answer you were looking for, feel free to reach out to our support team.
          </p>
          <a 
            href="/contact-support"
            className="inline-block px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-green/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FAQs; 