#!/usr/bin/env python3
"""
Download sample data for mangrove classifier training
This script downloads sample images from public sources for testing purposes.
"""

import os
import requests
import urllib.request
from PIL import Image
import io
from pathlib import Path
import time

def create_sample_images():
    """
    Creates sample placeholder images for testing the classifier
    """
    data_dir = Path("data")
    mangrove_dir = data_dir / "mangrove"
    non_mangrove_dir = data_dir / "non-mangrove"
    
    # Create directories
    mangrove_dir.mkdir(parents=True, exist_ok=True)
    non_mangrove_dir.mkdir(parents=True, exist_ok=True)
    
    print("🎨 Creating sample placeholder images...")
    
    # Create sample mangrove images (green-ish color)
    mangrove_color = (34, 139, 34)  # Forest green
    for i in range(10):
        create_placeholder_image(
            mangrove_dir / f"mangrove_sample_{i+1:03d}.jpg",
            mangrove_color,
            f"Mangrove Sample {i+1}"
        )
    
    # Create sample non-mangrove images (various colors)
    non_mangrove_colors = [
        (139, 69, 19),   # Brown (soil)
        (30, 144, 255),  # Blue (water)
        (128, 128, 128), # Gray (urban)
        (255, 255, 0),   # Yellow (desert)
        (50, 205, 50),   # Lime green (grassland)
    ]
    
    for i in range(10):
        color = non_mangrove_colors[i % len(non_mangrove_colors)]
        create_placeholder_image(
            non_mangrove_dir / f"non_mangrove_sample_{i+1:03d}.jpg",
            color,
            f"Non-Mangrove Sample {i+1}"
        )
    
    print(f"✅ Created 20 sample images (10 mangrove + 10 non-mangrove)")
    print(f"📁 Mangrove images: {mangrove_dir.absolute()}")
    print(f"📁 Non-mangrove images: {non_mangrove_dir.absolute()}")

def create_placeholder_image(filepath, color, text):
    """
    Create a placeholder image with given color and text
    """
    from PIL import Image, ImageDraw, ImageFont
    
    # Create image
    img = Image.new('RGB', (224, 224), color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    # Add text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (224 - text_width) // 2
    y = (224 - text_height) // 2
    
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save image
    img.save(filepath, 'JPEG', quality=95)

def download_real_sample_images():
    """
    Download some real sample images from free sources
    Note: This is a basic implementation - you should replace with actual dataset URLs
    """
    print("🌐 Note: For real training data, please:")
    print("1. Visit Kaggle and search for 'mangrove datasets'")
    print("2. Download satellite imagery from NASA Earth Data")
    print("3. Use Google Earth Engine for satellite images")
    print("4. Collect images from environmental monitoring websites")
    print("\n💡 For now, using placeholder images for testing...")

def check_and_add_data():
    """
    Check existing data and add sample data if needed
    """
    data_dir = Path("data")
    mangrove_dir = data_dir / "mangrove"
    non_mangrove_dir = data_dir / "non-mangrove"
    
    # Count existing images
    mangrove_count = 0
    non_mangrove_count = 0
    
    if mangrove_dir.exists():
        mangrove_count = len([f for f in mangrove_dir.glob("*") if f.suffix.lower() in ['.jpg', '.jpeg', '.png']])
    
    if non_mangrove_dir.exists():
        non_mangrove_count = len([f for f in non_mangrove_dir.glob("*") if f.suffix.lower() in ['.jpg', '.jpeg', '.png']])
    
    print(f"📊 Current data status:")
    print(f"   🌿 Mangrove images: {mangrove_count}")
    print(f"   🏞️  Non-mangrove images: {non_mangrove_count}")
    
    if mangrove_count == 0 and non_mangrove_count == 0:
        print("\n📥 No training data found. Adding sample data...")
        create_sample_images()
        download_real_sample_images()
        return True
    else:
        print("\n✅ Training data already exists!")
        add_more = input("Add more sample data? (y/n): ").lower().strip()
        if add_more == 'y':
            create_sample_images()
            return True
        return False

def main():
    """
    Main function to add sample data
    """
    print("🌿 Mangrove Classifier - Sample Data Setup")
    print("=" * 50)
    
    # Ensure we're in the right directory
    if not os.path.exists("src/config.py"):
        print("❌ Please run this script from the mangrove-classifier directory")
        return
    
    # Check and add data
    data_added = check_and_add_data()
    
    if data_added:
        print("\n🎉 Sample data setup complete!")
        print("\n📋 Next steps:")
        print("1. Replace sample images with real training data for better results")
        print("2. Run training: 'python src/train.py' or use the notebook")
        print("3. Test the trained model: 'python test_setup.py'")
        
        print("\n🔍 Data sources for real training data:")
        print("- Kaggle: https://www.kaggle.com/search?q=mangrove")
        print("- NASA Earthdata: https://earthdata.nasa.gov/")
        print("- Sentinel Hub: https://www.sentinel-hub.com/")
        print("- Google Earth Engine: https://earthengine.google.com/")
    else:
        print("\n✅ Using existing data. Ready for training!")

if __name__ == "__main__":
    main()
