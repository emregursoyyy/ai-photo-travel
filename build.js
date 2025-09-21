// Build script for Cloudflare Pages deployment
// This script injects environment variables into the HTML file

const fs = require('fs');
const path = require('path');

// Read the HTML template
let htmlContent = fs.readFileSync('ai-photo-editor.html', 'utf8');

// Replace environment variable placeholders
const envVars = {
    'HUGGING_FACE_TOKEN': process.env.HUGGING_FACE_TOKEN || '',
    'REPLICATE_TOKEN': process.env.REPLICATE_TOKEN || '',
    'REMOVEBG_TOKEN': process.env.REMOVEBG_TOKEN || '',
    'PHOTOROOM_TOKEN': process.env.PHOTOROOM_TOKEN || ''
};

// Replace placeholders in the HTML
for (const [key, value] of Object.entries(envVars)) {
    const placeholder = `{{${key}}}`;
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
}

// Write the processed HTML to index.html
fs.writeFileSync('index.html', htmlContent);

console.log('Build completed successfully!');
console.log('Environment variables injected:');
for (const [key, value] of Object.entries(envVars)) {
    console.log(`${key}: ${value ? '***' : 'not set'}`);
}