import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as serviceWorker from './serviceWorker';

// Register the service worker for production
if (!import.meta.env.DEV) {
  serviceWorker.register();
}

createRoot(document.getElementById("root")!).render(<App />);
