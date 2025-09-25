'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as ort from 'onnxruntime-web';
import * as tf from '@tensorflow/tfjs';
import PlantHealthChecker from './PlantHealthChecker';

// Disease labels for different models
const DISEASE_LABELS = {
     plant: ['Brown spot', 'Leaf Blight', 'Leaf Scald', 'Leaf blast', 'Narrow brown spot', 'healthy'],
  rice: ['Brown spot', 'Leaf Blight', 'Leaf Scald', 'Leaf blast', 'Narrow brown spot', 'healthy'], // Same classes as plant model since both use YOLO
  gemini: [] // Gemini doesn't use predefined labels
};

const MODEL_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.4,      // Primary confidence threshold
  HIGH_CONFIDENCE_THRESHOLD: 0.75, // High confidence threshold for reliable results
  UNCERTAIN_THRESHOLD: 0.5,       // Below this, consider result uncertain
  SECONDARY_THRESHOLD: 0.3,       // Secondary filter after NMS
  NMS_IOU_THRESHOLD: 0.4,         // IoU threshold for NMS
  MAX_DETECTIONS: 5,              // Maximum number of detections to display
  INPUT_SIZE: 640,                // Model input size (both models use YOLO format)
  AUGMENTATION_COUNT: 5,          // Number of augmented versions to test
};

// Model types and their configurations
const MODEL_TYPES = {
  plant: {
    type: 'onnx',
    inputSize: MODEL_CONFIG.INPUT_SIZE,
    path: '/Models/PlantModel/best.onnx'
  },
  rice: {
    type: 'onnx',
    inputSize: MODEL_CONFIG.INPUT_SIZE, // YOLO input size
    path: '/Models/RiceModel/best.onnx'
  },
  gemini: {
    type: 'gemini',
    inputSize: 0,
    path: ''
  }
};

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
  label: string;
}

interface AugmentedResult {
  boxes: BoundingBox[];
  augmentationType: string;
}

interface ConsolidatedResult {
  box: BoundingBox;
  votes: number;
  avgConfidence: number;
  isHighConfidence: boolean;
  isUncertain: boolean;
}

// Dataset information for each model
const DATASET_INFO = {
  plant: {
    name: 'Plant Model (YOLO)',
    trainSet: { percentage: 70, count: 977 },
    validSet: { percentage: 20, count: 277 },
    testSet: { percentage: 10, count: 140 }
  },
  rice: {
    name: 'Rice Model (YOLO)',
    trainSet: { percentage: 80, count: 2997 },
    validSet: { percentage: 13, count: 489 },
    testSet: { percentage: 7, count: 247 }
  },
  gemini: {
    name: 'Gemini AI Model',
    trainSet: { percentage: 0, count: 0 },
    validSet: { percentage: 0, count: 0 },
    testSet: { percentage: 0, count: 0 }
  }
};

