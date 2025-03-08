import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Receipt, Upload, Camera, AlertCircle, CheckCircle, Leaf, ShoppingBag, X, BarChart3, Clock, ArrowRight, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeReceipt } from '../services/receiptService';
import { earnBuds } from '../services/walletService';

// Add this type for the Clerk user with getToken method
interface ClerkUser {
  id: string;
  getToken: (options: { template: string }) => Promise<string>;
  // Add other properties as needed
}

// Interface for receipt item
interface ReceiptItem {
  id: number;
  name: string;
  price: number;
  isEcoFriendly: boolean;
  category: string;
  carbonFootprint: number;
  alternativeSuggestion?: string;
}

// Interface for receipt analysis
interface ReceiptAnalysis {
  totalItems: number;
  ecoFriendlyItems: number;
  totalSpent: number;
  ecoFriendlySpent: number;
  ecoScore: number;
  totalCarbonFootprint: number;
  budsEarned: number;
  items: ReceiptItem[];
  extractedText: string;
}

const Receiptify = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for receipt image
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  
  // State for scanning status
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  // State for receipt analysis
  const [analysis, setAnalysis] = useState<ReceiptAnalysis | null>(null);
  
  // State for scan history
  const [scanHistory, setHistory] = useState<{date: string, score: number, items: number}[]>([]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Prevent default behavior for drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Handle camera capture
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle scan
  const handleScan = async () => {
    if (!receiptImage) return;
    
    setIsScanning(true);
    
    try {
      // Convert base64 to file
      const fetchResponse = await fetch(receiptImage);
      const blob = await fetchResponse.blob();
      const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
      
      // We'll skip trying to get a token since it's not available in this version of Clerk
      // Just pass the user ID if the user is signed in
      const userId = isSignedIn && user ? user.id : undefined;
      
      // Call our analyze receipt service with user ID only
      const analysis = await analyzeReceipt(file, userId);
      
      setAnalysis(analysis);
      setIsScanning(false);
      
      // Add to scan history
      const newScan = {
        date: new Date().toLocaleDateString(),
        score: analysis.ecoScore,
        items: analysis.totalItems
      };
      
      setHistory(prev => [newScan, ...prev]);
      
      // Award buds to the user through wallet service if they're signed in
      if (isSignedIn && user) {
        await earnBuds(
          user.id,
          analysis.budsEarned,
          `Receipt scan: ${analysis.ecoFriendlyItems} eco-friendly items found`
        );
      }
      
      // Show success toast
      toast.success(`Receipt analyzed! You earned ${analysis.budsEarned} Buds`);
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      toast.error('Failed to analyze receipt. Please try again.');
      setIsScanning(false);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setReceiptImage(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-red-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-eco-green';
  };
  
  // Debug function
  const debugAnalysis = () => {
    console.log('Current analysis data:', analysis);
    alert('Analysis data logged to console');
  };
  
  return (
    <DashboardLayout>
      {/* Debug button fixed in bottom right */}
      <button
        onClick={debugAnalysis}
        className="fixed bottom-4 right-4 z-50 bg-black text-white p-2 rounded-full shadow-lg"
        aria-label="Debug"
      >
        <Bug size={20} />
      </button>
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-medium mb-2 flex items-center"
          >
            <Receipt className="mr-2 text-eco-green" size={28} />
            Receiptify
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-eco-dark/70"
          >
            Scan your receipts to analyze purchases and earn Buds for eco-friendly items
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Receipt Upload Area */}
            {!receiptImage && !analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-8 eco-shadow mb-8"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-eco-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Receipt size={32} className="text-eco-green" />
                  </div>
                  
                  <h2 className="text-xl font-medium mb-2">Upload Your Receipt</h2>
                  <p className="text-eco-dark/70 mb-8 max-w-md mx-auto">
                    Take a photo or upload an image of your receipt to analyze your purchases and earn Buds for eco-friendly items
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleCameraCapture}
                      className="px-4 py-2 bg-eco-green text-white rounded-lg flex items-center justify-center hover:bg-eco-green/90 transition-colors"
                    >
                      <Camera size={18} className="mr-2" />
                      Take Photo
                    </button>
                    
                    <label className="px-4 py-2 bg-eco-cream text-eco-dark rounded-lg flex items-center justify-center hover:bg-eco-cream/80 transition-colors cursor-pointer">
                      <Upload size={18} className="mr-2" />
                      Upload Image
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="mt-8 border-t border-dashed border-gray-200 pt-6 text-sm text-eco-dark/60">
                    Drag and drop your receipt image here
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Receipt Preview */}
            {receiptImage && !analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 eco-shadow mb-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Receipt Preview</h2>
                  <button
                    onClick={handleReset}
                    className="p-2 text-eco-dark/70 hover:text-eco-dark"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-6 bg-eco-cream rounded-lg overflow-hidden">
                  <img
                    src={receiptImage}
                    alt="Receipt"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className={`px-6 py-2 rounded-lg flex items-center ${
                      isScanning
                        ? 'bg-eco-green/70 text-white cursor-not-allowed'
                        : 'bg-eco-green text-white hover:bg-eco-green/90'
                    }`}
                  >
                    {isScanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Receipt
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Analysis Results */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 eco-shadow mb-8 relative"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-medium text-[#4a4a4a]">Receipt Analysis</h2>
                  <button
                    onClick={handleReset}
                    className="p-2 text-[#4a4a4a]/70 hover:text-[#4a4a4a] absolute top-4 right-4"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                {/* Summary Stats - Styled exactly like the image */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#f9f8f3] rounded-xl p-6">
                    <div className="text-[#4a4a4a] mb-2">Eco Score</div>
                    <div className="text-[#e6b93c] text-3xl font-medium">
                      {analysis.ecoScore}/100
                    </div>
                  </div>
                  
                  <div className="bg-[#f9f8f3] rounded-xl p-6">
                    <div className="text-[#4a4a4a] mb-2">Eco Items</div>
                    <div className="text-[#4a4a4a] text-3xl font-medium">
                      {analysis.ecoFriendlyItems}/{analysis.totalItems}
                    </div>
                  </div>
                  
                  <div className="bg-[#f9f8f3] rounded-xl p-6">
                    <div className="text-[#4a4a4a] mb-2">Carbon Footprint</div>
                    <div className="text-[#4a4a4a] text-3xl font-medium">
                      {analysis.totalCarbonFootprint} kg
                    </div>
                  </div>
                  
                  <div className="bg-[#f9f8f3] rounded-xl p-6">
                    <div className="text-[#4a4a4a] mb-2">Buds Earned</div>
                    <div className="text-[#4a9b5c] text-3xl font-medium flex items-center">
                      <Leaf size={24} className="mr-2" />
                      {analysis.budsEarned}
                    </div>
                  </div>
                </div>
                
                {/* Items Analysis - Styled exactly like the image */}
                <div className="mb-8">
                  <h3 className="text-2xl font-medium mb-4 text-[#4a4a4a]">Items Analysis</h3>
                  
                  <div className="space-y-4">
                    {analysis.items.map(item => (
                      <div 
                        key={item.id}
                        className={`p-6 rounded-xl ${
                          item.isEcoFriendly 
                            ? 'bg-[#f5f9f6] border border-[#4a9b5c]/20' 
                            : 'bg-[#fef5f5] border border-[#e57373]/20'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              {item.isEcoFriendly ? (
                                <CheckCircle size={20} className="text-[#4a9b5c] mr-2" />
                              ) : (
                                <AlertCircle size={20} className="text-[#e57373] mr-2" />
                              )}
                              <h4 className="text-lg text-[#4a4a4a]">{item.name}</h4>
                            </div>
                            <div className="text-[#6b7280] mt-2">
                              {item.category} · ${item.price.toFixed(2)} · {item.carbonFootprint} kg CO<sub>2</sub>
                            </div>
                          </div>
                          
                          <div className={`${
                            item.isEcoFriendly 
                              ? 'text-[#4a9b5c]' 
                              : 'text-[#e57373]'
                          }`}>
                            {item.isEcoFriendly ? 'Eco-friendly' : 'Non-eco'}
                          </div>
                        </div>
                        
                        {item.alternativeSuggestion && (
                          <div className="mt-4 text-[#4a4a4a] border border-[#f0d68a] bg-[#fffbeb] p-4 rounded-lg">
                            <span className="font-medium">Suggestion:</span> {item.alternativeSuggestion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-[#f9f8f3] text-[#4a4a4a] rounded-lg hover:bg-[#f0efe8] transition-colors"
                  >
                    Scan Another Receipt
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={debugAnalysis}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors"
                    >
                      Debug
                    </button>
                    
                    <button
                      onClick={() => toast.success('Receipt details saved!')}
                      className="px-4 py-2 bg-[#4a9b5c] text-white rounded-lg hover:bg-[#4a9b5c]/90 transition-colors"
                    >
                      Save Analysis
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Scan History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 eco-shadow mb-6"
            >
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Clock size={18} className="mr-2 text-eco-dark/70" />
                Recent Scans
              </h2>
              
              {scanHistory.length === 0 ? (
                <div className="text-center py-6 text-eco-dark/70">
                  <Receipt size={32} className="mx-auto mb-2 text-eco-dark/30" />
                  <p>No scan history yet</p>
                  <p className="text-sm">Scan your first receipt to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.map((scan, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-eco-cream/50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm font-medium">{scan.date}</div>
                        <div className="text-xs text-eco-dark/70">{scan.items} items</div>
                      </div>
                      <div className={`text-sm font-medium ${getScoreColor(scan.score)}`}>
                        {scan.score}/100
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-eco-green/10 rounded-xl p-6"
            >
              <h2 className="text-lg font-medium mb-4">Eco Shopping Tips</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white p-1.5 rounded-full mr-3 mt-0.5">
                    <Leaf size={14} className="text-eco-green" />
                  </div>
                  <p className="text-sm text-eco-dark/80">Choose products with minimal packaging or recyclable packaging</p>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-1.5 rounded-full mr-3 mt-0.5">
                    <Leaf size={14} className="text-eco-green" />
                  </div>
                  <p className="text-sm text-eco-dark/80">Look for certified organic or sustainably sourced products</p>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-1.5 rounded-full mr-3 mt-0.5">
                    <Leaf size={14} className="text-eco-green" />
                  </div>
                  <p className="text-sm text-eco-dark/80">Bring your own reusable bags, containers, and produce bags</p>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-1.5 rounded-full mr-3 mt-0.5">
                    <Leaf size={14} className="text-eco-green" />
                  </div>
                  <p className="text-sm text-eco-dark/80">Shop local to reduce transportation emissions</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Receiptify; 