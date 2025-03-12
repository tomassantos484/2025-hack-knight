import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as serviceWorker from './serviceWorker';
import { checkAllRequiredEnv } from './utils/envCheck';

// Check environment variables in development mode
// This is done asynchronously to not block rendering
if (import.meta.env.DEV) {
  // Use setTimeout to move this check to the next event loop tick
  // This prevents it from blocking the initial render
  setTimeout(() => {
    checkAllRequiredEnv();
  }, 0);
}

// Register the service worker for production
if (!import.meta.env.DEV) {
  serviceWorker.register();
}

// Render the app regardless of environment variable status
createRoot(document.getElementById("root")!).render(<App />);
