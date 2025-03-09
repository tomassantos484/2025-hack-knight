import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
// Use Vite's import.meta.env instead of process.env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Fallback function to calculate environmental impact when Gemini API is not available
 */
function calculateEcoImpact(title: string, category: string, description?: string): { co2Impact: number; budsReward: number; impact: string } {
  // Default values for non-eco actions
  let co2Impact = 0;
  let budsReward = 0;
  let impact = 'No environmental impact';
  
  // Convert title and category to lowercase for easier matching
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  // Check if this is a known eco action category
  if (
    lowerCategory === 'transportation' || 
    lowerCategory === 'waste' || 
    lowerCategory === 'food' || 
    lowerCategory === 'energy' || 
    lowerCategory === 'water'
  ) {
    // Transportation actions
    if (lowerCategory === 'transportation') {
      if (lowerTitle.includes('public transit') || lowerTitle.includes('bus') || lowerTitle.includes('train')) {
        co2Impact = -2.3;
        budsReward = 15;
        impact = '2.3 kg CO₂ saved by using public transit instead of driving';
      } else if (lowerTitle.includes('walk') || lowerTitle.includes('walking')) {
        co2Impact = -1.8;
        budsReward = 12;
        impact = '1.8 kg CO₂ saved by walking instead of driving';
      } else if (lowerTitle.includes('carpool') || lowerTitle.includes('rideshare')) {
        co2Impact = -1.5;
        budsReward = 10;
        impact = '1.5 kg CO₂ saved by sharing a ride instead of driving alone';
      } else if (lowerTitle.includes('bike') || lowerTitle.includes('cycling')) {
        co2Impact = -2.1;
        budsReward = 14;
        impact = '2.1 kg CO₂ saved by cycling instead of driving';
      } else {
        co2Impact = -1.0;
        budsReward = 8;
        impact = '1.0 kg CO₂ saved through eco-friendly transportation';
      }
    }
    
    // Waste reduction actions
    else if (lowerCategory === 'waste') {
      if (lowerTitle.includes('reusable') || lowerTitle.includes('mug') || lowerTitle.includes('cup')) {
        co2Impact = -0.5;
        budsReward = 8;
        impact = '0.5 kg CO₂ saved by using reusable items instead of disposables';
      } else if (lowerTitle.includes('bag') || lowerTitle.includes('shopping')) {
        co2Impact = -0.3;
        budsReward = 5;
        impact = '0.3 kg CO₂ saved by avoiding plastic bag production and disposal';
      } else if (lowerTitle.includes('recycle') || lowerTitle.includes('recycling')) {
        co2Impact = -0.8;
        budsReward = 10;
        impact = '0.8 kg CO₂ saved by recycling materials instead of landfill disposal';
      } else if (lowerTitle.includes('compost')) {
        co2Impact = -0.6;
        budsReward = 7;
        impact = '0.6 kg CO₂ saved by composting instead of landfill disposal';
      } else {
        co2Impact = -0.4;
        budsReward = 6;
        impact = '0.4 kg CO₂ saved through waste reduction practices';
      }
    }
    
    // Food actions
    else if (lowerCategory === 'food') {
      if (lowerTitle.includes('meatless') || lowerTitle.includes('vegetarian') || lowerTitle.includes('vegan')) {
        co2Impact = -1.5;
        budsReward = 10;
        impact = '1.5 kg CO₂ saved by choosing plant-based food over animal products';
      } else if (lowerTitle.includes('local') || lowerTitle.includes('produce')) {
        co2Impact = -0.4;
        budsReward = 7;
        impact = '0.4 kg CO₂ saved by reducing food transportation emissions';
      } else {
        co2Impact = -0.3;
        budsReward = 5;
        impact = '0.3 kg CO₂ saved through sustainable food choices';
      }
    }
    
    // Energy actions
    else if (lowerCategory === 'energy') {
      if (lowerTitle.includes('light') || lowerTitle.includes('lighting')) {
        // Special case for turning off lights
        if (lowerTitle.includes('turn off') || lowerTitle.includes('turned off')) {
          co2Impact = -0.3;
          budsReward = 5;
          
          // Check if it mentions a specific duration
          if (lowerTitle.includes('day') || (description && description.toLowerCase().includes('day'))) {
            impact = '0.3 kg CO₂ saved by turning off lights for an entire day';
          } else if (lowerTitle.includes('hour') || (description && description.toLowerCase().includes('hour'))) {
            impact = '0.02 kg CO₂ saved per hour by turning off unnecessary lights';
          } else {
            impact = '0.3 kg CO₂ saved by reducing electricity usage for lighting';
          }
        } else {
          co2Impact = -0.2;
          budsReward = 5;
          impact = '0.2 kg CO₂ saved by optimizing lighting energy usage';
        }
      } else if (lowerTitle.includes('unplug') || lowerTitle.includes('standby')) {
        co2Impact = -0.2;
        budsReward = 5;
        impact = '0.2 kg CO₂ saved by eliminating standby power consumption';
      } else if (lowerTitle.includes('shower') || lowerTitle.includes('bath')) {
        co2Impact = -0.5;
        budsReward = 8;
        impact = '0.5 kg CO₂ saved by reducing hot water energy consumption';
      } else {
        co2Impact = -0.3;
        budsReward = 6;
        impact = '0.3 kg CO₂ saved through energy conservation practices';
      }
    }
    
    // Water actions
    else if (lowerCategory === 'water') {
      if (lowerTitle.includes('rain') || lowerTitle.includes('rainwater')) {
        co2Impact = -0.1;
        budsReward = 8;
        impact = '0.1 kg CO₂ saved by collecting 50L of rainwater (reduced water treatment)';
      } else if (lowerTitle.includes('leak') || lowerTitle.includes('faucet')) {
        co2Impact = -0.15;
        budsReward = 10;
        impact = '0.15 kg CO₂ saved by preventing 70L of water waste daily';
      } else {
        co2Impact = -0.1;
        budsReward = 7;
        impact = '0.1 kg CO₂ saved through water conservation (30L saved)';
      }
    }
    
    // Generic eco action
    else {
      co2Impact = -0.5;
      budsReward = 5;
      impact = '0.5 kg CO₂ saved through environmentally conscious behavior';
    }
  }
  
  // For non-eco actions or unknown categories
  else {
    co2Impact = 0;
    budsReward = 0;
    impact = 'No significant environmental impact';
  }
  
  return { co2Impact, budsReward, impact };
}

