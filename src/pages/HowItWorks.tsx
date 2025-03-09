import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { ArrowRight, Recycle, Leaf, Award, Camera, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const features = [
    {
      icon: <Camera className="w-8 h-8 text-eco-green" />,
      title: "trash scanner",
      description: "use our ai-powered scanner to identify and properly sort your waste items, ensuring correct recycling practices."
    },
    {
      icon: <LineChart className="w-8 h-8 text-eco-green" />,
      title: "progress tracking",
      description: "monitor your environmental impact through detailed statistics and visualizations of your eco-friendly actions."
    },
    {
      icon: <Award className="w-8 h-8 text-eco-green" />,
      title: "eco challenges",
      description: "participate in daily and weekly challenges to develop sustainable habits and earn recognition."
    },
    {
      icon: <Leaf className="w-8 h-8 text-eco-green" />,
      title: "eco tips",
      description: "get personalized recommendations and tips to reduce your environmental footprint in your daily life."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "sign up",
      description: "create your account to start your sustainability journey with ecovision."
    },
    {
      number: "02",
      title: "track actions",
      description: "log your daily eco-friendly actions and use our trash scanner for proper waste management."
    },
    {
      number: "03",
      title: "complete challenges",
      description: "participate in challenges to develop sustainable habits and make a bigger impact."
    },
    {
      number: "04",
      title: "monitor progress",
      description: "track your progress and see your positive impact on the environment grow over time."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl text-eco-dark mb-6">how ecovision works</h1>
          <p className="text-lg text-eco-dark/80 max-w-2xl mx-auto">
            join us in making a positive impact on the environment through our innovative platform that makes sustainable living easy and rewarding.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-gray-200 hover:border-eco-green transition-colors"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-eco-dark mb-2">{feature.title}</h3>
              <p className="text-eco-dark/80">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Steps Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-eco-cream rounded-2xl p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-eco-dark mb-12 text-center">
            getting started is easy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
                className="relative"
              >
                <div className="text-4xl font-bold text-eco-green/20 mb-2">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-eco-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-eco-dark/80">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 transform translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-eco-green/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-eco-dark mb-6">
            ready to make a difference?
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-eco-green text-white px-10 py-4 rounded-full shadow-lg font-semibold inline-flex items-center space-x-3 hover:bg-eco-green/90 transition-colors"
          >
            <Link to="/sign-up" className="flex items-center space-x-2">
              <span>get started today</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default HowItWorks; 