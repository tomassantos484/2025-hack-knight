/**
 * Test script for mock responses
 * This script tests all mock responses against common queries and logs statistics
 */

import { getMockResponse } from './mockResponses.js';
import { validateMockResponse } from './mockResponseValidator.js';

// Common query categories for testing
const testQueries = {
  greeting: [
    'hello',
    'hi there',
    'hey',
    'good morning',
    'how are you'
  ],
  carbon: [
    'carbon footprint',
    'reduce emissions',
    'climate change',
    'global warming',
    'greenhouse gases'
  ],
  plastic: [
    'plastic waste',
    'reduce plastic',
    'plastic pollution',
    'plastic alternatives',
    'plastic recycling'
  ],
  compost: [
    'how to compost',
    'composting tips',
    'start composting',
    'compost bin',
    'what can I compost'
  ],
  shopping: [
    'eco shopping',
    'sustainable shopping',
    'green products',
    'eco-friendly brands',
    'sustainable fashion'
  ],
  water: [
    'save water',
    'water conservation',
    'reduce water usage',
    'water footprint',
    'water saving tips'
  ]
};

/**
 * Run tests on all mock responses
 */
function runMockResponseTests() {
  const results = {
    totalQueries: 0,
    validResponses: 0,
    invalidResponses: 0,
    averageScore: 0,
    categoryScores: {},
    failedQueries: []
  };
  
  let totalScore = 0;
  
  // Test each category
  for (const [category, queries] of Object.entries(testQueries)) {
    let categoryScore = 0;
    
    // Test each query in the category
    for (const query of queries) {
      results.totalQueries++;
      
      // Get mock response
      const response = getMockResponse(query);
      
      // Validate response
      const validation = validateMockResponse(query, response);
      
      // Update results
      if (validation.isValid) {
        results.validResponses++;
      } else {
        results.invalidResponses++;
        results.failedQueries.push({
          category,
          query,
          score: validation.score,
          reason: validation.reason || 'Unknown reason'
        });
      }
      
      // Update scores
      totalScore += validation.score;
      categoryScore += validation.score;
    }
    
    // Calculate average score for category
    results.categoryScores[category] = categoryScore / queries.length;
  }
  
  // Calculate overall average score
  results.averageScore = totalScore / results.totalQueries;
  
  return results;
}

/**
 * Log test results
 */
function logTestResults(results) {
  console.log('=== Mock Response Test Results ===');
  console.log(`Total queries: ${results.totalQueries}`);
  console.log(`Valid responses: ${results.validResponses} (${(results.validResponses / results.totalQueries * 100).toFixed(2)}%)`);
  console.log(`Invalid responses: ${results.invalidResponses} (${(results.invalidResponses / results.totalQueries * 100).toFixed(2)}%)`);
  console.log(`Average score: ${results.averageScore.toFixed(2)}`);
  
  console.log('\n=== Category Scores ===');
  for (const [category, score] of Object.entries(results.categoryScores)) {
    console.log(`${category}: ${score.toFixed(2)}`);
  }
  
  if (results.failedQueries.length > 0) {
    console.log('\n=== Failed Queries ===');
    for (const failure of results.failedQueries) {
      console.log(`Category: ${failure.category}`);
      console.log(`Query: "${failure.query}"`);
      console.log(`Score: ${failure.score.toFixed(2)}`);
      console.log(`Reason: ${failure.reason}`);
      console.log('---');
    }
  }
}

/**
 * Main function to run tests and log results
 */
export function testMockResponses() {
  console.log('Running mock response tests...');
  const results = runMockResponseTests();
  logTestResults(results);
  
  // Determine if tests passed
  const passThreshold = 0.8; // 80% of responses should be valid
  const passed = results.validResponses / results.totalQueries >= passThreshold;
  
  if (passed) {
    console.log('\n✅ Mock response tests PASSED');
  } else {
    console.log('\n❌ Mock response tests FAILED');
    console.log(`Expected at least ${passThreshold * 100}% valid responses, but got ${(results.validResponses / results.totalQueries * 100).toFixed(2)}%`);
  }
}

// Run tests
testMockResponses(); 