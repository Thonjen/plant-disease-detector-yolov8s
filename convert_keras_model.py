#!/usr/bin/env python3
"""
Convert Keras model to TensorFlow.js format
"""

import os
import sys

def install_requirements():
    """Install required packages"""
    try:
        import tensorflow as tf
        import tensorflowjs as tfjs
        print("✓ Required packages already installed")
        return True
    except ImportError:
        print("Installing required packages...")
        os.system("pip install tensorflow tensorflowjs")
        try:
            import tensorflow as tf
            import tensorflowjs as tfjs
            print("✓ Packages installed successfully")
            return True
        except ImportError:
            print("❌ Failed to install required packages")
            return False

def convert_model():
    """Convert Keras model to TensorFlow.js format"""
    try:
        import tensorflow as tf
        import tensorflowjs as tfjs
        
        # Paths
        keras_model_path = "public/Models/RiceModel/rice_efficientnet.keras"
        output_path = "public/Models/RiceModel/rice_efficientnet_tfjs"
        
        print(f"Loading Keras model from: {keras_model_path}")
        
        # Check if input file exists
        if not os.path.exists(keras_model_path):
            print(f"❌ Input file not found: {keras_model_path}")
            return False
        
        # Load the Keras model
        model = tf.keras.models.load_model(keras_model_path)
        print("✓ Keras model loaded successfully")
        
        # Print model summary
        print("\nModel Summary:")
        model.summary()
        
        # Convert to TensorFlow.js format
        print(f"\nConverting to TensorFlow.js format...")
        print(f"Output path: {output_path}")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)
        
        # Convert the model
        tfjs.converters.save_keras_model(model, output_path)
        
        print("✓ Model converted successfully!")
        print(f"✓ TensorFlow.js model saved to: {output_path}")
        
        # List output files
        print("\nGenerated files:")
        for file in os.listdir(output_path):
            file_path = os.path.join(output_path, file)
            size = os.path.getsize(file_path)
            print(f"  - {file} ({size:,} bytes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during conversion: {str(e)}")
        return False

if __name__ == "__main__":
    print("Keras to TensorFlow.js Model Converter")
    print("=" * 40)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Convert model
    if not convert_model():
        sys.exit(1)
    
    print("\n🎉 Conversion completed successfully!")
    print("\nNext steps:")
    print("1. The converted model is now available for use in your web application")
    print("2. The model will be automatically loaded when you select 'Rice Model'")
    print("3. Test the application by uploading a rice disease image")