#!/usr/bin/env python3
"""
Data Preparation Script for Mangrove Classifier
This script helps download and organize sample data for training.
"""

import os
import requests
import zipfile
from pathlib import Path
import shutil

def create_sample_data():
    """
    Creates sample data structure with placeholder instructions
    """
    data_dir = Path("data")
    mangrove_dir = data_dir / "mangrove"
    non_mangrove_dir = data_dir / "non-mangrove"
    
    # Create directories
    mangrove_dir.mkdir(parents=True, exist_ok=True)
    non_mangrove_dir.mkdir(parents=True, exist_ok=True)
    
    # Create README files with instructions
    mangrove_readme = mangrove_dir / "README.txt"
    mangrove_readme.write_text("""
🌿 MANGROVE IMAGES FOLDER

Place your mangrove images here!

Recommended sources:
1. Kaggle datasets (search for "mangrove satellite images")
2. NASA Earth Data
3. Sentinel-2 satellite imagery
4. Google Earth Engine
5. Manual collection from environmental websites

Image requirements:
- Format: JPG, PNG, JPEG
- Minimum size: 224x224 pixels
- Clear images showing mangrove areas
- Variety of locations and conditions

Example filename: mangrove_001.jpg
""")
    
    non_mangrove_readme = non_mangrove_dir / "README.txt"
    non_mangrove_readme.write_text("""
🏞️ NON-MANGROVE IMAGES FOLDER

Place your non-mangrove images here!

Good examples of non-mangrove images:
1. Other vegetation (forests, grasslands)
2. Urban areas
3. Water bodies (lakes, rivers)
4. Desert/barren land
5. Agricultural fields
6. Coastal areas without mangroves

Image requirements:
- Format: JPG, PNG, JPEG
- Minimum size: 224x224 pixels
- Clear images NOT showing mangrove areas
- Variety of landscapes and conditions

Example filename: non_mangrove_001.jpg
""")
    
    print("✅ Sample data structure created!")
    print(f"📁 Mangrove folder: {mangrove_dir.absolute()}")
    print(f"📁 Non-mangrove folder: {non_mangrove_dir.absolute()}")
    print("\n📝 Next steps:")
    print("1. Add training images to the respective folders")
    print("2. Run the training notebook: notebooks/train_model.ipynb")
    print("3. Or run training script: python src/train.py")

def download_sample_dataset():
    """
    Downloads a sample dataset (if available)
    Note: You'll need to implement this based on available datasets
    """
    print("🔍 Looking for sample datasets...")
    print("💡 For now, please manually add images to:")
    print("   - data/mangrove/ (for mangrove images)")
    print("   - data/non-mangrove/ (for non-mangrove images)")
    print("\n🌐 Recommended dataset sources:")
    print("   - Kaggle: https://www.kaggle.com/search?q=mangrove")
    print("   - NASA Earth Data: https://earthdata.nasa.gov/")
    print("   - Google Earth Engine: https://earthengine.google.com/")

def check_data_quality():
    """
    Checks the quality and quantity of available data
    """
    data_dir = Path("data")
    mangrove_dir = data_dir / "mangrove"
    non_mangrove_dir = data_dir / "non-mangrove"
    
    # Count images
    mangrove_images = list(mangrove_dir.glob("*.jpg")) + list(mangrove_dir.glob("*.jpeg")) + list(mangrove_dir.glob("*.png"))
    non_mangrove_images = list(non_mangrove_dir.glob("*.jpg")) + list(non_mangrove_dir.glob("*.jpeg")) + list(non_mangrove_dir.glob("*.png"))
    
    print(f"📊 Data Quality Check:")
    print(f"   🌿 Mangrove images: {len(mangrove_images)}")
    print(f"   🏞️  Non-mangrove images: {len(non_mangrove_images)}")
    print(f"   📈 Total images: {len(mangrove_images) + len(non_mangrove_images)}")
    
    if len(mangrove_images) == 0 and len(non_mangrove_images) == 0:
        print("\n❌ No training data found!")
        print("Please add images before training.")
        return False
    
    # Check balance
    total = len(mangrove_images) + len(non_mangrove_images)
    if total < 20:
        print(f"\n⚠️  Very small dataset ({total} images)")
        print("Recommend at least 50-100 images per class for good results")
    elif total < 100:
        print(f"\n⚠️  Small dataset ({total} images)")
        print("Consider adding more images for better accuracy")
    else:
        print(f"\n✅ Good dataset size ({total} images)")
    
    # Check balance between classes
    if abs(len(mangrove_images) - len(non_mangrove_images)) > 0.3 * max(len(mangrove_images), len(non_mangrove_images)):
        print("⚠️  Dataset appears imbalanced")
        print("Try to have similar numbers of mangrove and non-mangrove images")
    else:
        print("✅ Dataset appears balanced")
    
    return True

if __name__ == "__main__":
    print("🌿 Mangrove Classifier Data Preparation")
    print("=" * 40)
    
    # Check if data already exists
    if not os.path.exists("data"):
        print("Creating data structure...")
        create_sample_data()
    else:
        print("Data folder already exists. Checking quality...")
        check_data_quality()
    
    print("\n" + "=" * 40)
    print("📋 Data Preparation Complete!")
    print("Next: Add your training images and run the training notebook.")
