# ONNX Model Troubleshooting Guide

## Common Issues and Fixes

### 🔧 Issue: Confidence Scores Too High (>100%)

**Symptoms:**
- Confidence values like 63490% instead of 25-90%
- Many false positive detections

**Root Cause:**
- Model output is not being parsed correctly
- Confidence values may already be normalized or in different format

**Solutions:**
1. **Check Output Format**: Log the output shape and inspect data structure
   ```javascript
   console.log('Output keys:', Object.keys(results));
   console.log('Output shape:', results.output0?.dims || 'unknown');
   ```

2. **Verify Output Parsing**: YOLOv8 typically outputs `[1, 4+classes, 8400]`
   - First 4 values: bbox coordinates (x, y, w, h)
   - Next N values: class probabilities
   - Data is transposed: all x values, then all y values, etc.

3. **Apply Confidence Bounds**: Filter values between 0-1
   ```javascript
   if (maxConfidence > 0.25 && maxConfidence <= 1.0) {
       // Valid detection
   }
   ```

### 🖼️ Issue: Incorrect Bounding Box Positions

**Symptoms:**
- Boxes appear in wrong locations
- Boxes are too large/small
- Boxes don't align with detected objects

**Root Cause:**
- Improper coordinate scaling
- Missing letterbox padding adjustment
- Wrong input preprocessing

**Solutions:**
1. **Use Letterbox Preprocessing**: Maintain aspect ratio with padding
   ```javascript
   const scale = Math.min(640 / originalWidth, 640 / originalHeight);
   const scaledWidth = originalWidth * scale;
   const scaledHeight = originalHeight * scale;
   const xOffset = (640 - scaledWidth) / 2;
   const yOffset = (640 - scaledHeight) / 2;
   ```

2. **Adjust Coordinates**: Account for padding in output parsing
   ```javascript
   const originalX = (modelX - xOffset) / scale;
   const originalY = (modelY - yOffset) / scale;
   ```

3. **Verify Model Format**: Ensure coordinates are in center format (cx, cy, w, h)

### 🚫 Issue: Model Not Loading

**Symptoms:**
- "Failed to load AI model" error
- Network timeouts
- ONNX Runtime errors

**Solutions:**
1. **Check File Path**: Ensure `best.onnx` is in `public/` directory
2. **Verify File Size**: Large models (>50MB) may timeout
3. **Check Browser Support**: Ensure WebAssembly is enabled
4. **Use CDN for ONNX.js**: Set proper WASM paths
   ```javascript
   ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
   ```

### 📊 Issue: Poor Detection Accuracy

**Symptoms:**
- Missing obvious diseases
- Incorrect classifications
- Low confidence scores for obvious cases

**Solutions:**
1. **Check Image Preprocessing**: Ensure RGB order and 0-1 normalization
2. **Verify Model Training**: Confirm model was trained on similar images
3. **Adjust Confidence Threshold**: Lower to 0.1-0.2 for testing
4. **Review Class Labels**: Match labels with model's training classes

### 🐌 Issue: Slow Performance

**Symptoms:**
- Long inference times (>5 seconds)
- Browser freezing
- High memory usage

**Solutions:**
1. **Optimize Model**: Use quantization (INT8) or smaller model
2. **Enable WebAssembly**: Ensure WASM execution provider
3. **Reduce Input Size**: Try 416x416 or 512x512 instead of 640x640
4. **Limit Detections**: Show only top N results

## Debugging Steps

### 1. Enable Verbose Logging
```javascript
// Add to LeafDetector component
console.log('Input tensor shape:', tensor.dims);
console.log('Model input names:', session.inputNames);
console.log('Model output names:', Object.keys(results));
console.log('Output data sample:', outputData.slice(0, 20));
```

### 2. Test with Known Images
- Use images from the model's training dataset
- Start with high-quality, clear disease examples
- Verify results match expected classifications

### 3. Validate Model Conversion
```python
# Test model in Python first
import onnxruntime as ort
import numpy as np

session = ort.InferenceSession('best.onnx')
input_name = session.get_inputs()[0].name
output_names = [output.name for output in session.get_outputs()]

# Test with sample input
test_input = np.random.randn(1, 3, 640, 640).astype(np.float32)
results = session.run(output_names, {input_name: test_input})
print(f"Output shapes: {[r.shape for r in results]}")
```

### 4. Browser Developer Tools
- **Network Tab**: Check model download progress
- **Console Tab**: Look for error messages
- **Performance Tab**: Monitor memory usage
- **Application Tab**: Verify service worker caching

## Model Format Requirements

### Input Specification
```
Name: "images" (or check session.inputNames[0])
Shape: [1, 3, 640, 640]
Type: float32
Format: RGB, normalized to [0, 1]
```

### Output Specification (YOLOv8)
```
Name: "output0" (or similar)
Shape: [1, 4 + num_classes, 8400]
Type: float32
Layout: Transposed format
  - outputData[0:8400] = all x coordinates
  - outputData[8400:16800] = all y coordinates  
  - outputData[16800:25200] = all widths
  - outputData[25200:33600] = all heights
  - outputData[33600:...] = class probabilities
```

## Testing Checklist

- [ ] Model loads without errors
- [ ] Input preprocessing maintains aspect ratio
- [ ] Output parsing handles correct tensor layout
- [ ] Confidence scores are reasonable (0.25-0.95)
- [ ] Bounding boxes align with visual features
- [ ] Performance is acceptable (<3 seconds)
- [ ] Works across different browsers
- [ ] Handles various image sizes and formats

## Getting Help

If issues persist:
1. Check browser console for specific error messages
2. Test model with Python ONNX Runtime first
3. Verify model was exported correctly from training framework
4. Create minimal test case to isolate the problem
5. Consider using a pre-trained model for comparison