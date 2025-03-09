import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { CheckCircle, Leaf, Zap, PiggyBank, Recycle, Award, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

const Features = () => {
  const features = [
    {
      icon: <Recycle className="w-10 h-10 text-eco-green" />,
      title: "trash scanner",
      description: "our AI-powered scanner identifies items and provides guidance on recycling, composting, or proper disposal methods.",
      benefits: [
        "reduce waste contamination",
        "learn proper recycling habits",
        "decrease landfill contributions"
      ]
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-eco-green" />,
      title: "progress Tracking",
      description: "monitor your environmental impact with detailed statistics and visualizations. watch your eco-footprint shrink over time.",
      benefits: [
        "visual progress metrics",
        "monthly impact reports",
        "customizable goals"
      ]
    },
    {
      icon: <Award className="w-10 h-10 text-eco-green" />,
      title: "eco challenges",
      description: "engage in daily and weekly challenges to develop sustainable habits. compete with friends and earn badges for your achievements.",
      benefits: [
        "gamified sustainability",
        "learn new eco habits",
        "community engagement"
      ]
    },
    {
      icon: <Leaf className="w-10 h-10 text-eco-green" />,
      title: "eco tips",
      description: "receive personalized recommendations and tips to reduce your environmental footprint in daily life.",
      benefits: [
        "personalized guidance",
        "easy implementation",
        "cumulative impact"
      ]
    },
    {
      icon: <PiggyBank className="w-10 h-10 text-eco-green" />,
      title: "eco Wallet",
      description: "earn eco-credits for your sustainable actions. redeem them for discounts on eco-friendly products from our partners.",
      benefits: [
        "rewards for eco actions",
        "partner discounts",
        "track savings"
      ]
    },
    {
      icon: <Users className="w-10 h-10 text-eco-green" />,
      title: "community connection",
      description: "connect with like-minded individuals in your area. organize and participate in local environmental initiatives.",
      benefits: [
        "local connections",
        "community events",
        "collaborative impact"
      ]
    },
  ];

  const [receipt, setReceipt] = useState(null);
  const [ecoScore, setEcoScore] = useState(null);
  const [carbonFootprint, setCarbonFootprint] = useState(null);

  const handleFileChange = (event) => {
    setReceipt(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!receipt) return;

    const formData = new FormData();
    formData.append('file', receipt);

    try {
      const response = await axios.post('https://api.gemini.com/v1/receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
        }
      });
      console.log('Gemini API Response:', response.data);
      const items = response.data.items; // Ensure this is the correct path to items
      analyzeItems(items);
    } catch (error) {
      console.error('Error uploading receipt:', error);
    }
  };

  const analyzeItems = (items) => {
    let ecoFriendlyCount = 0;

    items.forEach(item => {
      if (isEcoFriendly(item)) {
        ecoFriendlyCount++;
      }
    });

    const score = (ecoFriendlyCount / items.length) * 100;
    setEcoScore(score);
    calculateCarbonFootprint(items);
  };

  const isEcoFriendly = (item) => {
    // Implement AI-driven logic or use a service to determine if an item is eco-friendly
    return item.toLowerCase().includes('organic') || item.toLowerCase().includes('reusable');
  };

  const calculateCarbonFootprint = async (items) => {
    try {
      const response = await axios.post('https://beta3.api.climatiq.io/estimate', {
        items: items.map(item => ({
          name: item,
          quantity: 1
        }))
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`
        }
      });
      setCarbonFootprint(response.data.total_carbon);
    } catch (error) {
      console.error('error calculating carbon footprint:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl text-eco-dark mb-6">ecovision features</h1>
          <p className="text-lg text-eco-dark/80 max-w-2xl mx-auto">
            comprehensive tools to help you track, reduce, and optimize your environmental impact while building sustainable habits.
          </p>
        </motion.div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 hover:border-eco-green transition-all duration-300 hover:shadow-md"
            >
              <div className="flex justify-center md:justify-start">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-eco-green/10 mb-6">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-eco-dark mb-4 text-center md:text-left">
                {feature.title}
              </h3>
              <p className="text-eco-dark/80 mb-6 text-center md:text-left">
                {feature.description}
              </p>
              <div className="space-y-2 text-sm">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-eco-green mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-eco-dark/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-eco-cream rounded-2xl p-8 md:p-12 text-center"
        >
          <Zap className="w-12 h-12 text-eco-green mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-eco-dark mb-4">
            ready to transform your environmental impact?
          </h2>
          <p className="text-lg text-eco-dark/80 max-w-2xl mx-auto mb-8">
            join thousands of users who are making a difference every day with ecovision.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-eco-green text-white px-8 py-3 rounded-md inline-flex items-center space-x-2 hover:bg-eco-green/90 transition-colors"
          >
            <Link to="/sign-up" className="flex items-center space-x-2">
              <span>sign up now</span>
            </Link>
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Features; 