#!/usr/bin/env python3
"""
Test script to verify the mangrove classifier setup
"""

import sys
import os
sys.path.append('src')

import torch
from pathlib import Path
import config
from utils import count_images, get_data_loaders
from predict import MangroveClassifier

def test_setup():
    """Test basic setup and configuration"""
    print("🧪 Testing Mangrove Classifier Setup")
    print("=" * 50)
    
    # Test 1: Check Python and PyTorch
    print(f"✅ Python version: {sys.version}")
    print(f"✅ PyTorch version: {torch.__version__}")
    print(f"✅ CUDA available: {torch.cuda.is_available()}")
    
    # Test 2: Check directory structure
    required_dirs = ['data', 'models', 'src', 'notebooks']
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✅ Directory exists: {dir_name}/")
        else:
            print(f"❌ Missing directory: {dir_name}/")
    
    # Test 3: Check data availability
    mangrove_count, non_mangrove_count = count_images(config.DATA_DIR)
    print(f"\n📊 Data Summary:")
    print(f"   🌿 Mangrove images: {mangrove_count}")
    print(f"   🏞️  Non-mangrove images: {non_mangrove_count}")
    
    if mangrove_count == 0 and non_mangrove_count == 0:
        print("⚠️  No training data found. Run 'python prepare_data.py' first.")
        return False
    
    # Test 4: Check if model exists
    model_path = os.path.join(config.MODEL_DIR, "mangrove_model.pth")
    if os.path.exists(model_path):
        print(f"✅ Trained model found: {model_path}")
        
        # Test 5: Test model loading
        try:
            classifier = MangroveClassifier(model_path)
            print("✅ Model loads successfully")
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    else:
        print(f"⚠️  No trained model found. Train model first.")
        return False

def test_prediction():
    """Test prediction functionality"""
    print("\n🔮 Testing Prediction Functionality")
    print("=" * 50)
    
    model_path = os.path.join(config.MODEL_DIR, "mangrove_model.pth")
    if not os.path.exists(model_path):
        print("❌ No trained model available for testing")
        return False
    
    # Find test images
    mangrove_dir = os.path.join(config.DATA_DIR, "mangrove")
    non_mangrove_dir = os.path.join(config.DATA_DIR, "non-mangrove")
    
    test_images = []
    
    if os.path.exists(mangrove_dir):
        mangrove_files = [os.path.join(mangrove_dir, f) for f in os.listdir(mangrove_dir) 
                         if f.lower().endswith(('.png', '.jpg', '.jpeg'))][:2]
        test_images.extend(mangrove_files)
    
    if os.path.exists(non_mangrove_dir):
        non_mangrove_files = [os.path.join(non_mangrove_dir, f) for f in os.listdir(non_mangrove_dir) 
                             if f.lower().endswith(('.png', '.jpg', '.jpeg'))][:2]
        test_images.extend(non_mangrove_files)
    
    if not test_images:
        print("❌ No test images available")
        return False
    
    try:
        classifier = MangroveClassifier(model_path)
        
        print(f"🖼️  Testing on {len(test_images)} images:")
        for img_path in test_images:
            prediction, confidence = classifier.predict(img_path, return_confidence=True)
            img_name = os.path.basename(img_path)
            print(f"   📸 {img_name}: {prediction} ({confidence:.2%} confidence)")
        
        print("✅ Prediction testing successful!")
        return True
        
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🌿 Mangrove Classifier Test Suite")
    print("=" * 60)
    
    setup_ok = test_setup()
    
    if setup_ok:
        prediction_ok = test_prediction()
        
        if prediction_ok:
            print("\n🎉 All tests passed! Your mangrove classifier is ready to use.")
            print("\n📋 Next steps:")
            print("   1. Add more training data if needed")
            print("   2. Use the classifier in your application")
            print("   3. Integrate with the web server")
        else:
            print("\n⚠️  Setup is good, but prediction testing failed.")
            print("Check the model training process.")
    else:
        print("\n❌ Setup issues detected. Please fix them before proceeding.")
        print("\n🔧 Common solutions:")
        print("   1. Run 'python prepare_data.py' to set up data structure")
        print("   2. Add training images to data/mangrove/ and data/non-mangrove/")
        print("   3. Run training: 'python src/train.py' or use the notebook")

if __name__ == "__main__":
    main()
