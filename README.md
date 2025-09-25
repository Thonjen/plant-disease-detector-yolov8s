# 🌿 Plant Disease Detector PWA

An AI-powered Progressive Web App for detecting plant diseases using YOLOv8s and ONNX Runtime. This application runs entirely in the browser, ensuring privacy and speed without requiring server-side processing.

## ✨ Features

- **🚀 Browser-based AI**: ONNX model runs directly in your browser using WebAssembly
- **📱 Progressive Web App**: Installable on mobile devices and desktop
- **🎯 Real-time Detection**: Upload images and get instant disease detection results
- **🔒 Privacy First**: All processing happens locally - your images never leave your device
- **📦 Offline Capable**: Works offline once installed (model cached locally)
- **🎨 Modern UI**: Responsive design with dark mode support
- **⚡ Fast Performance**: Optimized with Next.js 15 and Turbopack

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **AI/ML**: ONNX Runtime Web, YOLOv8s model
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **Build**: Turbopack (development), Webpack (production)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/plant-disease-detector-yolov8s.git
   cd plant-disease-detector-yolov8s
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Add your ONNX model**
   - Place your trained `best.onnx` YOLOv8s model in the `public/` directory
   - The model should be trained on plant disease dataset with appropriate class labels

4. **Add PWA Icons** (Optional)
   - Replace placeholder files with actual icons:
     - `public/icon-192x192.png` (192x192 pixels)
     - `public/icon-512x512.png` (512x512 pixels)
     - `public/apple-icon.png` (180x180 pixels)

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

The app will automatically:
- Load the ONNX model from `/best.onnx`
- Enable hot reloading for development
- Disable PWA service worker in development mode

### Building for Production

```bash
npm run build
npm start
```

This will create an optimized production build with:
- Service worker for PWA functionality
- Model caching for offline use
- Optimized bundling and minification

## 📱 PWA Installation

### Mobile Devices
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt or menu option
3. Follow the installation prompts
4. The app will appear as a native app on your home screen

### Desktop
1. Open the app in Chrome, Edge, or other Chromium-based browsers
2. Look for the install icon in the address bar
3. Click to install the PWA
4. Access from your desktop or start menu

## 🎯 Usage

1. **Upload Image**: Click the upload area or drag & drop a leaf image
2. **Wait for Analysis**: The AI model will process the image (first load may take a few seconds)
3. **View Results**: Bounding boxes will appear around detected diseases with confidence scores
4. **Interpret Results**: 
   - Green boxes: Healthy plants
   - Red boxes: Severe diseases (rust, blight)
   - Orange boxes: Moderate diseases (spots, scabs)
   - Purple boxes: Other detected conditions

## 🔧 Customization

### Adding New Disease Classes

1. Update the `DISEASE_LABELS` array in `app/component/LeafDetector.tsx`
2. Ensure your ONNX model outputs match the number of classes
3. Adjust the `numClasses` variable in the `parseOutput` function

### Model Configuration

The app expects a YOLOv8s model with:
- Input shape: `[1, 3, 640, 640]` (batch, channels, height, width)
- Input name: `images`
- Output name: `output0`
- Output shape: `[1, 84, 8400]` (for 80 classes) or `[1, classes+4, 8400]`

### Styling

The app uses Tailwind CSS. Customize colors, layout, and components by editing:
- `app/globals.css` - Global styles
- `app/component/LeafDetector.tsx` - Component-specific styles
- `tailwind.config.js` - Tailwind configuration

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub first
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure build settings
   - Your app will be live at `https://your-app.vercel.app`

3. **Custom Domain** (Optional)
   - Add your custom domain in Vercel dashboard
   - Configure DNS settings as instructed

### Other Platforms

**Netlify**
```bash
npm run build
# Upload the 'out' folder (if using static export)
```

**GitHub Pages**
```bash
# Add to next.config.ts
output: 'export'
trailingSlash: true
images: { unoptimized: true }
```

**Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Model Performance

### Supported Diseases

The default model can detect 38+ plant diseases including:
- **Apple**: Scab, Black rot, Cedar apple rust
- **Corn**: Cercospora leaf spot, Common rust, Northern Leaf Blight
- **Tomato**: Bacterial spot, Early blight, Late blight, Leaf Mold
- **Grape**: Black rot, Esca, Leaf blight
- **Potato**: Early blight, Late blight
- And many more...

### Performance Tips

- **Image Quality**: Use clear, well-lit images for best results
- **Image Size**: Larger images provide more detail but take longer to process
- **Multiple Leaves**: The model can detect multiple diseases in a single image
- **Confidence Threshold**: Detections below 25% confidence are filtered out

## 🐛 Troubleshooting

### Common Issues

**Model Loading Fails**
- Ensure `best.onnx` exists in the `public/` directory
- Check browser console for specific error messages
- Verify the model is compatible with ONNX Runtime Web

**PWA Not Installing**
- Ensure HTTPS is enabled (required for PWA)
- Check that all PWA requirements are met in browser dev tools
- Verify `manifest.json` is accessible

**Slow Performance**
- First model load is slower (downloading and initializing)
- Subsequent runs should be faster (model cached)
- Consider using a smaller model for faster inference

**Detection Accuracy**
- Ensure good image quality and lighting
- Try different angles or closer shots
- Verify the model was trained on similar plant types

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Supported with WebAssembly
- **Safari**: Limited support (WebAssembly required)
- **Mobile browsers**: Generally supported on modern devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [YOLOv8](https://github.com/ultralytics/ultralytics) for the object detection model
- [ONNX Runtime](https://onnxruntime.ai/) for browser-based inference
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- Plant disease datasets and research community

## 📞 Support

If you encounter issues or have questions:
1. Check the [Issues](https://github.com/yourusername/plant-disease-detector-yolov8s/issues) page
2. Create a new issue with detailed information
3. Include browser version, error messages, and steps to reproduce

---

**Made with 🌱 for sustainable agriculture and plant health monitoring**
