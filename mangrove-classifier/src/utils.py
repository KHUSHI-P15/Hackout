import torch
import os
import shutil
from torchvision import datasets, transforms
from sklearn.model_selection import train_test_split
from PIL import Image
import config

def prepare_data_structure(data_dir):
    """
    Reorganizes data from mangrove/non-mangrove folders to train/test structure
    """
    mangrove_dir = os.path.join(data_dir, "mangrove")
    non_mangrove_dir = os.path.join(data_dir, "non-mangrove")
    
    # Create train/test directories
    train_dir = os.path.join(data_dir, "train")
    test_dir = os.path.join(data_dir, "test")
    
    os.makedirs(os.path.join(train_dir, "mangrove"), exist_ok=True)
    os.makedirs(os.path.join(train_dir, "non-mangrove"), exist_ok=True)
    os.makedirs(os.path.join(test_dir, "mangrove"), exist_ok=True)
    os.makedirs(os.path.join(test_dir, "non-mangrove"), exist_ok=True)
    
    # Split mangrove images
    if os.path.exists(mangrove_dir):
        mangrove_files = [f for f in os.listdir(mangrove_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if mangrove_files:
            train_files, test_files = train_test_split(mangrove_files, test_size=0.2, random_state=42)
            
            for file in train_files:
                shutil.copy2(os.path.join(mangrove_dir, file), os.path.join(train_dir, "mangrove", file))
            for file in test_files:
                shutil.copy2(os.path.join(mangrove_dir, file), os.path.join(test_dir, "mangrove", file))
    
    # Split non-mangrove images
    if os.path.exists(non_mangrove_dir):
        non_mangrove_files = [f for f in os.listdir(non_mangrove_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if non_mangrove_files:
            train_files, test_files = train_test_split(non_mangrove_files, test_size=0.2, random_state=42)
            
            for file in train_files:
                shutil.copy2(os.path.join(non_mangrove_dir, file), os.path.join(train_dir, "non-mangrove", file))
            for file in test_files:
                shutil.copy2(os.path.join(non_mangrove_dir, file), os.path.join(test_dir, "non-mangrove", file))

def get_data_transforms():
    """
    Returns data transforms for training and testing
    """
    train_transform = transforms.Compose([
        transforms.Resize(config.IMG_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    test_transform = transforms.Compose([
        transforms.Resize(config.IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    return train_transform, test_transform

def get_data_loaders(data_dir, batch_size, img_size):
    """
    Creates data loaders for training and testing
    """
    # Prepare data structure if needed
    train_dir = os.path.join(data_dir, "train")
    test_dir = os.path.join(data_dir, "test")
    
    if not os.path.exists(train_dir) or not os.path.exists(test_dir):
        print("Preparing data structure...")
        prepare_data_structure(data_dir)
    
    train_transform, test_transform = get_data_transforms()
    
    # Check if data exists
    if not os.path.exists(train_dir) or not os.listdir(train_dir):
        raise ValueError(f"No training data found in {train_dir}")
    
    train_data = datasets.ImageFolder(root=train_dir, transform=train_transform)
    test_data = datasets.ImageFolder(root=test_dir, transform=test_transform)
    
    train_loader = torch.utils.data.DataLoader(
        train_data, 
        batch_size=batch_size, 
        shuffle=True,
        num_workers=2 if torch.cuda.is_available() else 0
    )
    test_loader = torch.utils.data.DataLoader(
        test_data, 
        batch_size=batch_size, 
        shuffle=False,
        num_workers=2 if torch.cuda.is_available() else 0
    )
    
    return train_loader, test_loader, train_data.classes

def count_images(data_dir):
    """
    Count images in each category
    """
    mangrove_dir = os.path.join(data_dir, "mangrove")
    non_mangrove_dir = os.path.join(data_dir, "non-mangrove")
    
    mangrove_count = 0
    non_mangrove_count = 0
    
    if os.path.exists(mangrove_dir):
        mangrove_count = len([f for f in os.listdir(mangrove_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
    
    if os.path.exists(non_mangrove_dir):
        non_mangrove_count = len([f for f in os.listdir(non_mangrove_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
    
    return mangrove_count, non_mangrove_count
