#!/usr/bin/env python3
"""
Add non-mangrove sample images to balance the dataset
"""

import os
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import random

def create_non_mangrove_samples():
    """
    Create sample non-mangrove images with different landscape types
    """
    non_mangrove_dir = Path("data/non-mangrove")
    non_mangrove_dir.mkdir(parents=True, exist_ok=True)
    
    # Different landscape types and their colors
    landscapes = [
        ("urban", (128, 128, 128), "Urban Area"),
        ("desert", (194, 178, 128), "Desert Land"),
        ("water", (30, 144, 255), "Water Body"),
        ("grassland", (124, 252, 0), "Grassland"),
        ("mountain", (139, 69, 19), "Mountain"),
        ("forest", (34, 139, 34), "Forest"),
        ("agricultural", (255, 215, 0), "Farm Land"),
        ("coastal", (238, 203, 173), "Coastal Area"),
    ]
    
    print("🎨 Creating non-mangrove sample images...")
    
    for i, (land_type, base_color, label) in enumerate(landscapes):
        # Create multiple variations of each landscape type
        for j in range(2):
            filename = f"{land_type}_{j+1:02d}.jpg"
            filepath = non_mangrove_dir / filename
            
            # Add some variation to the base color
            r, g, b = base_color
            r = max(0, min(255, r + random.randint(-30, 30)))
            g = max(0, min(255, g + random.randint(-30, 30)))
            b = max(0, min(255, b + random.randint(-30, 30)))
            color = (r, g, b)
            
            create_landscape_image(filepath, color, f"{label} {j+1}")
    
    # Count created images
    created_count = len([f for f in non_mangrove_dir.glob("*.jpg")])
    print(f"✅ Created {created_count} non-mangrove sample images")
    
    return created_count

def create_landscape_image(filepath, color, text):
    """
    Create a landscape-style image with gradient and text
    """
    # Create image with gradient effect
    img = Image.new('RGB', (224, 224), color)
    draw = ImageDraw.Draw(img)
    
    # Add gradient effect
    for y in range(224):
        # Create a subtle gradient
        factor = y / 224
        r, g, b = color
        
        # Darken towards bottom for depth effect
        new_r = int(r * (1 - factor * 0.3))
        new_g = int(g * (1 - factor * 0.3))
        new_b = int(b * (1 - factor * 0.3))
        
        line_color = (new_r, new_g, new_b)
        draw.line([(0, y), (224, y)], fill=line_color)
    
    # Add some texture patterns
    for _ in range(20):
        x1 = random.randint(0, 224)
        y1 = random.randint(0, 224)
        x2 = x1 + random.randint(-10, 10)
        y2 = y1 + random.randint(-10, 10)
        
        # Random darker/lighter spots
        factor = random.uniform(0.7, 1.3)
        r, g, b = color
        spot_color = (
            int(min(255, r * factor)),
            int(min(255, g * factor)),
            int(min(255, b * factor))
        )
        draw.rectangle([x1, y1, x2, y2], fill=spot_color)
    
    # Add text label
    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (224 - text_width) // 2
    y = 224 - text_height - 10  # Bottom of image
    
    # Add text background
    draw.rectangle([x-5, y-2, x+text_width+5, y+text_height+2], fill=(0, 0, 0, 128))
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save image
    img.save(filepath, 'JPEG', quality=95)

def main():
    """
    Add non-mangrove sample data
    """
    print("🏞️  Adding Non-Mangrove Sample Data")
    print("=" * 40)
    
    # Check current status
    mangrove_dir = Path("data/mangrove")
    non_mangrove_dir = Path("data/non-mangrove")
    
    mangrove_count = 0
    non_mangrove_count = 0
    
    if mangrove_dir.exists():
        mangrove_count = len([f for f in mangrove_dir.glob("*") if f.suffix.lower() in ['.jpg', '.jpeg', '.png']])
    
    if non_mangrove_dir.exists():
        non_mangrove_count = len([f for f in non_mangrove_dir.glob("*") if f.suffix.lower() in ['.jpg', '.jpeg', '.png']])
    
    print(f"📊 Current data:")
    print(f"   🌿 Mangrove images: {mangrove_count}")
    print(f"   🏞️  Non-mangrove images: {non_mangrove_count}")
    
    if non_mangrove_count == 0:
        print("\n📥 Adding non-mangrove sample images...")
        created = create_non_mangrove_samples()
        
        print(f"\n🎉 Successfully added {created} non-mangrove images!")
        print(f"📈 Total dataset: {mangrove_count} mangrove + {created} non-mangrove = {mangrove_count + created} images")
        
        print("\n📋 Next steps:")
        print("1. Run training: 'python src/train.py' or use the notebook")
        print("2. Test setup: 'python test_setup.py'")
        print("3. For better results, replace sample images with real satellite/aerial images")
    else:
        print(f"\n✅ Dataset is already balanced!")
        print(f"📈 Total: {mangrove_count + non_mangrove_count} images")

if __name__ == "__main__":
    main()
