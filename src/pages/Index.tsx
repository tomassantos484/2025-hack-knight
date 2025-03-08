//import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LandingLayout from '../components/LandingLayout';
import { ArrowRight, Leaf, Calendar, Upload, BarChart3, Globe, Lightbulb, LineChart, Camera, PieChart, TreePine, Wallet, Receipt } from 'lucide-react';

const Index = () => {
  return (
    <LandingLayout>
      {/* Hero Section - Full Screen Height */}
      <section id="home" className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-10 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="leaf-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 2C14.5 2 10 6.5 10 12C10 17.5 14.5 22 20 22C25.5 22 30 17.5 30 12C30 6.5 25.5 2 20 2ZM20 20C15.6 20 12 16.4 12 12C12 7.6 15.6 4 20 4C24.4 4 28 7.6 28 12C28 16.4 24.4 20 20 20Z" fill="#2F855A" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
          </svg>
        </div>
        
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-eco-cream/40 to-white pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center max-w-6xl mx-auto text-center z-10"
        >
          <div className="inline-flex items-center mb-8 bg-eco-green/10 px-4 py-1.5 rounded-full">
            <Leaf size={16} className="text-eco-green mr-2" />
            <span className="text-sm text-eco-dark/80">sustainability made simple</span>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-medium mb-8 text-eco-dark tracking-tight leading-tight"
          >
            track your personal <br />sustainability journey
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-eco-dark/80 mb-12 max-w-2xl leading-relaxed"
          >
            log eco-friendly actions, scan trash, track your impact, and make a difference for our planet with our beautiful, intuitive dashboard
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex gap-4"
          >
            <Link to="/sign-up">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-eco-green text-white px-6 py-3 rounded-full flex items-center space-x-2"
              >
                <span>get started</span>
                <ArrowRight size={16} className="ml-2" />
              </motion.button>
            </Link>
            <a href="#how-it-works">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-eco-cream border border-eco-green/20 text-eco-dark px-6 py-3 rounded-full flex items-center"
              >
                <span>learn more</span>
                <ArrowRight size={16} className="ml-2" />
              </motion.button>
            </a>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex flex-col items-center"
            >
              <span className="text-xs text-eco-dark/60 mb-2">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-eco-dark/30 rounded-full flex justify-center">
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-1.5 h-1.5 bg-eco-green rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-medium text-eco-dark mb-4">how it works</h2>
            <p className="text-lg text-eco-dark/80 max-w-2xl mx-auto">
              begin your sustainability journey in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Log Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-6">
                <Calendar size={42} className="text-eco-green" />
              </div>
              <h3 className="text-xl font-medium text-eco-dark mb-3">log actions</h3>
              <p className="text-eco-dark/80 leading-relaxed">
                record your daily eco-friendly actions to build sustainable habits
              </p>
            </motion.div>

            {/* Scan Trash */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-6">
                <Upload size={42} className="text-eco-green" />
              </div>
              <h3 className="text-xl font-medium text-eco-dark mb-3">scan trash</h3>
              <p className="text-eco-dark/80 leading-relaxed">
                upload photos of items to learn how to dispose of them properly
              </p>
            </motion.div>

            {/* Track Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-6">
                <BarChart3 size={42} className="text-eco-green" />
              </div>
              <h3 className="text-xl font-medium text-eco-dark mb-3">track progress</h3>
              <p className="text-eco-dark/80 leading-relaxed">
                visualize your environmental impact and celebrate your achievements
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 pattern-bg w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-medium text-eco-dark mb-4">Why Choose EcoVision?</h2>
            <p className="text-lg text-eco-dark/80 max-w-2xl mx-auto">
              Our platform provides the tools you need to make sustainable choices and track your positive impact on the environment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Community Impact */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-6">
                <Globe size={42} className="text-eco-green" />
              </div>
              <h3 className="text-xl font-medium text-eco-dark mb-3">Community Impact</h3>
              <p className="text-eco-dark/80 leading-relaxed">
                Join thousands of environmentally conscious individuals working together to create a more sustainable future.
              </p>
            </motion.div>

            {/* Trash Scanner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-6">
                <Camera size={42} className="text-eco-green" />
              </div>
              <h3 className="text-xl font-medium text-eco-dark mb-3">Trash Scanner</h3>
              <p className="text-eco-dark/80 leading-relaxed">
                Upload photos of waste items to learn how to properly dispose of them and reduce your environmental impact.
              </p>
            </motion.div>

            {/* EcoWallet */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-6">
                <Wallet size={42} className="text-eco-green" />
              </div>
              <h3 className="text-xl font-medium text-eco-dark mb-3">EcoWallet</h3>
              <p className="text-eco-dark/80 leading-relaxed">
                Earn Buds for eco-friendly actions and spend them on digital badges, eco-friendly merchandise, or donations to environmental causes.
              </p>
            </motion.div>

            {/* Receiptify */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-6">
                <Receipt size={42} className="text-eco-green" />
              </div>
              <h3 className="text-xl font-medium text-eco-dark mb-3">Receiptify</h3>
              <p className="text-eco-dark/80 leading-relaxed">
                Scan your receipts to analyze purchases, earn Buds for eco-friendly items, and get personalized sustainability recommendations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Track Your Impact Section */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-medium text-eco-dark mb-4">track your impact</h2>
            <p className="text-lg text-eco-dark/80 max-w-2xl mx-auto">
              our intuitive tools help you monitor and improve your environmental footprint
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Log Eco Actions */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="flex items-start gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="shrink-0">
                  <Calendar size={28} className="text-eco-green" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-eco-dark mb-2">log eco actions</h3>
                  <p className="text-eco-dark/80">
                    Record your daily sustainable activities like using public transit or reusable bottles.
                  </p>
                </div>
              </motion.div>

              {/* Trash Scanner */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-start gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="shrink-0">
                  <Camera size={28} className="text-eco-green" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-eco-dark mb-2">trash scanner</h3>
                  <p className="text-eco-dark/80">
                    Upload photos of waste items and learn how to properly dispose of them.
                  </p>
                </div>
              </motion.div>

              {/* Visual Analytics */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-start gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="shrink-0">
                  <PieChart size={28} className="text-eco-green" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-eco-dark mb-2">visual analytics</h3>
                  <p className="text-eco-dark/80">
                    Track your environmental impact with beautiful charts and statistics.
                  </p>
                </div>
              </motion.div>

              {/* Eco Challenges */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-start gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="shrink-0">
                  <TreePine size={28} className="text-eco-green" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-eco-dark mb-2">eco challenges</h3>
                  <p className="text-eco-dark/80">
                    Take on personalized sustainability challenges to improve your habits.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right side image */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center justify-center"
            >
              <div className="relative w-full h-full max-w-md">
                <img 
                  src="https://images.unsplash.com/photo-1592859600972-1b0834d83747?q=80&w=2070" 
                  alt="Environmental Impact Tracking" 
                  className="rounded-xl shadow-lg object-cover w-full h-auto aspect-[3/4]" 
                />
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-md border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-eco-green"></div>
                    <span className="text-sm font-medium">25% reduced carbon footprint</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section 
        id="about"
        className="py-24 pattern-bg w-full"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-center gap-12"
          >
            {/* Team Image */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex-1"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg eco-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" 
                  alt="EcoVision Team" 
                  className="w-full h-auto object-cover aspect-[4/3]" 
                />
              </div>
            </motion.div>
            
            {/* About Content */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center mb-2 bg-eco-green/10 px-4 py-1.5 rounded-full">
                <Leaf size={16} className="text-eco-green mr-2" />
                <span className="text-sm text-eco-dark/80">our story</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-medium text-eco-dark">Meet the Team Behind EcoVision</h2>
              
              <p className="text-lg text-eco-dark/80 leading-relaxed">
                We're a passionate group of environmentalists, designers, and developers united by a common goal: 
                to make sustainability accessible and measurable for everyone. Our diverse backgrounds bring 
                unique perspectives to solving one of the most pressing challenges of our time.
              </p>
              
              <p className="text-lg text-eco-dark/80 leading-relaxed">
                Founded in 2025, our team is committed to creating intuitive tools that help individuals 
                understand and reduce their environmental impact through small, consistent actions.
              </p>
              
              <div className="pt-4">
                <Link 
                  to="/about"
                  className="inline-flex items-center space-x-2 text-eco-green font-medium hover:underline group"
                >
                  <span>Learn more about our team</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 ml-2" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Index;