/**
 * Analyzes an eco action using Gemini AI to determine its environmental impact
 * @param actionTitle The title of the eco action
 * @param actionDescription Additional details about the action
 * @returns The calculated CO2 impact and buds reward
 */
export const analyzeEcoAction = async (
  actionTitle: string,
  actionDescription?: string
): Promise<{ co2Impact: number; budsReward: number; impact: string }> => {
  try {
    // If Gemini API is not available, use the fallback function
    if (!genAI) {
      console.warn('Gemini API not available. Using fallback calculation.');
      return calculateEcoImpact(actionTitle, actionDescription || '', actionDescription);
    }
    
    // Create a prompt for the Gemini model
    const prompt = `
      Analyze the following eco-friendly action and determine its environmental impact with specific CO2 savings:
      
      Action: ${actionTitle}
      ${actionDescription ? `Details: ${actionDescription}` : ''}
      
      Please provide a detailed analysis with:
      
      1. The estimated CO2 impact in kg (use negative values for CO2 saved, positive for CO2 generated)
         - For transportation: Calculate based on distance, mode of transport, and fuel efficiency
         - For energy: Consider kWh saved and the carbon intensity of local electricity
         - For waste: Calculate based on waste diverted from landfill and recycling benefits
         - For food: Consider the carbon footprint difference between food choices
         - For water: Calculate energy saved from water conservation
      
      2. A "buds" reward score from 0-20 (0 for non-eco actions, higher for more impactful eco actions)
         - 0-5: Minor impact actions
         - 6-10: Moderate impact actions
         - 11-15: Significant impact actions
         - 16-20: Major impact actions
      
      3. A detailed impact statement that includes specific metrics (e.g., "2.3 kg CO₂ saved by avoiding 10 miles of driving" or "50 L water saved, equivalent to 0.2 kg CO₂")
      
      Format your response as a JSON object with these keys: co2Impact, budsReward, impact
      
      If the action is not eco-friendly or has a negative environmental impact, assign 0 buds and a positive CO2 impact value.
      
      Examples of CO2 savings:
      - Using public transit instead of driving: ~2.3 kg CO₂ saved per 10 miles
      - Eating a plant-based meal instead of beef: ~1.5 kg CO₂ saved per meal
      - Using LED bulbs instead of incandescent: ~0.3 kg CO₂ saved per day
      - Turning off lights when not in use: ~0.3 kg CO₂ saved per day
      - Using reusable bags instead of plastic: ~0.05 kg CO₂ saved per bag
    `;
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        text.match(/{[\s\S]*?}/);
      
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : text;
      const data = JSON.parse(jsonString);
      
      const co2Impact = parseFloat(data.co2Impact) || 0;
      let budsReward = Math.round(parseFloat(data.budsReward)) || 0;
      const impact = data.impact || 'Environmental impact calculated';
      
      // Ensure buds are within range
      budsReward = Math.max(0, Math.min(20, budsReward));
      
      return { co2Impact, budsReward, impact };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // Fall back to rule-based calculation if parsing fails
      return calculateEcoImpact(actionTitle, actionDescription || '', actionDescription);
    }
  } catch (error) {
    console.error('Error analyzing eco action with Gemini:', error);
    
    // Fall back to rule-based calculation if API call fails
    return calculateEcoImpact(actionTitle, actionDescription || '', actionDescription);
  }
}; 