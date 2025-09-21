#!/usr/bin/env node

// Build script - Environment variable'ları config.js'e inject eder
const fs = require('fs');
const path = require('path');

// Environment variable'ları al
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN || 'YOUR_HUGGING_FACE_TOKEN_HERE';

// Config template'ini oku
let configContent = fs.readFileSync('config.js', 'utf8');

// Template placeholder'ları değiştir
configContent = configContent.replace('{{HUGGING_FACE_TOKEN}}', HUGGING_FACE_TOKEN);

// Güncellenmiş config.js'i yaz
fs.writeFileSync('config.js', configContent);

console.log('✅ Config.js updated with environment variables');
console.log('🚀 Ready for deployment!');