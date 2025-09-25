# ONNX Model Specifications

## Model Requirements

The Plant Disease Detector PWA expects a YOLOv8s ONNX model with the following specifications:

### Input Specification
- **Name**: `images`
- **Shape**: `[1, 3, 640, 640]`
- **Type**: `float32`
- **Format**: NCHW (batch, channels, height, width)
- **Preprocessing**: RGB channels, normalized to [0, 1]

### Output Specification
- **Name**: `output0` (or similar)
- **Shape**: `[1, num_classes + 4, 8400]`
- **Type**: `float32`
- **Format**: YOLO detection format

### Expected Classes

The default implementation supports plant disease detection with classes including:

1. Apple diseases (scab, black rot, cedar apple rust, healthy)
2. Corn diseases (cercospora leaf spot, common rust, northern leaf blight, healthy)
3. Tomato diseases (bacterial spot, early blight, late blight, leaf mold, etc.)
4. Grape diseases (black rot, esca, leaf blight, healthy)
5. Potato diseases (early blight, late blight, healthy)
6. Other crops (blueberry, cherry, orange, peach, pepper, raspberry, soybean, squash, strawberry)

### Model Training

For best results, your model should be:

1. **Trained on plant disease datasets** such as:
   - PlantVillage dataset
   - PlantDoc dataset
   - Custom agricultural datasets

2. **Optimized for web deployment**:
   - Use ONNX optimization tools
   - Quantization for smaller file size (optional)
   - Target inference time < 1 second on modern browsers

3. **Validated for accuracy**:
   - mAP@0.5 > 0.7 recommended
   - Confidence threshold: 0.25 (adjustable in code)
   - IoU threshold: 0.4 for NMS (adjustable in code)

### Converting PyTorch YOLOv8 to ONNX

If you have a PyTorch YOLOv8 model, convert it using:

```python
from ultralytics import YOLO

# Load your trained model
model = YOLO('path/to/your/model.pt')

# Export to ONNX
model.export(
    format='onnx',
    imgsz=640,
    optimize=True,
    int8=False,  # Set to True for quantization
    dynamic=False,
    simplify=True
)
```

### File Placement

1. Place the exported `best.onnx` file in the `public/` directory
2. Ensure the file is accessible at `/best.onnx` when the app is running
3. File size should be optimized for web delivery (< 50MB recommended)

### Customization

To adapt the app for your specific model:

1. **Update class labels** in `app/component/LeafDetector.tsx`:
   ```typescript
   const DISEASE_LABELS = [
     'your_class_1',
     'your_class_2',
     // ... add your classes
   ];
   ```

2. **Adjust input/output names** if different:
   ```typescript
   const feeds = { your_input_name: tensor };
   const results = await session.run(feeds);
   const outputData = results.your_output_name.data;
   ```

3. **Modify preprocessing** if needed (different normalization, etc.)

4. **Update detection thresholds** based on your model's performance

### Performance Optimization

- **Model size**: Smaller models load faster but may have lower accuracy
- **Quantization**: INT8 quantization can reduce size by ~75%
- **Input resolution**: 416x416 or 512x512 for faster inference than 640x640
- **Batch processing**: Currently supports batch size 1 only

### Testing Your Model

1. Upload the model to `public/best.onnx`
2. Run `npm run setup` to verify the model is detected
3. Start the development server with `npm run dev`
4. Test with various plant images to validate performance
5. Check browser console for any loading or inference errors

### Troubleshooting

**Model not loading:**
- Check file path and permissions
- Verify ONNX format compatibility
- Monitor browser console for error messages

**Poor accuracy:**
- Ensure model was trained on similar image domains
- Check confidence and IoU thresholds
- Validate input preprocessing matches training

**Slow performance:**
- Consider model optimization/quantization
- Reduce input resolution if acceptable
- Check for WebAssembly support in target browsers