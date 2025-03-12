import { getMockResponse } from './mockResponses';

// Test suite for mock responses
describe('Mock Responses', () => {
  // Test that the mock response system returns appropriate responses for different queries
  test('should return appropriate responses for different queries', () => {
    // Test greeting queries
    const greetingQueries = ['hello', 'hi there', 'hey', 'good morning'];
    greetingQueries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toContain('EcoBot');
      expect(response).toContain('sustainability');
    });

    // Test carbon footprint queries
    const carbonQueries = ['carbon footprint', 'reduce emissions', 'climate change'];
    carbonQueries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toContain('carbon');
      expect(response).toContain('reduce');
    });

    // Test plastic queries
    const plasticQueries = ['plastic waste', 'reduce plastic', 'plastic pollution'];
    plasticQueries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toContain('plastic');
      expect(response).toContain('reusable');
    });

    // Test composting queries
    const compostQueries = ['how to compost', 'composting tips', 'start composting'];
    compostQueries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toContain('compost');
      expect(response).toContain('bin');
    });

    // Test shopping queries
    const shoppingQueries = ['eco shopping', 'sustainable shopping', 'green products'];
    shoppingQueries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toContain('shopping');
      expect(response).toContain('sustainable');
    });

    // Test water conservation queries
    const waterQueries = ['save water', 'water conservation', 'reduce water usage'];
    waterQueries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toContain('water');
      expect(response).toContain('conservation');
    });
  });

  // Test that the default response is returned for unrecognized queries
  test('should return default response for unrecognized queries', () => {
    const unrecognizedQueries = [
      'quantum physics',
      'basketball scores',
      'stock market trends',
      'recipe for chocolate cake'
    ];

    unrecognizedQueries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toContain('sustainability');
      expect(response).toContain('eco-friendly');
    });
  });

  // Test that responses are not empty
  test('should never return empty responses', () => {
    const queries = [
      '',
      ' ',
      '?',
      'a',
      'hello',
      'sustainability',
      'random text'
    ];

    queries.forEach(query => {
      const response = getMockResponse(query);
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(10);
    });
  });

  // Test that responses are on-topic for sustainability
  test('should always return responses related to sustainability', () => {
    const queries = [
      'hello',
      'how are you',
      'thank you',
      'sorry',
      'random text',
      'what is the meaning of life'
    ];

    const sustainabilityTerms = [
      'eco',
      'sustain',
      'environment',
      'green',
      'recycl',
      'carbon',
      'footprint',
      'waste',
      'friendly'
    ];

    queries.forEach(query => {
      const response = getMockResponse(query);
      
      // Check if at least one sustainability term is present in the response
      const hasSustainabilityTerm = sustainabilityTerms.some(term => 
        response.toLowerCase().includes(term)
      );
      
      expect(hasSustainabilityTerm).toBe(true);
    });
  });

  // Test response quality metrics
  test('should provide responses with adequate length and detail', () => {
    const queries = [
      'carbon footprint',
      'plastic waste',
      'composting',
      'eco-friendly shopping',
      'water conservation'
    ];

    queries.forEach(query => {
      const response = getMockResponse(query);
      
      // Check response length (should be substantial)
      expect(response.length).toBeGreaterThan(100);
      
      // Check for bullet points or structured content (indicates detailed information)
      expect(response.includes('•') || response.includes('\n')).toBe(true);
      
      // Check for actionable advice
      const hasActionableAdvice = 
        response.includes('can') || 
        response.includes('should') || 
        response.includes('try') || 
        response.includes('use') ||
        response.includes('reduce') ||
        response.includes('choose');
      
      expect(hasActionableAdvice).toBe(true);
    });
  });
}); 