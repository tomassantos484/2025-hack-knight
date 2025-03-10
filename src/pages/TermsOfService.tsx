import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, AlertTriangle, Award, Scale, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
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
            <FileText className="text-eco-green mr-3" size={24} />
            <h2 className="text-xl font-semibold">Agreement to Terms</h2>
          </div>
          
          <p className="mb-4">
            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and EcoVision ("we," "us" or "our"), concerning your access to and use of the EcoVision mobile application and website.
          </p>
          
          <p className="mb-4">
            You agree that by accessing the App, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the App and you must discontinue use immediately.
          </p>
          
          <p>
            We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Service at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Terms of Service, and you waive any right to receive specific notice of each such change.
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
              <Award className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">Intellectual Property Rights</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-eco-dark/80">
                Unless otherwise indicated, the App is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the App (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
              </p>
              
              <p className="text-eco-dark/80">
                The Content and the Marks are provided on the App "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Service, no part of the App and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
              </p>
              
              <p className="text-eco-dark/80">
                Provided that you are eligible to use the App, you are granted a limited license to access and use the App and to download or print a copy of any portion of the Content to which you have properly gained access solely for your personal, non-commercial use. We reserve all rights not expressly granted to you in and to the App, the Content and the Marks.
              </p>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">User Representations</h2>
            </div>
            
            <p className="mb-4">
              By using the App, you represent and warrant that:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the App.</li>
              <li>You will not access the App through automated or non-human means, whether through a bot, script or otherwise.</li>
              <li>You will not use the App for any illegal or unauthorized purpose.</li>
              <li>Your use of the App will not violate any applicable law or regulation.</li>
            </ul>
            
            <p className="mt-4 text-eco-dark/80">
              If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the App (or any portion thereof).
            </p>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <Scale className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">Prohibited Activities</h2>
            </div>
            
            <p className="mb-4">
              You may not access or use the App for any purpose other than that for which we make the App available. The App may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
            
            <p className="mb-4">
              As a user of the App, you agree not to:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Systematically retrieve data or other content from the App to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the App, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the App and/or the Content contained therein.</li>
              <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the App.</li>
              <li>Use any information obtained from the App in order to harass, abuse, or harm another person.</li>
              <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
              <li>Use the App in a manner inconsistent with any applicable laws or regulations.</li>
              <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming, that interferes with any party's uninterrupted use and enjoyment of the App or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the App.</li>
              <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
              <li>Delete the copyright or other proprietary rights notice from any Content.</li>
              <li>Attempt to impersonate another user or person or use the username of another user.</li>
              <li>Sell or otherwise transfer your profile.</li>
              <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism.</li>
            </ul>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <HelpCircle className="text-eco-green mr-3" size={24} />
              <h2 className="text-xl font-semibold">User Generated Contributions</h2>
            </div>
            
            <p className="mb-4">
              The App may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the App, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
            </p>
            
            <p className="mb-4">
              Contributions may be viewable by other users of the App and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
              <li>You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the App, and other users of the App to use your Contributions in any manner contemplated by the App and these Terms of Service.</li>
              <li>You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the App and these Terms of Service.</li>
              <li>Your Contributions are not false, inaccurate, or misleading.</li>
              <li>Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</li>
              <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</li>
              <li>Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
              <li>Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</li>
              <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
              <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
              <li>Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</li>
              <li>Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</li>
              <li>Your Contributions do not otherwise violate, or link to material that violates, any provision of these Terms of Service, or any applicable law or regulation.</li>
            </ul>
            
            <p className="mt-4 text-eco-dark/80">
              Any use of the App in violation of the foregoing violates these Terms of Service and may result in, among other things, termination or suspension of your rights to use the App.
            </p>
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-eco-lightGray p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Contact Us</h2>
            </div>
            
            <p className="mb-4">
              In order to resolve a complaint regarding the App or to receive further information regarding use of the App, please contact us at:
            </p>
            
            <div className="pl-6 space-y-1">
              <p><strong>EcoVision</strong></p>
              <p>123 Green Street</p>
              <p>Eco City, EC 12345</p>
              <p>United States</p>
              <p>Email: <a href="mailto:legal@ecovision.example.com" className="text-eco-green hover:underline">legal@ecovision.example.com</a></p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TermsOfService; 