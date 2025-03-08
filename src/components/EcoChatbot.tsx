import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Leaf, Bot, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { handleChatRequest } from '../api/chat';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Example prompts for the chatbot
const examplePrompts = [
  "How can I reduce my carbon footprint?",
  "Tips for eco-friendly shopping",
  "How to start composting at home",
  "Sustainable alternatives to plastic",
];

const EcoChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi, my name is EcoBot. How can I help you with sustainability today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (promptText = inputValue.trim()) => {
    if ((!promptText || isLoading)) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: promptText,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Get message history excluding the welcome message
      const messageHistory = messages
        .filter(msg => msg.id !== '1') // Exclude the welcome message
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
      
      // Call the Gemini API directly
      const result = await handleChatRequest(promptText, messageHistory);
      
      if (result.error) {
        throw new Error(result.response);
      }
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat flow:', error);
      
      // Default error message
      let errorMessage = "I'm having trouble connecting right now. Here are some general sustainability tips:\n\n" +
        "• Reduce single-use plastics\n" +
        "• Conserve water and energy\n" +
        "• Recycle properly\n" +
        "• Support sustainable businesses\n\n" +
        "Please try again later.";
      
      // Only show technical error details in development
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        errorMessage += `\n\nDevelopment error details: ${error.message}`;
      }
      
      toast.error('Connection issue. Showing general information instead.');
      
      // Add error message
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    
    // Set the height to scrollHeight to fit the content
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle example prompt click
  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-eco-green text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>
      
      {/* Chat window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200"
        >
          {/* Chat header */}
          <div className="bg-eco-green text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Bot size={20} className="mr-2" />
              <h3 className="font-medium">EcoVision Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-eco-cream/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-eco-green text-white rounded-tr-none'
                      : 'bg-white text-eco-dark rounded-tl-none shadow-sm border border-gray-100'
                  }`}
                >
                  <div className="flex items-start mb-1">
                    <div className="shrink-0 mr-2">
                      {message.role === 'user' ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-eco-green" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <Bot size={16} className="text-eco-green mr-2" />
                    <Loader2 size={16} className="animate-spin text-eco-green" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Example prompts - shown when no messages except welcome */}
          {messages.length === 1 && (
            <div className="border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 p-3">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left p-2 rounded-md border border-eco-green/20 bg-eco-cream/30 hover:bg-eco-cream/50 transition-colors text-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-end">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sustainability..."
                className="flex-1 resize-none border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-eco-green/50 min-h-[40px]"
                rows={1}
                style={{ height: 'auto', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`ml-2 p-2 rounded-full ${
                  !inputValue.trim() || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-eco-green text-white hover:bg-eco-green/90'
                }`}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center">
              <Leaf size={12} className="text-eco-green mr-1" />
              Powered by Gemini AI
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EcoChatbot; 