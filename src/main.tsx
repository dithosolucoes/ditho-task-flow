
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a single root instance
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

// Render the app without StrictMode to prevent double mount
root.render(<App />);
