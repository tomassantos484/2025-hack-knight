import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Upload, Camera, Image, AlertCircle, CheckCircle, Recycle, Trash2, Loader2, Leaf } from 'lucide-react';
import { classifyTrashImage, testApiConnection, TrashScanResult } from '../api/trashScanner';

interface ScanResult {
  category: 'recycle' | 'compost' | 'landfill';
  confidence: number;
  details: string;
  tips: string[];
}

const TrashScanner = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Test API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const isConnected = await testApiConnection();
        setApiConnected(isConnected);
        if (!isConnected) {
          setError('could not connect to the api server. please make sure it is running.');
        }
      } catch (err) {
        console.error('Error checking API connection:', err);
        setApiConnected(false);
        setError('could not connect to the api server. please make sure it is running.');
      }
    };
    
    checkApiConnection();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setScanResult(null);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setScanResult(null);
    };
    
    reader.readAsDataURL(file);
  };
  
  const scanImage = async () => {
    if (!imagePreview) return;
    
    // Check API connection before scanning
    if (apiConnected === false) {
      setError('cannot scan image: api server is not connected. please make sure it is running.');
      return;
    }
    
    setIsScanning(true);
    setError(null);
    
    try {
      console.log('Scanning image...');
      
      // Call the API with the image data
      const result = await classifyTrashImage(imagePreview);
      console.log('Scan result:', result);
      
      // Convert the API result to our ScanResult type
      setScanResult({
        category: result.category as 'recycle' | 'compost' | 'landfill',
        confidence: result.confidence,
        details: result.details,
        tips: result.tips
      });
    } catch (err) {
      console.error('Error scanning image:', err);
      setError('failed to analyze the image. please try again.');
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleReset = () => {
    setImagePreview(null);
    setScanResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'recycle':
        return <Recycle size={24} className="text-blue-500" />;
      case 'compost':
        return <Leaf size={24} className="text-eco-green" />;
      case 'landfill':
        return <Trash2 size={24} className="text-eco-accent" />;
      default:
        return <AlertCircle size={24} />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recycle':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'compost':
        return 'bg-eco-green/10 border-eco-green/20';
      case 'landfill':
        return 'bg-eco-accent/10 border-eco-accent/20';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-medium mb-2"
          >
            ai trash scanner
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-eco-dark/70"
          >
            upload a photo to see if your item is recyclable, compostable, or trash
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Upload/Preview section */}
          <div className="flex flex-col space-y-4">
            {!imagePreview ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-2 border-dashed border-eco-green/30 rounded-xl p-8 bg-eco-green/5 flex flex-col items-center justify-center h-80"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <Upload size={32} className="text-eco-green/50 mb-4" />
                <h3 className="font-medium text-eco-dark mb-2">upload image</h3>
                <p className="text-sm text-eco-dark/70 text-center mb-4 max-w-xs">
                  drag and drop an image here, or click to select one from your device
                </p>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-eco-green text-white text-sm rounded-lg hover:bg-eco-green/90 transition-colors flex items-center gap-1.5"
                  >
                    <Image size={16} />
                    browse files
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-eco-green/20 text-eco-dark text-sm rounded-lg hover:bg-eco-green/5 transition-colors flex items-center gap-1.5"
                  >
                    <Camera size={16} />
                    take photo
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl overflow-hidden relative h-80 eco-shadow"
              >
                <img 
                  src={imagePreview} 
                  alt="Item to scan" 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                  <div className="flex justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="px-3 py-1.5 bg-white/90 text-eco-dark text-xs rounded-lg hover:bg-white transition-colors"
                    >
                      change image
                    </motion.button>
                    
                    {!scanResult && !isScanning && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={scanImage}
                        className="px-3 py-1.5 bg-eco-green text-white text-xs rounded-lg hover:bg-eco-green/90 transition-colors"
                      >
                        scan image
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {isScanning && (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={24} className="animate-spin text-eco-green mr-2" />
                <p className="text-sm">analyzing your item...</p>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center py-4 text-red-500">
                <AlertCircle size={20} className="mr-2" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          
          {/* Right side - Results section */}
          <div className="flex flex-col space-y-4">
            <AnimatePresence>
              {scanResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className={`rounded-xl p-6 border ${getCategoryColor(scanResult.category)}`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-full mr-3 ${scanResult.category === 'recycle' ? 'bg-blue-500/20' : scanResult.category === 'compost' ? 'bg-eco-green/20' : 'bg-eco-accent/20'}`}>
                      {getCategoryIcon(scanResult.category)}
                    </div>
                    <div>
                      <h3 className="font-medium capitalize">{scanResult.category}</h3>
                      <div className="text-xs text-eco-dark/70">
                        confidence: {scanResult.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4">{scanResult.details}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">tips:</h4>
                    <ul className="text-sm space-y-1">
                      {scanResult.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle size={16} className="text-eco-green mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-eco-dark/80">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-eco-dark/80">
                      remember, recycling rules vary by location. when in doubt, check your local waste management guidelines.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="h-full flex flex-col items-center justify-center p-6 rounded-xl border border-eco-lightGray/50"
                >
                  {!imagePreview ? (
                    <>
                      <div className="mb-4 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-eco-green/10 mb-4">
                          <Trash2 size={28} className="text-eco-green" />
                        </div>
                        <h3 className="font-medium">how it works</h3>
                      </div>
                      <ol className="text-sm space-y-3 text-eco-dark/80 max-w-xs">
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-eco-green/10 text-eco-green text-xs mr-2 flex-shrink-0">1</span>
                          <span>upload an image of your waste item</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-eco-green/10 text-eco-green text-xs mr-2 flex-shrink-0">2</span>
                          <span>our ai will analyze and categorize it</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-eco-green/10 text-eco-green text-xs mr-2 flex-shrink-0">3</span>
                          <span>get tips on how to properly dispose of it</span>
                        </li>
                      </ol>
                    </>
                  ) : (
                    <>
                      <Image size={32} className="text-eco-green/50 mb-4" />
                      <h3 className="font-medium mb-2">ready to scan</h3>
                      <p className="text-sm text-eco-dark/70 text-center mb-4">
                        click "scan image" to analyze your waste item and determine how to properly dispose of it.
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {scanResult && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-white border border-eco-lightGray text-eco-dark text-sm rounded-lg hover:bg-eco-cream transition-colors self-center"
              >
                scan another item
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrashScanner;
