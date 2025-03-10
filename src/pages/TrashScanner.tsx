import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Upload, Camera, Image, AlertCircle, CheckCircle, Recycle, Trash2, Loader2, Leaf, Clock, ChevronRight } from 'lucide-react';
import { classifyTrashImage, testApiConnection, TrashScanResult } from '../api/trashScanner';
import { useAuth } from '@clerk/clerk-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Interface for scan history item
interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  imagePreview: string;
  result: TrashScanResult;
}

interface ScanResult {
  category: 'recycle' | 'compost' | 'landfill' | 'unknown';
  confidence: number;
  details: string;
  tips: string[];
  environmental_impact?: string;
  buds_reward?: number;
  offline_mode?: boolean;
}

// Helper function to convert file to base64
const fileToBase64 = (file: string | File): Promise<string> => {
  // If file is already a string (base64), return it
  if (typeof file === 'string') {
    return Promise.resolve(file);
  }
  
  // Otherwise, convert File to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const TrashScanner = () => {
  const { isSignedIn } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scan history state
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // Load scan history from localStorage on component mount
  useEffect(() => {
    const loadScanHistory = () => {
      const savedHistory = localStorage.getItem('trashScanHistory');
      if (savedHistory) {
        try {
          // Parse the saved history and convert timestamp strings back to Date objects
          const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setScanHistory(parsedHistory);
        } catch (err) {
          console.error('Error loading scan history:', err);
        }
      }
    };
    
    loadScanHistory();
  }, []);
  
  // Check if API is available
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log("Checking API connection...");
        const isConnected = await testApiConnection();
        console.log("API connection result:", isConnected);
        setApiConnected(isConnected);
        if (!isConnected) {
          setApiError("Could not connect to the API server. Using offline mode.");
          // Enable offline mode if API is not available
          setOfflineMode(true);
        }
      } catch (error) {
        console.error('Error checking API connection:', error);
        setApiError("Could not connect to the API server. Using offline mode.");
        // Enable offline mode if API check throws an error
        setOfflineMode(true);
      }
    };
    
    checkApiConnection();
    
    // Set up periodic API connection checks
    const intervalId = setInterval(checkApiConnection, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId); // Clean up on unmount
    };
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
    if (!imagePreview) {
      toast.error("Please select an image first");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // Convert the file to base64
      const base64Image = await fileToBase64(imagePreview);
      
      // If we're in offline mode, show a toast notification
      if (offlineMode) {
        toast.info("Using offline mode for classification. Results may be less accurate.", {
          duration: 5000,
        });
      }

      // Call the API to classify the image
      const result = await classifyTrashImage(base64Image);
      
      // Check if the result indicates offline mode was used
      if (result.offline_mode && !offlineMode) {
        setOfflineMode(true);
        setApiError("API server is in offline mode. Results may be less accurate.");
        toast.info("Using offline mode for classification. Results may be less accurate.", {
          duration: 5000,
        });
      }

      console.log("Scan result:", result);
      setScanResult(result);
      
      // Save the result to history
      saveToHistory(result);
      
      // Award buds if available
      if (result.buds_reward && result.buds_reward > 0) {
        toast.success(`You earned ${result.buds_reward} Buds for scanning trash!`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      setError("Failed to scan the image. Please try again.");
      
      // If there's an error, try to use offline mode
      setOfflineMode(true);
      setApiError("Error connecting to the API server. Using offline mode.");
      
      // Try again in offline mode
      try {
        toast.info("Retrying in offline mode. Results may be less accurate.", {
          duration: 5000,
        });
        
        const base64Image = await fileToBase64(imagePreview);
        const result = await classifyTrashImage(base64Image);
        
        console.log("Offline scan result:", result);
        setScanResult(result);
        
        // Save the result to history
        saveToHistory(result);
      } catch (offlineError) {
        console.error("Error in offline mode:", offlineError);
        setError("Failed to scan the image even in offline mode. Please try again later.");
      }
    } finally {
      setIsScanning(false);
    }
  };
  
  // Save scan result to history
  const saveToHistory = (result: ScanResult) => {
    if (!imagePreview) return;
    
    // Create a new history item
    const newHistoryItem: ScanHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      imagePreview: imagePreview,
      result: result as TrashScanResult
    };
    
    // Update history state
    const updatedHistory = [newHistoryItem, ...scanHistory].slice(0, 10); // Keep only the 10 most recent scans
    setScanHistory(updatedHistory);
    
    // Save to localStorage
    try {
      localStorage.setItem('trashScanHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Error saving scan history to localStorage:', err);
    }
  };
  
  const handleReset = () => {
    setImagePreview(null);
    setScanResult(null);
    setError(null);
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

  // Add a function to test the API directly
  const testApiDirectly = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://ecovision-backend-production.up.railway.app';
      console.log('Testing API directly at:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/test?t=${new Date().getTime()}`);
      const data = await response.json();
      
      console.log('Direct API test response:', data);
      alert(`API Test Result: ${JSON.stringify(data, null, 2)}`);
      
      return true;
    } catch (error) {
      console.error('Error testing API directly:', error);
      alert(`API Test Error: ${error.message}`);
      return false;
    }
  };

  // Render scan history item
  const renderHistoryItem = (item: ScanHistoryItem) => {
    return (
      <motion.div 
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md overflow-hidden mb-3 border border-gray-100"
      >
        <div className="flex items-center p-3">
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
            <img 
              src={item.imagePreview} 
              alt="Scanned item" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                item.result.category === 'recycle' ? 'bg-blue-500' : 
                item.result.category === 'compost' ? 'bg-green-500' : 
                'bg-amber-500'
              }`}></span>
              <h4 className="font-medium capitalize">{item.result.category}</h4>
              {item.result.offline_mode && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Offline
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <button 
              onClick={() => viewHistoryItem(item)}
              className="text-eco-green hover:text-eco-green-dark"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // View a history item
  const viewHistoryItem = (item: ScanHistoryItem) => {
    setImagePreview(item.imagePreview);
    setScanResult(item.result);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('trashScanHistory');
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
        
        {/* API Connection Status */}
        <div className="mb-4">
          <p className="text-sm">
            API Status: {apiConnected === null ? 'Checking...' : 
                        apiConnected ? 
                        <span className="text-green-500 font-medium">Connected</span> : 
                        <span className="text-red-500 font-medium">Disconnected (Using Offline Mode)</span>}
          </p>
          {apiError && <p className="text-sm text-red-500">{apiError}</p>}
          
          {!apiConnected && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The backend API is currently unavailable or has reached its usage limit. 
                The trash scanner is operating in offline mode, providing simulated results.
              </p>
            </div>
          )}
          
          <div className="flex items-center mt-3 space-x-2">
            {/* Add a direct test button */}
            <button 
              onClick={testApiDirectly}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Test API Directly
            </button>
            
            {/* History toggle button */}
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1 text-sm rounded flex items-center ${
                showHistory ? 'bg-eco-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock size={16} className="mr-1" />
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
        </div>
        
        {/* Scan History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-lg">Recent Scans</h3>
                  
                  {scanHistory.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear History
                    </button>
                  )}
                </div>
                
                {scanHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No scan history yet. Start scanning items to build your history.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto pr-2">
                    {scanHistory.map(item => renderHistoryItem(item))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
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
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {getCategoryIcon(scanResult.category)}
                      <h3 className="text-xl font-bold ml-2 capitalize">{scanResult.category}</h3>
                    </div>
                    <div className="text-sm font-medium">
                      Confidence: {scanResult.confidence}%
                      {scanResult.offline_mode && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Offline Mode
                        </span>
                      )}
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
