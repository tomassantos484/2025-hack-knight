import React, { useState } from 'react';
import axios from 'axios';

const ReceiptScanner = () => {
  const [receipt, setReceipt] = useState(null);
  const [textData, setTextData] = useState('');
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
      const items = response.data.items;
      analyzeItems(items);
    } catch (error) {
      console.error('Error uploading receipt:', error);
    }
  };

  const analyzeItems = (items) => {
    let ecoFriendlyCount = 0;
    let nonEcoCount = 0;

    items.forEach(item => {
      if (isEcoFriendly(item)) {
        ecoFriendlyCount++;
      } else {
        nonEcoCount++;
      }
    });

    const score = (ecoFriendlyCount / items.length) * 100;
    setEcoScore(score);
    calculateCarbonFootprint(items);
  };

  const isEcoFriendly = (item) => {
    // Placeholder logic for determining if an item is eco-friendly
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
      console.error('Error calculating carbon footprint:', error);
    }
  };

  return (
    <div className="receipt-scanner">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>upload receipt</button>
      {ecoScore !== null && <div className="eco-score">eco receipt score: {ecoScore}%</div>}
      {carbonFootprint !== null && <div className="carbon-footprint">carbon footprint: {carbonFootprint} kg CO2</div>}
    </div>
  );
};

export default ReceiptScanner; 