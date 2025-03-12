/**
 * Validator for mock responses to ensure they are relevant and accurate
 */

// Interface for validation result
export interface ValidationResult {
  isValid: boolean;
  score: number;
  reason?: string;
}

// List of sustainability-related terms to check for relevance
const sustainabilityTerms = [
  'eco',
  'sustain',
  'environment',
  'green',
  'recycl',
  'carbon',
  'footprint',
  'waste',
  'friendly',
  'climate',
  'conservation',
  'renewable',
  'reuse',
  'biodegradable',
  'compost',
  'organic',
  'pollution',
  'emissions'
];

/**
 * Validate a mock response to ensure it's relevant to the query and contains accurate information
 * @param query The user's query
 * @param response The mock response
 * @returns Validation result with score and reason if invalid
 */
export function validateMockResponse(query: string, response: string): ValidationResult {
  // Check if response is empty or too short
  if (!response || response.length < 20) {
    return {
      isValid: false,
      score: 0,
      reason: 'Response is empty or too short'
    };
  }

  // Calculate relevance score based on sustainability terms
  const relevanceScore = calculateRelevanceScore(query, response);
  
  // Calculate quality score based on response characteristics
  const qualityScore = calculateQualityScore(response);
  
  // Calculate overall score
  const overallScore = (relevanceScore + qualityScore) / 2;
  
  // Response is valid if overall score is above threshold
  const isValid = overallScore >= 0.6;
  
  return {
    isValid,
    score: overallScore,
    reason: isValid ? undefined : `Low relevance (${relevanceScore.toFixed(2)}) or quality (${qualityScore.toFixed(2)})`
  };
}

/**
 * Calculate relevance score based on sustainability terms in query and response
 * @param query The user's query
 * @param response The mock response
 * @returns Relevance score between 0 and 1
 */
function calculateRelevanceScore(query: string, response: string): number {
  const lowercaseQuery = query.toLowerCase();
  const lowercaseResponse = response.toLowerCase();
  
  // Check if query contains sustainability terms
  const queryTerms = sustainabilityTerms.filter(term => 
    lowercaseQuery.includes(term)
  );
  
  // Check if response contains sustainability terms
  const responseTerms = sustainabilityTerms.filter(term => 
    lowercaseResponse.includes(term)
  );
  
  // If query has sustainability terms, check if response has matching terms
  if (queryTerms.length > 0) {
    const matchingTerms = queryTerms.filter(term => 
      responseTerms.includes(term)
    );
    
    // Calculate match ratio
    const matchRatio = matchingTerms.length / queryTerms.length;
    
    // Return higher score for better matches
    return 0.5 + (matchRatio * 0.5);
  }
  
  // If query doesn't have sustainability terms, check if response redirects to sustainability
  if (responseTerms.length >= 3) {
    return 0.8; // Good redirection to sustainability topics
  }
  
  // If response has some sustainability terms
  if (responseTerms.length > 0) {
    return 0.6; // Acceptable redirection
  }
  
  // Response doesn't relate to sustainability
  return 0.3;
}

/**
 * Calculate quality score based on response characteristics
 * @param response The mock response
 * @returns Quality score between 0 and 1
 */
function calculateQualityScore(response: string): number {
  let score = 0;
  
  // Check response length
  if (response.length > 300) {
    score += 0.3; // Detailed response
  } else if (response.length > 100) {
    score += 0.2; // Adequate response
  } else {
    score += 0.1; // Brief response
  }
  
  // Check for structured content (bullet points or paragraphs)
  if (response.includes('•') || response.includes('\n\n')) {
    score += 0.2;
  }
  
  // Check for actionable advice
  const actionTerms = ['can', 'should', 'try', 'use', 'reduce', 'choose', 'consider', 'avoid'];
  const hasActionableAdvice = actionTerms.some(term => response.toLowerCase().includes(term));
  if (hasActionableAdvice) {
    score += 0.2;
  }
  
  // Check for specific examples
  const specificityIndicators = ['for example', 'such as', 'like', 'e.g.', 'i.e.', '%', 'degrees'];
  const hasSpecificExamples = specificityIndicators.some(term => response.toLowerCase().includes(term));
  if (hasSpecificExamples) {
    score += 0.2;
  }
  
  // Check for educational content
  const educationalIndicators = ['because', 'due to', 'as a result', 'impact', 'effect', 'benefit'];
  const hasEducationalContent = educationalIndicators.some(term => response.toLowerCase().includes(term));
  if (hasEducationalContent) {
    score += 0.1;
  }
  
  // Cap score at 1.0
  return Math.min(score, 1.0);
}

/**
 * Log validation statistics for all mock responses
 * This can be used during development to assess the quality of mock responses
 */
export function logMockResponseValidationStats(): void {
  // This function would be implemented to test all mock responses against common queries
  // and log statistics about their quality and relevance
  console.log('Mock response validation statistics would be logged here');
} 