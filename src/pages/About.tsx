import React, { useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import LandingLayout from '../components/LandingLayout';
import { Leaf, ArrowRight } from 'lucide-react';

const About = () => {
  // Use useLayoutEffect to ensure scroll position is set before browser paint
  useLayoutEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Also set body scroll position
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  return (
    <LandingLayout>
      <section className="py-12 pattern-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-center gap-12"
          >
            {/* Team Image */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex-1"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg eco-shadow">
                <img 
                  src="/ecovision_team.jpeg" 
                  alt="ecovision team" 
                  className="w-full h-auto object-cover aspect-[4/3]" 
                />
              </div>
            </motion.div>
            
            {/* About Content */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center mb-2 bg-eco-green/10 px-4 py-1.5 rounded-full">
                <Leaf size={16} className="text-eco-green mr-2" />
                <span className="text-sm text-eco-dark/80">our story</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl text-eco-dark">meet the team behind ecovision</h2>
              
              <p className="text-lg text-eco-dark/80 leading-relaxed">
                we're a passionate group of environmentalists, designers, and developers united by a common goal: 
                to make sustainability accessible and measurable for everyone. our diverse backgrounds bring 
                unique perspectives to solving one of the most pressing challenges of our time.
              </p>
              
              <p className="text-lg text-eco-dark/80 leading-relaxed">
                founded in 2025, our team is committed to creating intuitive tools that help individuals 
                understand and reduce their environmental impact through small, consistent actions.
              </p>
              
              <div className="pt-6 pb-2">
                <h3 className="text-2xl font-medium text-eco-dark mb-4">our mission</h3>
                <p className="text-lg text-eco-dark/80 leading-relaxed">
                  at ecovision, we believe that environmental sustainability starts with individual awareness and action.
                  our mission is to empower people with the tools they need to make informed decisions about their daily habits
                  and track the positive impact these changes have on our planet.
                </p>
              </div>
              
              <div className="pt-2">
                <h3 className="text-2xl font-medium text-eco-dark mb-4">our values</h3>
                <ul className="space-y-3 text-lg text-eco-dark/80">
                  <li className="flex items-start">
                    <Leaf size={18} className="text-eco-green mr-2 mt-1.5 flex-shrink-0" />
                    <span>transparency in all we do</span>
                  </li>
                  <li className="flex items-start">
                    <Leaf size={18} className="text-eco-green mr-2 mt-1.5 flex-shrink-0" />
                    <span>innovation for ecological solutions</span>
                  </li>
                  <li className="flex items-start">
                    <Leaf size={18} className="text-eco-green mr-2 mt-1.5 flex-shrink-0" />
                    <span>accessibility for everyone</span>
                  </li>
                  <li className="flex items-start">
                    <Leaf size={18} className="text-eco-green mr-2 mt-1.5 flex-shrink-0" />
                    <span>community-driven environmental change</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default About;
