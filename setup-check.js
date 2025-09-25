#!/usr/bin/env node

/**
 * Development setup script for Plant Disease Detector PWA
 * This script helps verify the setup and provides helpful information
 */

const fs = require('fs');
const path = require('path');

console.log('🌿 Plant Disease Detector PWA - Development Setup Check\n');

// Check if ONNX model exists
const modelPath = path.join(__dirname, 'public', 'best.onnx');
if (!fs.existsSync(modelPath)) {
  console.log('⚠️  ONNX Model Missing:');
  console.log('   Please place your trained YOLOv8s model as "best.onnx" in the public/ directory');
  console.log('   The model should be trained on plant disease dataset\n');
} else {
  const stats = fs.statSync(modelPath);
  console.log('✅ ONNX Model Found:');
  console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Path: ${modelPath}\n`);
}

// Check PWA icons
const iconPaths = [
  'public/icon-192x192.png',
  'public/icon-512x512.png',
  'public/apple-icon.png'
];

console.log('📱 PWA Icons:');
iconPaths.forEach(iconPath => {
  const fullPath = path.join(__dirname, iconPath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${iconPath}`);
  } else {
    console.log(`   ⚠️  ${iconPath} (placeholder - replace with actual icon)`);
  }
});

console.log('\n🚀 Next Steps:');
console.log('   1. Run "npm install" to install dependencies');
console.log('   2. Run "npm run dev" to start development server');
console.log('   3. Open http://localhost:3000 in your browser');
console.log('   4. Upload a leaf image to test the disease detection\n');

console.log('📚 Additional Information:');
console.log('   - Model format: ONNX YOLOv8s (640x640 input)');
console.log('   - Supported formats: PNG, JPG, JPEG (max 10MB)');
console.log('   - Processing: Client-side only (privacy-first)');
console.log('   - PWA: Installable on mobile and desktop\n');

console.log('🔧 Troubleshooting:');
console.log('   - Model not loading: Check browser console for errors');
console.log('   - PWA not installing: Ensure HTTPS in production');
console.log('   - Slow performance: First load downloads and caches model\n');

console.log('Happy coding! 🌱');