export default function LeafDetector() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [uncertainResults, setUncertainResults] = useState<ConsolidatedResult[]>([]);
  const [currentModel, setCurrentModel] = useState<'plant' | 'rice' | 'gemini'>('plant');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const tfModelRef = useRef<tf.GraphModel | null>(null);

  // Load model (ONNX or Keras based on model type)
  const loadModel = useCallback(async (modelType?: 'plant' | 'rice' | 'gemini') => {
    const targetModel = modelType || currentModel;
    if (targetModel === 'gemini') {
      setModelLoaded(true);
      return;
    }
    try {
      setLoading(true);
      setError('');
      
      const modelConfig = MODEL_TYPES[targetModel];
      console.log(`Loading ${targetModel} model (${modelConfig.type})...`);
      
      if (modelConfig.type === 'onnx') {
        // Configure ONNX Runtime for web
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
        
        // Release previous ONNX session if exists
        if (sessionRef.current) {
          try {
            // Check if session is valid before releasing
            if (sessionRef.current && typeof sessionRef.current.release === 'function') {
              await sessionRef.current.release();
            }
          } catch (err) {
            console.warn('Error releasing previous ONNX session:', err);
            // Continue with loading new model even if release fails
          }
          sessionRef.current = null;
        }
        
        const session = await ort.InferenceSession.create(modelConfig.path, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all'
        });
        
        sessionRef.current = session;
      } else if (modelConfig.type === 'tfjs') {
        // This branch is no longer used since both models are now ONNX
        // But keeping it for potential future use
        throw new Error('TensorFlow.js models are not currently supported');
      }
      
      setModelLoaded(true);
      console.log('Model loaded successfully');
    } catch (err) {
      console.error('Error loading model:', err);
      setError('Failed to load AI model. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, [currentModel]);

  // Load model on component mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Cleanup effect to release resources when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup ONNX session
      if (sessionRef.current) {
        try {
          // Check if session is valid before releasing
          if (sessionRef.current && typeof sessionRef.current.release === 'function') {
            sessionRef.current.release().catch((err) => {
              console.warn('Error releasing ONNX session during cleanup:', err);
            });
          }
        } catch (err) {
          console.warn('Error releasing ONNX session during cleanup:', err);
        }
        sessionRef.current = null;
      }

      // Cleanup TensorFlow.js model
      if (tfModelRef.current) {
        try {
          // Check if model is valid before disposing
          if (tfModelRef.current && typeof tfModelRef.current.dispose === 'function') {
            tfModelRef.current.dispose();
          }
        } catch (err) {
          console.warn('Error disposing TensorFlow.js model during cleanup:', err);
        }
        tfModelRef.current = null;
      }
    };
  }, []);

  // Preprocess image for model (640x640 input)
  const preprocessImage = (imageElement: HTMLImageElement): Float32Array => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const inputSize = MODEL_CONFIG.INPUT_SIZE;
    
    // Set canvas size to model input size
    canvas.width = inputSize;
    canvas.height = inputSize;
    
    // Clear canvas and set white background (important for proper preprocessing)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, inputSize, inputSize);
    
    // Calculate aspect ratio to maintain proportions
    const scale = Math.min(inputSize / imageElement.width, inputSize / imageElement.height);
    const scaledWidth = imageElement.width * scale;
    const scaledHeight = imageElement.height * scale;
    
    // Center the image
    const x = (inputSize - scaledWidth) / 2;
    const y = (inputSize - scaledHeight) / 2;
    
    // Draw image with proper scaling and centering (letterbox padding)
    ctx.drawImage(imageElement, x, y, scaledWidth, scaledHeight);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, inputSize, inputSize);
    const data = imageData.data;
    
    // Convert to float32 array and normalize (0-255 -> 0-1)
    const input = new Float32Array(3 * inputSize * inputSize);
    
    // YOLO expects CHW format (channels first): [R, G, B]
    const pixelCount = inputSize * inputSize;
    for (let i = 0; i < pixelCount; i++) {
      input[i] = data[i * 4] / 255.0; // Red channel
      input[pixelCount + i] = data[i * 4 + 1] / 255.0; // Green channel
      input[pixelCount * 2 + i] = data[i * 4 + 2] / 255.0; // Blue channel
    }
    
    return input;
  };



  // Apply image augmentations for robust detection
  const applyAugmentation = (imageElement: HTMLImageElement, augmentationType: string): Float32Array => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const inputSize = MODEL_CONFIG.INPUT_SIZE;
    
    // Set canvas size to model input size
    canvas.width = inputSize;
    canvas.height = inputSize;
    
    // Clear canvas and set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, inputSize, inputSize);
    
    // Calculate aspect ratio to maintain proportions
    const scale = Math.min(inputSize / imageElement.width, inputSize / imageElement.height);
    const scaledWidth = imageElement.width * scale;
    const scaledHeight = imageElement.height * scale;
    
    // Center the image
    const x = (inputSize - scaledWidth) / 2;
    const y = (inputSize - scaledHeight) / 2;
    
    // Save canvas state
    ctx.save();
    
    // Apply augmentations based on type
    ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
    
    switch (augmentationType) {
      case 'rotate_5':
        ctx.rotate(5 * Math.PI / 180);
        break;
      case 'rotate_-5':
        ctx.rotate(-5 * Math.PI / 180);
        break;
      case 'flip_horizontal':
        ctx.scale(-1, 1);
        break;
      case 'brightness_up':
        ctx.filter = 'brightness(1.1)';
        break;
      case 'brightness_down':
        ctx.filter = 'brightness(0.9)';
        break;
      case 'contrast_up':
        ctx.filter = 'contrast(1.1)';
        break;
      case 'zoom_in':
        ctx.scale(1.05, 1.05);
        break;
      case 'zoom_out':
        ctx.scale(0.95, 0.95);
        break;
      default:
        // Original image, no transformation
        break;
    }
    
    ctx.translate(-scaledWidth / 2, -scaledHeight / 2);
    
    // Draw image with augmentation applied
    ctx.drawImage(imageElement, 0, 0, scaledWidth, scaledHeight);
    
    // Restore canvas state
    ctx.restore();
    
    // Get image data and convert to float32 array (same as preprocessImageYOLO)
    const imageData = ctx.getImageData(0, 0, inputSize, inputSize);
    const data = imageData.data;
    
    const input = new Float32Array(3 * inputSize * inputSize);
    const pixelCount = inputSize * inputSize;
    
    for (let i = 0; i < pixelCount; i++) {
      input[i] = data[i * 4] / 255.0; // Red channel
      input[pixelCount + i] = data[i * 4 + 1] / 255.0; // Green channel
      input[2 * pixelCount + i] = data[i * 4 + 2] / 255.0; // Blue channel
    }
    
    return input;
  };





  // Non-Maximum Suppression to filter overlapping boxes
  const applyNMS = (boxes: BoundingBox[], iouThreshold: number = 0.4): BoundingBox[] => {
    // Sort by confidence (descending)
    boxes.sort((a, b) => b.confidence - a.confidence);
    
    const keep = [];
    const suppressed = new Set();
    
    for (let i = 0; i < boxes.length; i++) {
      if (suppressed.has(i)) continue;
      
      keep.push(boxes[i]);
      
      for (let j = i + 1; j < boxes.length; j++) {
        if (suppressed.has(j)) continue;
        
        // Calculate IoU
        const iou = calculateIoU(boxes[i], boxes[j]);
        if (iou > iouThreshold) {
          suppressed.add(j);
        }
      }
    }
    
    return keep;
  };

  // Calculate Intersection over Union
  const calculateIoU = (box1: BoundingBox, box2: BoundingBox): number => {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
    
    if (x2 <= x1 || y2 <= y1) return 0;
    
    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;
    
    return intersection / union;
  };

  // Parse YOLO model output
  const parseOutput = (output: any, originalWidth: number, originalHeight: number, imageDisplayWidth: number, imageDisplayHeight: number, modelType: 'plant' | 'rice' | 'gemini'): BoundingBox[] => {
    const detections = [];
    
    // Get output data - try common output names
    let outputData;
    if (output.output0) {
      outputData = output.output0.data;
    } else if (output.output) {
      outputData = output.output.data;
    } else {
      // Use first available output
      const outputName = Object.keys(output)[0];
      outputData = output[outputName].data;
    }
    
    console.log('Output shape info:', Object.keys(output));
    console.log('Output data length:', outputData.length);
    
    // Get the actual output tensor to understand its shape
    const outputTensor = output.output0 || output.output || output[Object.keys(output)[0]];
    console.log('Output tensor dims:', outputTensor.dims);
    
    // YOLOv8 output format: [batch, 4+classes, 8400] -> flattened to [1 * (4+classes) * 8400]
    const numClasses = DISEASE_LABELS[modelType].length; // Use specified model's classes for YOLO parsing
    const numDetections = 8400;
    const numElements = 4 + numClasses; // bbox coords + class probabilities
    
    console.log(`Model classes: ${numClasses}, Expected elements per detection: ${numElements}, Detections: ${numDetections}`);
    console.log(`Expected total length: ${numElements * numDetections}, Actual length: ${outputData.length}`);
    
    // Sample some confidence values to check their range
    const sampleConfidences = [];
    for (let i = 0; i < Math.min(100, numDetections); i++) {
      let maxConf = 0;
      for (let j = 0; j < numClasses; j++) {
        const conf = outputData[(4 + j) * numDetections + i];
        if (conf > maxConf) maxConf = conf;
      }
      if (maxConf > 0.1) sampleConfidences.push(maxConf);
    }
    console.log('Sample confidence values:', sampleConfidences.slice(0, 10));
    
    // Calculate scale factors for letterbox preprocessing
    const inputSize = MODEL_CONFIG.INPUT_SIZE;
    const scale = Math.min(inputSize / originalWidth, inputSize / originalHeight);
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;
    const xOffset = (inputSize - scaledWidth) / 2;
    const yOffset = (inputSize - scaledHeight) / 2;
    
    // Scale factors to convert from model space to display space
    const scaleToDisplay = Math.min(imageDisplayWidth / originalWidth, imageDisplayHeight / originalHeight);
    
    for (let i = 0; i < numDetections; i++) {
      // YOLOv8 uses transposed output: [batch, anchors, 4+classes]
      // So data is arranged as: x0,y0,w0,h0,class0_0,class1_0,...,x1,y1,w1,h1,class0_1,class1_1,...
      
      const x = outputData[i]; // center x
      const y = outputData[numDetections + i]; // center y  
      const w = outputData[2 * numDetections + i]; // width
      const h = outputData[3 * numDetections + i]; // height
      
      // Find class with highest confidence
      let maxConfidence = 0;
      let classId = 0;
      
      for (let j = 0; j < numClasses; j++) {
        const confidence = outputData[(4 + j) * numDetections + i];
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          classId = j;
        }
      }
      
      // Filter by confidence threshold - using higher threshold for better model
      if (maxConfidence > MODEL_CONFIG.CONFIDENCE_THRESHOLD && maxConfidence <= 1.0 && w > 0 && h > 0) {
        // Convert from model coordinates to original image coordinates
        // Account for letterbox preprocessing
        const originalX = (x - xOffset) / scale;
        const originalY = (y - yOffset) / scale;
        const originalW = w / scale;
        const originalH = h / scale;
        
        // Convert to display coordinates
        const displayX = (originalX - originalW / 2) * scaleToDisplay;
        const displayY = (originalY - originalH / 2) * scaleToDisplay;
        const displayW = originalW * scaleToDisplay;
        const displayH = originalH * scaleToDisplay;
        
        detections.push({
          x: Math.max(0, displayX),
          y: Math.max(0, displayY),
          width: Math.min(displayW, imageDisplayWidth - displayX),
          height: Math.min(displayH, imageDisplayHeight - displayY),
          confidence: maxConfidence, // Keep original confidence (0-1 range)
          classId,
          label: DISEASE_LABELS[modelType][classId] || `Class ${classId}`
        });
      }
    }
    
    console.log(`Found ${detections.length} detections before NMS`);
    
    // Apply Non-Maximum Suppression
    const nmsDetections = applyNMS(detections, MODEL_CONFIG.NMS_IOU_THRESHOLD);
    console.log(`Found ${nmsDetections.length} detections after NMS`);
    
    // Sort by confidence (highest first) and limit to reasonable number
    const finalDetections = nmsDetections
      .sort((a, b) => b.confidence - a.confidence)
      .filter(det => det.confidence > MODEL_CONFIG.SECONDARY_THRESHOLD) // Secondary confidence filter
      .slice(0, MODEL_CONFIG.MAX_DETECTIONS); // Limit detections for clarity
    
    console.log(`Returning top ${finalDetections.length} detections`);
    
    return finalDetections;
  };

  // Consolidate results from multiple augmented versions
  const consolidateResults = (augmentedResults: AugmentedResult[]): ConsolidatedResult[] => {
    const allBoxes: BoundingBox[] = [];
    
    // Collect all boxes from all augmented versions
    augmentedResults.forEach(result => {
      allBoxes.push(...result.boxes);
    });
    
    if (allBoxes.length === 0) return [];
    
    // Group similar detections (same class, overlapping boxes)
    const groups: BoundingBox[][] = [];
    
    allBoxes.forEach(box => {
      let addedToGroup = false;
      
      for (let group of groups) {
        const representative = group[0];
        
        // Check if boxes are of same class and have significant overlap
        if (representative.classId === box.classId) {
          const iou = calculateIoU(representative, box);
          
          if (iou > 0.3) { // Lower IoU threshold for grouping across augmentations
            group.push(box);
            addedToGroup = true;
            break;
          }
        }
      }
      
      if (!addedToGroup) {
        groups.push([box]);
      }
    });
    
    // Convert groups to consolidated results
    const consolidated: ConsolidatedResult[] = groups.map(group => {
      const votes = group.length;
      const avgConfidence = group.reduce((sum, box) => sum + box.confidence, 0) / votes;
      
      // Use the box with highest confidence as representative
      const bestBox = group.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      // Create averaged bounding box coordinates
      const avgBox: BoundingBox = {
        x: group.reduce((sum, box) => sum + box.x, 0) / votes,
        y: group.reduce((sum, box) => sum + box.y, 0) / votes,
        width: group.reduce((sum, box) => sum + box.width, 0) / votes,
        height: group.reduce((sum, box) => sum + box.height, 0) / votes,
        confidence: avgConfidence,
        classId: bestBox.classId,
        label: bestBox.label
      };
      
      return {
        box: avgBox,
        votes,
        avgConfidence,
        isHighConfidence: avgConfidence >= MODEL_CONFIG.HIGH_CONFIDENCE_THRESHOLD,
        isUncertain: avgConfidence < MODEL_CONFIG.UNCERTAIN_THRESHOLD || votes < 2
      };
    });
    
    // Sort by average confidence (highest first)
    return consolidated.sort((a, b) => b.avgConfidence - a.avgConfidence);
  };

  // Run inference on multiple augmented versions
  const runAugmentedInference = async (imageElement: HTMLImageElement): Promise<ConsolidatedResult[]> => {
    if (!sessionRef.current) {
      throw new Error('YOLO model not loaded');
    }
    const augmentationTypes = [
      'original',
      'rotate_5',
      'rotate_-5',
      'flip_horizontal',
      'brightness_up',
      'brightness_down',
      'contrast_up',
      'zoom_in'
    ];

    const results: AugmentedResult[] = [];
    
    setProcessingStatus('Running inference on original image...');
    
    for (let i = 0; i < Math.min(MODEL_CONFIG.AUGMENTATION_COUNT, augmentationTypes.length); i++) {
      const augType = augmentationTypes[i];
      setProcessingStatus(`Processing ${augType === 'original' ? 'original' : 'augmented'} image ${i + 1}/${Math.min(MODEL_CONFIG.AUGMENTATION_COUNT, augmentationTypes.length)}...`);
      
      try {
        // Get preprocessed image data
        const inputData = augType === 'original' 
          ? preprocessImage(imageElement)
          : applyAugmentation(imageElement, augType);
        
        // Create input tensor
        const inputTensor = new ort.Tensor('float32', inputData, [1, 3, MODEL_CONFIG.INPUT_SIZE, MODEL_CONFIG.INPUT_SIZE]);
        
        // Run inference
        if (!sessionRef.current || typeof sessionRef.current.run !== 'function') {
          throw new Error('ONNX session is invalid or not loaded');
        }
        const output = await sessionRef.current.run({ images: inputTensor });
        
        // Parse output
        const boxes = parseOutput(
          output, 
          imageElement.width, 
          imageElement.height,
          imageDimensions.width,
          imageDimensions.height,
          currentModel
        );
        
        results.push({
          boxes,
          augmentationType: augType
        });
        
        // Small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error(`Error processing ${augType}:`, error);
      }
    }
    
    setProcessingStatus('Consolidating results...');
    
    // Consolidate all results
    const consolidated = consolidateResults(results);
    
    console.log(`Processed ${results.length} augmented versions, found ${consolidated.length} consolidated detections`);
    
    return consolidated;
  };



  // Run inference with augmented versions (handles both ONNX and TensorFlow.js)
  const runInference = async (file: File) => {
    const modelConfig = MODEL_TYPES[currentModel];
    
    // Check if ONNX model is loaded (both models are now ONNX)
    if (!sessionRef.current) {
      await loadModel();
      if (!sessionRef.current) return;
    }

    try {
      setLoading(true);
      setError('');
      setBoxes([]);
      setUncertainResults([]);
      setProcessingStatus('Loading image...');

      // Create image element
      const imageElement = new Image();
      const imageUrl = URL.createObjectURL(file);
      
      imageElement.onload = async () => {
        try {
          // Store original dimensions for scaling
          setImageDimensions({ width: imageElement.width, height: imageElement.height });
          
          console.log('Running augmented inference...');
          
          // Run inference on multiple augmented versions
          const modelConfig = MODEL_TYPES[currentModel];
          const consolidatedResults = await runAugmentedInference(imageElement);
          
          setProcessingStatus('Analyzing results...');
          
          // Separate high-confidence and uncertain results
          const highConfidenceResults = consolidatedResults.filter((result: ConsolidatedResult) => !result.isUncertain);
          const uncertainResults = consolidatedResults.filter((result: ConsolidatedResult) => result.isUncertain);
          
          // Convert high-confidence results back to BoundingBox format for display
          const finalBoxes = highConfidenceResults.map((result: ConsolidatedResult) => result.box).slice(0, MODEL_CONFIG.MAX_DETECTIONS);
          
          setBoxes(finalBoxes);
          setUncertainResults(uncertainResults);
          
          console.log(`Final results: ${finalBoxes.length} high-confidence, ${uncertainResults.length} uncertain`);
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
          setProcessingStatus('');
          
        } catch (err) {
          console.error('Inference error:', err);
          setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
          setProcessingStatus('');
        } finally {
          setLoading(false);
        }
      };
      
      imageElement.onerror = () => {
        setError('Failed to load image. Please try a different file.');
        setLoading(false);
        setProcessingStatus('');
        URL.revokeObjectURL(imageUrl);
      };
      
      imageElement.src = imageUrl;
    } catch (err) {
      console.error('Error during inference:', err);
      setError('An error occurred during analysis.');
      setLoading(false);
      setProcessingStatus('');
    }
  };

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file is too large. Please select a file under 10MB.');
        return;
      }
      
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      runInference(file);
    }
  };

  // Handle model switch
  const handleModelSwitch = async (modelType: 'plant' | 'rice' | 'gemini') => {
    if (modelType !== currentModel && !loading) {
      setCurrentModel(modelType);
      setBoxes([]);
      setError('');
      setUncertainResults([]);
      await loadModel(modelType);
    }
  };

  // Get color for bounding box based on disease type
  const getBoxColor = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    
    // Healthy plants - green
    if (lowerLabel.includes('healthy')) {
      return '#22c55e'; // green for healthy
    }
    
    // Rice model - binary classification
    if (lowerLabel.includes('diseased')) {
      return '#ef4444'; // red for diseased
    }
    
    // Plant model diseases
    if (lowerLabel.includes('leaf') && !lowerLabel.includes('spot') && 
        !lowerLabel.includes('blight') && !lowerLabel.includes('rust') && 
        !lowerLabel.includes('scab') && !lowerLabel.includes('virus') && 
        !lowerLabel.includes('mildew') && !lowerLabel.includes('rot') &&
        !lowerLabel.includes('mold')) {
      return '#22c55e'; // green for healthy
    }
    
    // Severe diseases - red
    if (lowerLabel.includes('blight') || lowerLabel.includes('rust') || 
        lowerLabel.includes('rot') || lowerLabel.includes('virus')) {
      return '#ef4444'; // red for severe
    }
    
    // Moderate diseases - orange
    if (lowerLabel.includes('spot') || lowerLabel.includes('scab') || 
        lowerLabel.includes('mildew') || lowerLabel.includes('mold')) {
      return '#f97316'; // orange for moderate
    }
    
    // Other diseases - purple
    return '#8b5cf6'; // purple for other
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Model Selection */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">AI Model Selection</h2>
              </div>
              <p className="text-gray-600 text-lg">Choose your specialized detection model for suboptimal results</p>
            </div>
            <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
              <button
                onClick={() => handleModelSwitch('plant')}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-sm flex items-center gap-3 ${
                  currentModel === 'plant'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/80 hover:shadow-md'
                }`}
              >
                <span className="text-lg">🌿</span>
                <span>Plant Disease</span>
              </button>
              <button
                onClick={() => handleModelSwitch('rice')}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-sm flex items-center gap-3 ${
                  currentModel === 'rice'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/80 hover:shadow-md'
                }`}
              >
                <span className="text-lg">🌾</span>
                <span>Rice Disease</span>
              </button>
              <button
                onClick={() => handleModelSwitch('gemini')}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 text-sm flex items-center gap-3 ${
                  currentModel === 'gemini'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/80 hover:shadow-md'
                }`}
              >
                <span className="text-lg">🤖</span>
                <span>AI Health Check</span>
              </button>
            </div>
          </div>

                    {/* Dataset Information */}
          {currentModel !== 'gemini' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
              <h3 className="text-lg font-bold text-green-900">
                {DATASET_INFO[currentModel].name} Training Dataset
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/70 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-black text-green-600 mb-2">
                  {DATASET_INFO[currentModel].trainSet.percentage}%
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {DATASET_INFO[currentModel].trainSet.count.toLocaleString()} images
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Training</div>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-black text-emerald-600 mb-2">
                  {DATASET_INFO[currentModel].validSet.percentage}%
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {DATASET_INFO[currentModel].validSet.count.toLocaleString()} images
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Validation</div>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-3xl font-black text-teal-600 mb-2">
                  {DATASET_INFO[currentModel].testSet.percentage}%
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {DATASET_INFO[currentModel].testSet.count.toLocaleString()} images
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Testing</div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Gemini AI Health Checker */}
      {currentModel === 'gemini' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5"></div>
          <div className="relative p-8">
            <PlantHealthChecker />
          </div>
        </div>
      )}

      {/* Image Upload Section */}
      {currentModel !== 'gemini' && (
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 to-indigo-600/3"></div>
        <div className="relative p-8">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Image Analysis</h2>
            </div>
            <p className="text-gray-600 text-lg">Upload your plant/rice image for AI-powered disease detection</p>
          </div>
          
          {/* File Upload */}
          <div className="mb-8">
            <div className="group relative border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label
                htmlFor="image-upload"
                className="relative cursor-pointer flex flex-col items-center group-hover:scale-105 transition-transform duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <span className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Upload Image</span>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Drag and drop your plant/rice image here, or click to browse
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">JPG</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">PNG</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">WebP</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Max 10MB</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Analyze Button */}
          {imageFile && (
            <div className="mb-8">
              <button
                onClick={() => runInference(imageFile)}
                disabled={loading || !modelLoaded}
                className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {loading ? (
                  <>
                    <div className="relative">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                    </div>
                    <span className="text-lg">Analyzing Image...</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔍</span>
                    </div>
                    <span className="text-lg relative z-10">Start AI Analysis</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status Display */}
          {processingStatus && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-blue-700 text-center font-medium">{processingStatus}</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✕</span>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Image Display */}
          {imageUrl && (
            <div className="relative mb-8">
              <div className="relative border-2 border-white/50 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5"></div>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Uploaded leaf"
                className="max-w-full h-auto"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  setImageDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                  });
                }}
              />
              
              {/* Bounding boxes overlay */}
              {boxes.length > 0 && (
                <svg
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                  preserveAspectRatio="xMidYMid slice"
                >
                  {boxes.map((box, index) => (
                    <g key={index}>
                      <rect
                        x={box.x}
                        y={box.y}
                        width={box.width}
                        height={box.height}
                        fill="none"
                        stroke={getBoxColor(box.label)}
                        strokeWidth="3"
                      />
                      <rect
                        x={box.x}
                        y={box.y - 25}
                        width={box.label.length * 8 + 20}
                        height="22"
                        fill={getBoxColor(box.label)}
                        rx="2"
                      />
                      <text
                        x={box.x + 10}
                        y={box.y - 8}
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {box.label} ({(box.confidence * 100).toFixed(0)}%)
                      </text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>
        )}

          {/* Results */}
          {boxes.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-2xl border border-white/50 overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">✅</span>
                      </div>
                      Detection Results
                    </h3>
                    <div className="px-3 py-1 bg-white/20 rounded-full">
                      <span className="text-white font-semibold text-sm">{boxes.length} found</span>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100/50">
                  {boxes.map((box, index) => (
                    <div key={index} className="group flex items-center justify-between p-6 hover:bg-white/60 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div 
                            className="w-4 h-4 rounded-full shadow-lg" 
                            style={{ backgroundColor: getBoxColor(box.label) }}
                          ></div>
                          <div 
                            className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-30" 
                            style={{ backgroundColor: getBoxColor(box.label) }}
                          ></div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">{box.label}</div>
                          <div className="text-sm text-gray-500 font-medium">
                            {box.width.toFixed(0)}×{box.height.toFixed(0)}px detection area
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-2xl text-green-600 group-hover:text-green-700 transition-colors">
                          {(box.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">confidence</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Uncertain Results */}
          {uncertainResults.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/50 rounded-2xl border border-amber-200/50 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">⚠</span>
                  </div>
                  <h3 className="text-lg font-bold text-amber-800">
                    Low Confidence Detections
                  </h3>
                </div>
                <p className="text-amber-700 mb-6 leading-relaxed">
                  These detections have lower confidence scores. Consider retaking the image with better lighting, focus, or different angles for more accurate results.
                </p>
                <div className="space-y-3">
                  {uncertainResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/80 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: getBoxColor(result.box.label) }}
                        ></div>
                        <span className="font-medium text-gray-800">{result.box.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-600">
                          {(result.avgConfidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Results Message */}
          {!loading && imageUrl && boxes.length === 0 && uncertainResults.length === 0 && (
            <div className="bg-gradient-to-br from-gray-50 via-emerald-50/50 to-teal-50/50 p-8 rounded-2xl text-center border border-green-200/50 shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6">
<svg
  className="w-8 h-8 text-black"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M8 10c0-2 3-3 4-3s4 1 4 3c0 2-3 3-4 5m0 4h.01"
  />
</svg>

              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-xl">No Diseases Detected</h3>
              <p className="text-gray-700 leading-relaxed max-w-md mx-auto">
                I didn't detect anything, If you suspect issues, try:
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>• Better lighting conditions</p>
                <p>• Closer focus on affected areas</p>
                <p>• Different camera angles</p>
              </div>
            </div>
          )}

          {/* Hidden canvas for image preprocessing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Accuracy Disclaimer */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong className="font-semibold">Important Notice:</strong> AI predictions serve as guidance only. Always consult agricultural experts or professionals for critical plant health decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

    </div>
  );
}
