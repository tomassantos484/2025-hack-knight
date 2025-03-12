import React, { useState } from 'react';
import { scanReceipt } from '../api/receipt-scanner';

const ReceiptScanner = () => {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [textData, setTextData] = useState('');
  const [ecoScore, setEcoScore] = useState<number | null>(null);
  const [carbonFootprint, setCarbonFootprint] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReceipt(event.target.files[0]);
      setError(null); // Clear any previous errors
    }
  };

  const handleUpload = async () => {
    if (!receipt) {
      setError('Please select a receipt image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the new API endpoint instead of directly calling Gemini API
      const result = await scanReceipt(receipt);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process receipt');
      }
      
      const receiptData = result.data;
      
      // Set the extracted data
      if (receiptData.extracted_text) {
        setTextData(receiptData.extracted_text);
      }
      
      // Set eco score and carbon footprint
      if (receiptData.eco_score !== undefined) {
        setEcoScore(receiptData.eco_score);
      }
      
      if (receiptData.carbon_footprint !== undefined) {
        setCarbonFootprint(receiptData.carbon_footprint);
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="receipt-scanner">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button 
        onClick={handleUpload} 
        disabled={isLoading || !receipt}
        className={isLoading ? 'loading' : ''}
      >
        {isLoading ? 'processing...' : 'upload receipt'}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      
      {textData && (
        <div className="extracted-text">
          <h3>Extracted Text:</h3>
          <pre>{textData}</pre>
        </div>
      )}
      
      {ecoScore !== null && (
        <div className="eco-score">eco receipt score: {ecoScore}%</div>
      )}
      
      {carbonFootprint !== null && (
        <div className="carbon-footprint">carbon footprint: {carbonFootprint} kg CO2</div>
      )}
    </div>
  );
};

export default ReceiptScanner; 