import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, Dataset
import os
from PIL import Image
import shutil
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Custom dataset class that handles various image formats
class MangroveDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.classes = ['mangrove', 'non-mangrove']
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.classes)}
        self.samples = []
        
        # Load all valid image files
        for class_name in self.classes:
            class_dir = os.path.join(root_dir, class_name)
            if os.path.exists(class_dir):
                for file_name in os.listdir(class_dir):
                    if file_name.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                        file_path = os.path.join(class_dir, file_name)
                        if self._is_valid_image(file_path):
                            self.samples.append((file_path, self.class_to_idx[class_name]))
    
    def _is_valid_image(self, path):
        try:
            with Image.open(path) as img:
                img.verify()
            return True
        except:
            print(f"⚠️ Skipping corrupted image: {path}")
            return False
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            image = Image.open(path).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image, label
        except Exception as e:
            print(f"⚠️ Error loading image {path}: {e}")
            # Return a black image as fallback
            image = Image.new('RGB', (224, 224), (0, 0, 0))
            if self.transform:
                image = self.transform(image)
            return image, label

class MangroveClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super(MangroveClassifier, self).__init__()
        # Use a simple CNN instead of ResNet to avoid pretrained model issues
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

def create_data_splits():
    """Create train/test splits from the main data folder"""
    data_dir = 'data'
    train_dir = os.path.join(data_dir, 'train')
    test_dir = os.path.join(data_dir, 'test')
    
    # Clean existing train/test dirs
    for split_dir in [train_dir, test_dir]:
        if os.path.exists(split_dir):
            shutil.rmtree(split_dir)
        os.makedirs(split_dir)
        os.makedirs(os.path.join(split_dir, 'mangrove'))
        os.makedirs(os.path.join(split_dir, 'non-mangrove'))
    
    # Split data (80% train, 20% test)
    for class_name in ['mangrove', 'non-mangrove']:
        class_dir = os.path.join(data_dir, class_name)
        if os.path.exists(class_dir):
            files = [f for f in os.listdir(class_dir) 
                    if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
            
            split_idx = int(len(files) * 0.8)
            train_files = files[:split_idx]
            test_files = files[split_idx:]
            
            # Copy files to train folder
            for file_name in train_files:
                src = os.path.join(class_dir, file_name)
                dst = os.path.join(train_dir, class_name, file_name)
                shutil.copy2(src, dst)
            
            # Copy files to test folder
            for file_name in test_files:
                src = os.path.join(class_dir, file_name)
                dst = os.path.join(test_dir, class_name, file_name)
                shutil.copy2(src, dst)
            
            print(f"📁 {class_name}: {len(train_files)} train, {len(test_files)} test")

def train_model():
    print("🌿 Starting Robust Mangrove Classifier Training...")
    
    # Create fresh data splits
    create_data_splits()
    
    # Backup existing model
    if os.path.exists('models/mangrove_model.pth'):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f'models/mangrove_model_backup_{timestamp}.pth'
        shutil.copy2('models/mangrove_model.pth', backup_path)
        print(f"📦 Backed up existing model to: {backup_path}")
    
    # Data transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    # Load datasets
    train_dataset = MangroveDataset('data/train', transform=transform)
    test_dataset = MangroveDataset('data/test', transform=transform)
    
    print(f"📊 Train: {len(train_dataset)} images, Test: {len(test_dataset)} images")
    
    if len(train_dataset) == 0:
        print("❌ No training data found!")
        return
    
    # Data loaders
    train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=4, shuffle=False)
    
    # Model setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"🖥️ Using device: {device}")
    
    model = MangroveClassifier(num_classes=2).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Training loop
    num_epochs = 15
    best_test_acc = 0.0
    
    print(f"🚀 Training for {num_epochs} epochs...")
    
    for epoch in range(num_epochs):
        # Training phase
        model.train()
        running_loss = 0.0
        train_correct = 0
        train_total = 0
        
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
        
        train_acc = 100 * train_correct / train_total
        
        # Testing phase
        model.eval()
        test_correct = 0
        test_total = 0
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                test_total += labels.size(0)
                test_correct += (predicted == labels).sum().item()
        
        test_acc = 100 * test_correct / test_total if test_total > 0 else 0
        
        print(f"Epoch {epoch+1}/{num_epochs} - Loss: {running_loss/len(train_loader):.4f}, "
              f"Train Acc: {train_acc:.1f}%, Test Acc: {test_acc:.1f}%")
        
        # Save best model
        if test_acc > best_test_acc:
            best_test_acc = test_acc
            torch.save(model.state_dict(), 'models/mangrove_model.pth')
            print(f"✅ New best model saved! Test accuracy: {best_test_acc:.1f}%")
    
    print(f"🎉 Training completed! Best test accuracy: {best_test_acc:.1f}%")
    print("🔄 Please restart your model server to use the updated model.")

if __name__ == "__main__":
    train_model()
