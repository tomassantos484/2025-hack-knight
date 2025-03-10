// Script to ensure the correct API URL is used in the build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the correct API URL
const CORRECT_API_URL = 'https://ecovision-backend-production.up.railway.app';
const INCORRECT_API_URL = 'https://ecovision-backend.vercel.app';

// Function to replace all occurrences of the Vercel API URL with the Railway API URL
function replaceApiUrl(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all occurrences of the Vercel API URL with the Railway API URL
    const updatedContent = content.replace(
      new RegExp(INCORRECT_API_URL.replace(/\./g, '\\.'), 'g'),
      CORRECT_API_URL
    );
    
    // Write the updated content back to the file if changes were made
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated API URL in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating API URL in ${filePath}`);
    return false;
  }
}

// Function to recursively process all files in a directory
function processDirectory(directory) {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Directory does not exist: ${directory}`);
      return 0;
    }
    
    let changesCount = 0;
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        changesCount += processDirectory(filePath);
      } else if (stats.isFile() && (
        filePath.endsWith('.js') || 
        filePath.endsWith('.ts') || 
        filePath.endsWith('.tsx') || 
        filePath.endsWith('.jsx') || 
        filePath.endsWith('.html') || 
        filePath.endsWith('.css')
      )) {
        // Process JavaScript, TypeScript, HTML, and CSS files
        if (replaceApiUrl(filePath)) {
          changesCount++;
        }
      }
    }
    
    return changesCount;
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
    return 0;
  }
}

// Main function
function main() {
  console.log('Starting API URL fix script...');
  
  let totalChanges = 0;
  
  // Process the src directory
  console.log('Processing src directory...');
  totalChanges += processDirectory(path.resolve(__dirname, 'src'));
  
  // Process the public directory
  console.log('Processing public directory...');
  totalChanges += processDirectory(path.resolve(__dirname, 'public'));
  
  // Process the dist directory if it exists (post-build)
  console.log('Processing dist directory...');
  totalChanges += processDirectory(path.resolve(__dirname, 'dist'));
  
  console.log(`API URL fix script completed. Made ${totalChanges} changes.`);
}

// Run the main function
main(); 