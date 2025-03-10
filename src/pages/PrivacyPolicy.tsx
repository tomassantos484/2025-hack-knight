import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, Eye, Database, Lock, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-eco-dark/70">
            Last updated: March 9, 2025
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <Shield className="text-eco-green mr-3" size={24} />
            <h2 className="text-xl font-semibold">Our Commitment to Privacy</h2>
          </div>
          
          <p className="mb-4">
            At EcoVision, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>
          
          <p>
            We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <Database className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">Information We Collect</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Personal Data</h3>
                <p className="text-eco-dark/80">
                  When you register with us and use our application, we may ask you to provide certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                  <li>Cookies and Usage Data</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Usage Data</h3>
                <p className="text-eco-dark/80">
                  We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data").
                </p>
                <p className="text-eco-dark/80 mt-2">
                  This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Location Data</h3>
                <p className="text-eco-dark/80">
                  We may use and store information about your location if you give us permission to do so ("Location Data"). We use this data to provide features of our Service, to improve and customize our Service.
                </p>
                <p className="text-eco-dark/80 mt-2">
                  You can enable or disable location services when you use our Service at any time, through your device settings.
                </p>
              </div>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <Eye className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">How We Use Your Information</h2>
            </div>
            
            <p className="mb-4">
              We use the collected data for various purposes:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information</li>
            </ul>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <Lock className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">Data Security</h2>
            </div>
            
            <p className="mb-4">
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Security Measures We Implement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data both in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular monitoring for suspicious activities</li>
                <li>Employee training on data protection and security best practices</li>
              </ul>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <FileText className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">Your Data Protection Rights</h2>
            </div>
            
            <p className="mb-4">
              We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">The right to access</h3>
                <p className="text-eco-dark/80">You have the right to request copies of your personal data.</p>
              </div>
              
              <div>
                <h3 className="font-medium">The right to rectification</h3>
                <p className="text-eco-dark/80">You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete information you believe is incomplete.</p>
              </div>
              
              <div>
                <h3 className="font-medium">The right to erasure</h3>
                <p className="text-eco-dark/80">You have the right to request that we erase your personal data, under certain conditions.</p>
              </div>
              
              <div>
                <h3 className="font-medium">The right to restrict processing</h3>
                <p className="text-eco-dark/80">You have the right to request that we restrict the processing of your personal data, under certain conditions.</p>
              </div>
              
              <div>
                <h3 className="font-medium">The right to object to processing</h3>
                <p className="text-eco-dark/80">You have the right to object to our processing of your personal data, under certain conditions.</p>
              </div>
              
              <div>
                <h3 className="font-medium">The right to data portability</h3>
                <p className="text-eco-dark/80">You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</p>
              </div>
            </div>
            
            <p className="mt-4">
              If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our email: <a href="mailto:privacy@ecovision.example.com" className="text-eco-green hover:underline">privacy@ecovision.example.com</a>
            </p>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Contact Us</h2>
            </div>
            
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            
            <ul className="list-disc pl-6 space-y-1">
              <li>By email: <a href="mailto:privacy@ecovision.example.com" className="text-eco-green hover:underline">privacy@ecovision.example.com</a></li>
              <li>By visiting the Contact Support page on our website: <a href="/contact-support" className="text-eco-green hover:underline">Contact Support</a></li>
            </ul>
          </motion.section>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPolicy; 