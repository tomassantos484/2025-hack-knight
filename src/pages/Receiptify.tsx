import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Receipt, Upload, Camera, AlertCircle, CheckCircle, Leaf, ShoppingBag, X, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

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
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock receipt analysis data
      const mockAnalysis: ReceiptAnalysis = {
        totalItems: 5,
        ecoFriendlyItems: 2,
        totalSpent: 37.85,
        ecoFriendlySpent: 12.99,
        ecoScore: 42, // 0-100 scale
        totalCarbonFootprint: 8.2, // kg CO2
        budsEarned: 15,
        items: [
          {
            id: 1,
            name: 'Organic Apples (3)',
            price: 4.99,
            isEcoFriendly: true,
            category: 'Produce',
            carbonFootprint: 0.3
          },
          {
            id: 2,
            name: 'Reusable Water Bottle',
            price: 7.99,
            isEcoFriendly: true,
            category: 'Home Goods',
            carbonFootprint: 1.2
          },
          {
            id: 3,
            name: 'Plastic Wrapped Cookies',
            price: 3.49,
            isEcoFriendly: false,
            category: 'Snacks',
            carbonFootprint: 1.8,
            alternativeSuggestion: 'Try bulk bin cookies in your own container'
          },
          {
            id: 4,
            name: 'Paper Towels',
            price: 5.99,
            isEcoFriendly: false,
            category: 'Household',
            carbonFootprint: 2.1,
            alternativeSuggestion: 'Switch to reusable cloth towels'
          },
          {
            id: 5,
            name: 'Single-Use Plastic Bags',
            price: 2.99,
            isEcoFriendly: false,
            category: 'Household',
            carbonFootprint: 2.8,
            alternativeSuggestion: 'Use reusable shopping bags'
          }
        ]
      };
      
      setAnalysis(mockAnalysis);
      setIsScanning(false);
      
      // Add to scan history
      const newScan = {
        date: new Date().toLocaleDateString(),
        score: mockAnalysis.ecoScore,
        items: mockAnalysis.totalItems
      };
      
      setHistory(prev => [newScan, ...prev]);
      
      // Show success toast
      toast.success(`Receipt analyzed! You earned ${mockAnalysis.budsEarned} Buds`);
    }, 2000);
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
  
  return (
    <DashboardLayout>
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
                className="bg-white rounded-xl p-6 eco-shadow mb-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">Receipt Analysis</h2>
                  <button
                    onClick={handleReset}
                    className="p-2 text-eco-dark/70 hover:text-eco-dark"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-eco-cream p-4 rounded-lg">
                    <div className="text-sm text-eco-dark/70 mb-1">Eco Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.ecoScore)}`}>
                      {analysis.ecoScore}/100
                    </div>
                  </div>
                  
                  <div className="bg-eco-cream p-4 rounded-lg">
                    <div className="text-sm text-eco-dark/70 mb-1">Eco Items</div>
                    <div className="text-2xl font-bold">
                      {analysis.ecoFriendlyItems}/{analysis.totalItems}
                    </div>
                  </div>
                  
                  <div className="bg-eco-cream p-4 rounded-lg">
                    <div className="text-sm text-eco-dark/70 mb-1">Carbon Footprint</div>
                    <div className="text-2xl font-bold">
                      {analysis.totalCarbonFootprint} kg
                    </div>
                  </div>
                  
                  <div className="bg-eco-cream p-4 rounded-lg">
                    <div className="text-sm text-eco-dark/70 mb-1">Buds Earned</div>
                    <div className="text-2xl font-bold text-eco-green flex items-center">
                      <Leaf size={18} className="mr-1" />
                      {analysis.budsEarned}
                    </div>
                  </div>
                </div>
                
                {/* Items List */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Items Analysis</h3>
                  
                  <div className="space-y-3">
                    {analysis.items.map(item => (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.isEcoFriendly 
                            ? 'border-eco-green/20 bg-eco-green/5' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              {item.isEcoFriendly ? (
                                <CheckCircle size={16} className="text-eco-green mr-2" />
                              ) : (
                                <AlertCircle size={16} className="text-red-500 mr-2" />
                              )}
                              <h4 className="font-medium">{item.name}</h4>
                            </div>
                            <div className="text-sm text-eco-dark/70 mt-1">
                              {item.category} · ${item.price.toFixed(2)} · {item.carbonFootprint} kg CO₂
                            </div>
                          </div>
                          
                          <div className={`text-sm ${item.isEcoFriendly ? 'text-eco-green' : 'text-red-500'}`}>
                            {item.isEcoFriendly ? 'Eco-friendly' : 'Non-eco'}
                          </div>
                        </div>
                        
                        {item.alternativeSuggestion && (
                          <div className="mt-2 text-sm bg-white p-2 rounded border border-yellow-200">
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
                    className="px-4 py-2 bg-eco-cream text-eco-dark rounded-lg hover:bg-eco-cream/80 transition-colors"
                  >
                    Scan Another Receipt
                  </button>
                  
                  <button
                    onClick={() => toast.success('Receipt details saved!')}
                    className="px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-green/90 transition-colors"
                  >
                    Save Analysis
                  </button>
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