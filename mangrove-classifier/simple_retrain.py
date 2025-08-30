"""
Simple Retraining Script for Mangrove Classifier
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, datasets, transforms
import matplotlib.pyplot as plt
import os
import shutil
from datetime import datetime
from sklearn.model_selection import train_test_split
from PIL import Image
import sys

def create_train_test_split(data_dir="data"):
    """Create train/test split from mangrove and non-mangrove folders"""
    print("📂 Preparing data structure...")
    
    # Directories
    mangrove_dir = os.path.join(data_dir, "mangrove")
    non_mangrove_dir = os.path.join(data_dir, "non-mangrove")
    train_dir = os.path.join(data_dir, "train")
    test_dir = os.path.join(data_dir, "test")
    
    # Create directories
    for split in ['train', 'test']:
        os.makedirs(os.path.join(data_dir, split, 'mangrove'), exist_ok=True)
        os.makedirs(os.path.join(data_dir, split, 'non-mangrove'), exist_ok=True)
    
    # Split mangrove images
    if os.path.exists(mangrove_dir):
        files = [f for f in os.listdir(mangrove_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if len(files) > 0:
            train_files, test_files = train_test_split(files, test_size=0.2, random_state=42)
            
            # Copy files
            for f in train_files:
                shutil.copy2(os.path.join(mangrove_dir, f), os.path.join(train_dir, 'mangrove', f))
            for f in test_files:
                shutil.copy2(os.path.join(mangrove_dir, f), os.path.join(test_dir, 'mangrove', f))
    
    # Split non-mangrove images
    if os.path.exists(non_mangrove_dir):
        files = [f for f in os.listdir(non_mangrove_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if len(files) > 0:
            train_files, test_files = train_test_split(files, test_size=0.2, random_state=42)
            
            # Copy files
            for f in train_files:
                shutil.copy2(os.path.join(non_mangrove_dir, f), os.path.join(train_dir, 'non-mangrove', f))
            for f in test_files:
                shutil.copy2(os.path.join(non_mangrove_dir, f), os.path.join(test_dir, 'non-mangrove', f))

def get_data_loaders(data_dir, batch_size=16):
    """Create data loaders"""
    # Data transforms
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(0.5),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    test_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Datasets
    train_dataset = datasets.ImageFolder(os.path.join(data_dir, 'train'), transform=train_transform)
    test_dataset = datasets.ImageFolder(os.path.join(data_dir, 'test'), transform=test_transform)
    
    # Data loaders
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, test_loader, train_dataset.classes

def create_model():
    """Create ResNet50 model"""
    model = models.resnet50(pretrained=True)
    
    # Freeze feature layers
    for param in model.parameters():
        param.requires_grad = False
    
    # Replace classifier
    model.fc = nn.Linear(model.fc.in_features, 2)  # 2 classes: mangrove, non-mangrove
    
    return model

def train_model():
    """Main training function"""
    print("🌿 Starting Mangrove Classifier Retraining...")
    
    # Check dataset
    mangrove_count = len([f for f in os.listdir('data/mangrove') if f.lower().endswith(('.png', '.jpg', '.jpeg'))]) if os.path.exists('data/mangrove') else 0
    non_mangrove_count = len([f for f in os.listdir('data/non-mangrove') if f.lower().endswith(('.png', '.jpg', '.jpeg'))]) if os.path.exists('data/non-mangrove') else 0
    
    print(f"📊 Dataset: {mangrove_count} mangrove, {non_mangrove_count} non-mangrove images")
    
    if mangrove_count + non_mangrove_count < 10:
        print("❌ Not enough data for training!")
        return
    
    # Backup existing model
    if os.path.exists('models/mangrove_model.pth'):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f'models/mangrove_model_backup_{timestamp}.pth'
        shutil.copy2('models/mangrove_model.pth', backup_path)
        print(f"📦 Backed up existing model to: {backup_path}")
    
    # Prepare data
    create_train_test_split()
    
    # Get data loaders
    train_loader, test_loader, classes = get_data_loaders('data', batch_size=8)
    print(f"✅ Data loaded. Classes: {classes}")
    
    # Create model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = create_model().to(device)
    print(f"🖥️ Using device: {device}")
    
    # Training setup
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=0.001)
    epochs = 10
    
    # Training loop
    train_losses = []
    train_accuracies = []
    test_accuracies = []
    
    print(f"🚀 Training for {epochs} epochs...")
    
    for epoch in range(epochs):
        # Training
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
        
        epoch_loss = running_loss / len(train_loader)
        epoch_acc = 100 * correct / total
        train_losses.append(epoch_loss)
        train_accuracies.append(epoch_acc)
        
        # Testing
        model.eval()
        test_correct = 0
        test_total = 0
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs, 1)
                test_total += labels.size(0)
                test_correct += (predicted == labels).sum().item()
        
        test_acc = 100 * test_correct / test_total if test_total > 0 else 0
        test_accuracies.append(test_acc)
        
        print(f"Epoch {epoch+1}/{epochs} - Loss: {epoch_loss:.4f}, Train Acc: {epoch_acc:.1f}%, Test Acc: {test_acc:.1f}%")
    
    # Save model
    os.makedirs('models', exist_ok=True)
    torch.save(model.state_dict(), 'models/mangrove_model.pth')
    print("💾 Model saved to models/mangrove_model.pth")
    
    # Plot training history
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(train_losses)
    plt.title('Training Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    
    plt.subplot(1, 2, 2)
    plt.plot(train_accuracies, label='Train')
    plt.plot(test_accuracies, label='Test')
    plt.title('Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy (%)')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('models/training_history.png')
    print("📈 Training history saved to models/training_history.png")
    
    final_test_acc = test_accuracies[-1] if test_accuracies else 0
    print(f"✅ Training completed! Final test accuracy: {final_test_acc:.1f}%")
    
    return model

if __name__ == "__main__":
    train_model()
