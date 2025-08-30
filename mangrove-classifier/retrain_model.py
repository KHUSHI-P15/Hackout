"""
Enhanced Retraining Script for Mangrove Classifier
This script will retrain your model with the new data you've added
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import os
import shutil
import time
from datetime import datetime
import sys

# Add src directory to path
sys.path.append('src')
from utils import get_data_loaders, count_images, prepare_data_structure
import config

class MangroveRetrainer:
    def __init__(self, data_dir="data/", model_dir="models/"):
        self.data_dir = data_dir
        self.model_dir = model_dir
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Create backup directory for previous models
        self.backup_dir = os.path.join(model_dir, "backups")
        os.makedirs(self.backup_dir, exist_ok=True)
        
    def backup_existing_model(self):
        """Backup the existing model before retraining"""
        existing_model = os.path.join(self.model_dir, "mangrove_model.pth")
        if os.path.exists(existing_model):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(self.backup_dir, f"mangrove_model_backup_{timestamp}.pth")
            shutil.copy2(existing_model, backup_path)
            print(f"📦 Backed up existing model to: {backup_path}")
            return backup_path
        return None
    
    def analyze_dataset(self):
        """Analyze the current dataset"""
        print("📊 Analyzing Dataset...")
        print("=" * 50)
        
        # Count images in main directories
        mangrove_count, non_mangrove_count = count_images(self.data_dir)
        total_images = mangrove_count + non_mangrove_count
        
        print(f"📁 Source Data:")
        print(f"   • Mangrove images: {mangrove_count}")
        print(f"   • Non-mangrove images: {non_mangrove_count}")
        print(f"   • Total images: {total_images}")
        
        if total_images < 20:
            print("⚠️  Warning: Very small dataset. Consider adding more images for better accuracy.")
        elif total_images < 100:
            print("⚠️  Warning: Small dataset. More images would improve model performance.")
        else:
            print("✅ Good dataset size for training.")
        
        # Check balance
        if mangrove_count > 0 and non_mangrove_count > 0:
            ratio = max(mangrove_count, non_mangrove_count) / min(mangrove_count, non_mangrove_count)
            if ratio > 3:
                print(f"⚠️  Dataset imbalance detected (ratio: {ratio:.1f}:1). Consider balancing your classes.")
            else:
                print("✅ Dataset is reasonably balanced.")
        
        return mangrove_count, non_mangrove_count
    
    def create_model(self, pretrained=True):
        """Create ResNet50 model"""
        model = models.resnet50(pretrained=pretrained)
        
        # Option to fine-tune more layers if you have more data
        # For small datasets, freeze feature extractor
        if pretrained:
            for param in model.parameters():
                param.requires_grad = False
        
        # Replace final layer
        model.fc = nn.Linear(model.fc.in_features, config.NUM_CLASSES)
        return model
    
    def load_existing_model(self, model_path):
        """Load existing model for transfer learning"""
        if os.path.exists(model_path):
            print(f"📥 Loading existing model from: {model_path}")
            model = self.create_model(pretrained=True)
            model.load_state_dict(torch.load(model_path, map_location=self.device))
            return model
        return None
    
    def train_model(self, use_existing_model=True, epochs=None):
        """Main training function"""
        print("🌿 Starting Mangrove Classifier Retraining...")
        print("=" * 60)
        
        # Analyze dataset
        mangrove_count, non_mangrove_count = self.analyze_dataset()
        
        if mangrove_count == 0 and non_mangrove_count == 0:
            print("❌ No training data found!")
            print("Please add images to:")
            print(f"   • {os.path.join(self.data_dir, 'mangrove')} (for mangrove images)")
            print(f"   • {os.path.join(self.data_dir, 'non-mangrove')} (for non-mangrove images)")
            return None
        
        # Backup existing model
        backup_path = self.backup_existing_model()
        
        # Prepare data structure
        print("📂 Preparing data structure...")
        prepare_data_structure(self.data_dir)
        
        # Load data
        try:
            train_loader, test_loader, classes = get_data_loaders(
                self.data_dir, config.BATCH_SIZE, config.IMG_SIZE
            )
            print(f"✅ Data loaded successfully. Classes: {classes}")
            print(f"   • Training batches: {len(train_loader)}")
            print(f"   • Test batches: {len(test_loader)}")
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return None
        
        # Create or load model
        existing_model_path = os.path.join(self.model_dir, "mangrove_model.pth")
        
        if use_existing_model and backup_path:
            print("🔄 Using transfer learning from existing model...")
            model = self.load_existing_model(backup_path)
            if model is None:
                print("⚠️  Could not load existing model, creating new one...")
                model = self.create_model()
        else:
            print("🆕 Creating new model...")
            model = self.create_model()
        
        model = model.to(self.device)
        print(f"🖥️  Using device: {self.device}")
        
        # Set up training
        criterion = nn.CrossEntropyLoss()
        
        # Adjust learning rate based on dataset size
        if mangrove_count + non_mangrove_count < 100:
            lr = 0.0001  # Lower learning rate for small datasets
            epochs = epochs or 15
        else:
            lr = config.LEARNING_RATE
            epochs = epochs or config.EPOCHS
        
        optimizer = optim.Adam(model.fc.parameters(), lr=lr)
        scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
        
        print(f"⚙️  Training configuration:")
        print(f"   • Epochs: {epochs}")
        print(f"   • Learning rate: {lr}")
        print(f"   • Batch size: {config.BATCH_SIZE}")
        
        # Training history
        train_losses = []
        train_accuracies = []
        test_accuracies = []
        
        print(f"\n🚀 Starting training...")
        best_test_acc = 0.0
        
        for epoch in range(epochs):
            # Training phase
            model.train()
            running_loss = 0.0
            correct = 0
            total = 0
            
            for batch_idx, (images, labels) in enumerate(train_loader):
                images, labels = images.to(self.device), labels.to(self.device)
                
                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
            
            epoch_loss = running_loss / len(train_loader)
            epoch_acc = 100 * correct / total
            train_losses.append(epoch_loss)
            train_accuracies.append(epoch_acc)
            
            # Test phase
            test_acc = self.evaluate_model(model, test_loader)
            test_accuracies.append(test_acc)
            
            # Save best model
            if test_acc > best_test_acc:
                best_test_acc = test_acc
                torch.save(model.state_dict(), existing_model_path)
                print(f"💾 New best model saved (Test Acc: {test_acc:.2f}%)")
            
            print(f"Epoch {epoch+1}/{epochs} - Train Loss: {epoch_loss:.4f}, Train Acc: {epoch_acc:.2f}%, Test Acc: {test_acc:.2f}%")
            scheduler.step()
        
        print(f"\n✅ Training completed!")
        print(f"🏆 Best test accuracy: {best_test_acc:.2f}%")
        
        # Final evaluation
        self.final_evaluation(model, test_loader, classes)
        
        # Save training history
        self.save_training_plots(train_losses, train_accuracies, test_accuracies, epochs)
        
        return model
    
    def evaluate_model(self, model, test_loader):
        """Evaluate model on test set"""
        model.eval()
        correct = 0
        total = 0
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                outputs = model(images)
                _, predicted = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        return 100 * correct / total
    
    def final_evaluation(self, model, test_loader, classes):
        """Comprehensive evaluation with metrics"""
        print("\n📊 Final Model Evaluation:")
        print("=" * 40)
        
        model.eval()
        all_predictions = []
        all_labels = []
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                outputs = model(images)
                _, predicted = torch.max(outputs, 1)
                
                all_predictions.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        if len(all_labels) > 0:
            # Classification report
            print("📋 Classification Report:")
            print(classification_report(all_labels, all_predictions, target_names=classes))
            
            # Confusion matrix
            cm = confusion_matrix(all_labels, all_predictions)
            print("🔀 Confusion Matrix:")
            print(f"{'':>12} {'Predicted':>20}")
            print(f"{'Actual':>12} {classes[0]:>10} {classes[1]:>10}")
            for i, class_name in enumerate(classes):
                row = f"{class_name:>12}"
                for j in range(len(classes)):
                    row += f"{cm[i][j]:>10}"
                print(row)
        else:
            print("⚠️  No test data available for evaluation")
    
    def save_training_plots(self, train_losses, train_accuracies, test_accuracies, epochs):
        """Save training visualization"""
        plt.figure(figsize=(15, 5))
        
        # Loss plot
        plt.subplot(1, 3, 1)
        plt.plot(train_losses)
        plt.title('Training Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.grid(True)
        
        # Training accuracy plot
        plt.subplot(1, 3, 2)
        plt.plot(train_accuracies, label='Train Accuracy')
        plt.plot(test_accuracies, label='Test Accuracy')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy (%)')
        plt.legend()
        plt.grid(True)
        
        # Final metrics
        plt.subplot(1, 3, 3)
        final_train_acc = train_accuracies[-1] if train_accuracies else 0
        final_test_acc = test_accuracies[-1] if test_accuracies else 0
        
        plt.bar(['Train Accuracy', 'Test Accuracy'], [final_train_acc, final_test_acc])
        plt.title('Final Performance')
        plt.ylabel('Accuracy (%)')
        plt.ylim(0, 100)
        
        # Add value labels on bars
        plt.text(0, final_train_acc + 1, f'{final_train_acc:.1f}%', ha='center')
        plt.text(1, final_test_acc + 1, f'{final_test_acc:.1f}%', ha='center')
        
        plt.tight_layout()
        
        # Save plot
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        plot_path = os.path.join(self.model_dir, f'training_history_{timestamp}.png')
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"📈 Training plots saved to: {plot_path}")
        plt.show()

def main():
    """Main function to run retraining"""
    print("🌿 Mangrove Classifier Retraining Tool")
    print("=" * 50)
    
    # Initialize retrainer
    retrainer = MangroveRetrainer()
    
    # Ask user for preferences
    print("\n🔧 Configuration Options:")
    print("1. Use existing model as starting point (transfer learning) - Recommended")
    print("2. Train completely new model from scratch")
    
    choice = input("\nEnter your choice (1 or 2, default=1): ").strip()
    use_existing = choice != "2"
    
    epochs_input = input("Enter number of epochs (default=auto): ").strip()
    epochs = int(epochs_input) if epochs_input.isdigit() else None
    
    # Start training
    print(f"\n🚀 Starting retraining with {'transfer learning' if use_existing else 'fresh training'}...")
    
    start_time = time.time()
    model = retrainer.train_model(use_existing_model=use_existing, epochs=epochs)
    end_time = time.time()
    
    if model:
        print(f"\n✅ Retraining completed successfully!")
        print(f"⏱️  Total training time: {(end_time - start_time)/60:.1f} minutes")
        print(f"💾 Updated model saved to: models/mangrove_model.pth")
        print(f"📦 Previous model backed up to: models/backups/")
        
        print("\n🔄 Don't forget to restart your model server to use the new model!")
        print("   Command: python model_server.py")
        
    else:
        print("❌ Retraining failed. Please check your data and try again.")

if __name__ == "__main__":
    main()
