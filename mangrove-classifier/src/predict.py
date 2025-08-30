import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import config

class MangroveClassifier:
    def __init__(self, model_path=None):
        """
        Initialize the mangrove classifier
        """
        if model_path is None:
            model_path = os.path.join(config.MODEL_DIR, "mangrove_model.pth")
        
        self.model_path = model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.load_model()
        self.transform = self.get_transform()
        self.classes = config.CLASS_NAMES
    
    def load_model(self):
        """
        Load the trained model
        """
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        model = models.resnet50(pretrained=False)
        model.fc = nn.Linear(model.fc.in_features, config.NUM_CLASSES)
        
        try:
            model.load_state_dict(torch.load(self.model_path, map_location=self.device))
            model.to(self.device)
            model.eval()
            print(f"✅ Model loaded successfully from {self.model_path}")
            return model
        except Exception as e:
            raise RuntimeError(f"Error loading model: {e}")
    
    def get_transform(self):
        """
        Get image preprocessing transforms
        """
        return transforms.Compose([
            transforms.Resize(config.IMG_SIZE),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    
    def preprocess_image(self, image_path):
        """
        Preprocess image for prediction
        """
        try:
            image = Image.open(image_path).convert("RGB")
            image_tensor = self.transform(image).unsqueeze(0)
            return image_tensor.to(self.device)
        except Exception as e:
            raise ValueError(f"Error processing image {image_path}: {e}")
    
    def predict(self, image_path, return_confidence=False):
        """
        Predict if image contains mangrove or not
        """
        image_tensor = self.preprocess_image(image_path)
        
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            
            predicted_class = self.classes[predicted.item()]
            confidence_score = confidence.item()
        
        if return_confidence:
            return predicted_class, confidence_score
        else:
            return predicted_class
    
    def predict_batch(self, image_paths):
        """
        Predict multiple images at once
        """
        predictions = []
        for image_path in image_paths:
            try:
                prediction, confidence = self.predict(image_path, return_confidence=True)
                predictions.append({
                    'image': os.path.basename(image_path),
                    'prediction': prediction,
                    'confidence': confidence
                })
            except Exception as e:
                predictions.append({
                    'image': os.path.basename(image_path),
                    'prediction': 'Error',
                    'confidence': 0.0,
                    'error': str(e)
                })
        return predictions

def predict_image(image_path, model_path=None):
    """
    Simple function to predict a single image
    """
    try:
        classifier = MangroveClassifier(model_path)
        prediction, confidence = classifier.predict(image_path, return_confidence=True)
        
        print(f"🖼️  Image: {os.path.basename(image_path)}")
        print(f"🔮 Prediction: {prediction}")
        print(f"🎯 Confidence: {confidence:.2%}")
        
        return prediction, confidence
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python predict.py <image_path>")
        print("Example: python predict.py test_image.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        sys.exit(1)
    
    predict_image(image_path)
