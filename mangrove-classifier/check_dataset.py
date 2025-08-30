"""
Dataset Checker and Preparation Tool
Run this before retraining to check your dataset status
"""

import os
import shutil
from PIL import Image
import matplotlib.pyplot as plt

def check_image_file(filepath):
    """Check if file is a valid image"""
    try:
        with Image.open(filepath) as img:
            img.verify()
        return True
    except:
        return False

def analyze_dataset(data_dir="data"):
    """Analyze the current dataset"""
    print("🔍 Dataset Analysis Report")
    print("=" * 50)
    
    mangrove_dir = os.path.join(data_dir, "mangrove")
    non_mangrove_dir = os.path.join(data_dir, "non-mangrove")
    
    # Count images
    mangrove_files = []
    non_mangrove_files = []
    
    if os.path.exists(mangrove_dir):
        mangrove_files = [f for f in os.listdir(mangrove_dir) 
                         if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))]
    
    if os.path.exists(non_mangrove_dir):
        non_mangrove_files = [f for f in os.listdir(non_mangrove_dir) 
                             if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))]
    
    print(f"📁 Data Directory: {os.path.abspath(data_dir)}")
    print(f"🌿 Mangrove images: {len(mangrove_files)}")
    print(f"🏞️  Non-mangrove images: {len(non_mangrove_files)}")
    print(f"📊 Total images: {len(mangrove_files) + len(non_mangrove_files)}")
    
    # Check for issues
    issues = []
    
    # Check minimum data requirements
    if len(mangrove_files) < 5:
        issues.append(f"⚠️  Very few mangrove images ({len(mangrove_files)}). Add more for better training.")
    
    if len(non_mangrove_files) < 5:
        issues.append(f"⚠️  Very few non-mangrove images ({len(non_mangrove_files)}). Add more for better training.")
    
    # Check balance
    if len(mangrove_files) > 0 and len(non_mangrove_files) > 0:
        ratio = max(len(mangrove_files), len(non_mangrove_files)) / min(len(mangrove_files), len(non_mangrove_files))
        if ratio > 3:
            issues.append(f"⚠️  Dataset imbalance detected (ratio {ratio:.1f}:1). Consider balancing classes.")
    
    # Check image validity
    print("\n🔍 Checking image validity...")
    invalid_mangrove = []
    invalid_non_mangrove = []
    
    for file in mangrove_files:
        if not check_image_file(os.path.join(mangrove_dir, file)):
            invalid_mangrove.append(file)
    
    for file in non_mangrove_files:
        if not check_image_file(os.path.join(non_mangrove_dir, file)):
            invalid_non_mangrove.append(file)
    
    if invalid_mangrove:
        issues.append(f"❌ Invalid mangrove images: {invalid_mangrove}")
    
    if invalid_non_mangrove:
        issues.append(f"❌ Invalid non-mangrove images: {invalid_non_mangrove}")
    
    # Display results
    if issues:
        print("\n⚠️  Issues Found:")
        for issue in issues:
            print(f"   {issue}")
    else:
        print("\n✅ Dataset looks good for training!")
    
    # Show file lists
    if len(mangrove_files) > 0:
        print(f"\n🌿 Mangrove images ({len(mangrove_files)}):")
        for i, file in enumerate(mangrove_files[:10]):  # Show first 10
            print(f"   {i+1}. {file}")
        if len(mangrove_files) > 10:
            print(f"   ... and {len(mangrove_files) - 10} more")
    
    if len(non_mangrove_files) > 0:
        print(f"\n🏞️  Non-mangrove images ({len(non_mangrove_files)}):")
        for i, file in enumerate(non_mangrove_files[:10]):  # Show first 10
            print(f"   {i+1}. {file}")
        if len(non_mangrove_files) > 10:
            print(f"   ... and {len(non_mangrove_files) - 10} more")
    
    # Recommendations
    print("\n💡 Recommendations:")
    total_images = len(mangrove_files) + len(non_mangrove_files)
    
    if total_images < 20:
        print("   📈 Add more images (aim for at least 50+ total)")
        print("   🌐 Consider downloading more samples from internet")
        print("   📱 Take more photos with your phone/camera")
    elif total_images < 100:
        print("   📈 Good start! More images would improve accuracy")
        print("   🎯 Aim for 100+ images for better performance")
    else:
        print("   ✅ Great dataset size!")
        print("   🚀 Ready for retraining")
    
    print("   ⚖️  Keep classes balanced (similar number of images in each)")
    print("   🏗️  Ensure images are representative of real-world scenarios")
    
    return len(mangrove_files), len(non_mangrove_files), issues

def create_sample_structure():
    """Create sample directory structure if it doesn't exist"""
    dirs_to_create = [
        "data/mangrove",
        "data/non-mangrove",
        "models"
    ]
    
    for dir_path in dirs_to_create:
        os.makedirs(dir_path, exist_ok=True)
        print(f"📁 Created directory: {dir_path}")

def main():
    """Main function"""
    print("🌿 Mangrove Dataset Checker")
    print("=" * 30)
    
    # Check if data directory exists
    if not os.path.exists("data"):
        print("📁 Data directory not found. Creating sample structure...")
        create_sample_structure()
        print("\n📝 Please add your images to:")
        print("   • data/mangrove/ (for mangrove images)")
        print("   • data/non-mangrove/ (for non-mangrove images)")
        return
    
    # Analyze dataset
    mangrove_count, non_mangrove_count, issues = analyze_dataset()
    
    # Show next steps
    print(f"\n🎯 Next Steps:")
    if mangrove_count == 0 and non_mangrove_count == 0:
        print("   1. Add images to data/mangrove/ and data/non-mangrove/")
        print("   2. Run this script again to check")
        print("   3. Then run: python retrain_model.py")
    elif len(issues) > 0:
        print("   1. Fix the issues mentioned above")
        print("   2. Run this script again to verify")
        print("   3. Then run: python retrain_model.py")
    else:
        print("   1. Your dataset looks good!")
        print("   2. Run: python retrain_model.py")
        print("   3. After training, restart your model server")
    
    print(f"\n🔄 Current model server status:")
    print(f"   • Model server should be running on: http://localhost:5001")
    print(f"   • After retraining, restart with: python model_server.py")

if __name__ == "__main__":
    main()
