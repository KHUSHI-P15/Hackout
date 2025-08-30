import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import accuracy_score, classification_report
import os
from utils import get_data_loaders, count_images
import config

def create_model():
    """
    Create ResNet50 model for binary classification
    """
    model = models.resnet50(pretrained=True)
    
    # Freeze feature extractor
    for param in model.parameters():
        param.requires_grad = False
    
    # Replace final layer for binary classification
    model.fc = nn.Linear(model.fc.in_features, config.NUM_CLASSES)
    
    return model

def train_model():
    """
    Train the mangrove classification model
    """
    print("🌿 Starting Mangrove Classifier Training...")
    
    # Check data availability
    mangrove_count, non_mangrove_count = count_images(config.DATA_DIR)
    print(f"📊 Data Summary:")
    print(f"   Mangrove images: {mangrove_count}")
    print(f"   Non-mangrove images: {non_mangrove_count}")
    
    if mangrove_count == 0 and non_mangrove_count == 0:
        print("❌ No training data found! Please add images to data/mangrove/ and data/non-mangrove/ folders")
        return
    
    # Load data
    try:
        train_loader, test_loader, classes = get_data_loaders(config.DATA_DIR, config.BATCH_SIZE, config.IMG_SIZE)
        print(f"✅ Data loaded successfully. Classes: {classes}")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return
    
    # Create model
    model = create_model()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"🖥️  Using device: {device}")
    
    # Loss & optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=config.LEARNING_RATE)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
    
    # Training history
    train_losses = []
    train_accuracies = []
    
    print(f"🚀 Training for {config.EPOCHS} epochs...")
    
    # Training loop
    for epoch in range(config.EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            if batch_idx % 10 == 0:
                print(f"Epoch {epoch+1}/{config.EPOCHS}, Batch {batch_idx}, Loss: {loss.item():.4f}")
        
        epoch_loss = running_loss / len(train_loader)
        epoch_acc = 100 * correct / total
        train_losses.append(epoch_loss)
        train_accuracies.append(epoch_acc)
        
        print(f"Epoch {epoch+1}/{config.EPOCHS} - Loss: {epoch_loss:.4f}, Accuracy: {epoch_acc:.2f}%")
        scheduler.step()
    
    # Test the model
    print("🧪 Testing model...")
    model.eval()
    test_correct = 0
    test_total = 0
    all_predictions = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            test_total += labels.size(0)
            test_correct += (predicted == labels).sum().item()
            
            all_predictions.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    test_accuracy = 100 * test_correct / test_total
    print(f"🎯 Test Accuracy: {test_accuracy:.2f}%")
    
    # Print classification report
    print("\n📋 Classification Report:")
    print(classification_report(all_labels, all_predictions, target_names=classes))
    
    # Save model
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    model_path = os.path.join(config.MODEL_DIR, "mangrove_model.pth")
    torch.save(model.state_dict(), model_path)
    print(f"💾 Model saved to: {model_path}")
    
    # Save training history
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(train_losses)
    plt.title('Training Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    
    plt.subplot(1, 2, 2)
    plt.plot(train_accuracies)
    plt.title('Training Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy (%)')
    
    plt.tight_layout()
    plt.savefig(os.path.join(config.MODEL_DIR, 'training_history.png'))
    print("📈 Training history saved to models/training_history.png")
    
    return model

if __name__ == "__main__":
    train_model()
