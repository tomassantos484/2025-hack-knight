import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as serviceWorker from './serviceWorker';
import { setupMockApi } from './api/setupApi';

// Set up the mock API for development
if (import.meta.env.DEV) {
  setupMockApi();
} else {
  // Register the service worker for production
  serviceWorker.register();
}

createRoot(document.getElementById("root")!).render(<App />);
