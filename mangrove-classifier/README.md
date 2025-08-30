# 🌿 Mangrove Classifier (AI/ML)

A deep learning project to classify satellite/ground images as **Mangrove** or **Non-Mangrove**
using Transfer Learning with ResNet50.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-v1.9+-red.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Clone the repository
git clone <repo-url>
cd mangrove-classifier

# Install dependencies
pip install -r requirements.txt
```

### 2. Prepare Data

```bash
# Create data structure and get instructions
python prepare_data.py
```

Add your training images:

-   `data/mangrove/` - Put mangrove images here
-   `data/non-mangrove/` - Put non-mangrove images here

### 3. Train the Model

```bash
# Option 1: Use Jupyter Notebook (Recommended)
jupyter notebook notebooks/train_model.ipynb

# Option 2: Use Python script
python src/train.py
```

### 4. Make Predictions

```bash
# Predict single image
python src/predict.py path/to/your/image.jpg

# Use in Python script
from src.predict import MangroveClassifier
classifier = MangroveClassifier()
prediction = classifier.predict("image.jpg")
```

## 📊 Project Structure

```
mangrove-classifier/
├── 📁 data/                     # Training data
│   ├── mangrove/               # Mangrove images
│   └── non-mangrove/           # Non-mangrove images
├── 📁 models/                   # Saved models
├── 📁 notebooks/                # Jupyter notebooks
│   └── train_model.ipynb       # Training notebook
├── 📁 src/                      # Source code
│   ├── config.py               # Configuration
│   ├── train.py                # Training script
│   ├── predict.py              # Prediction script
│   └── utils.py                # Utility functions
├── prepare_data.py             # Data preparation script
├── requirements.txt            # Dependencies
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### Prerequisites

-   Python 3.8+
-   PyTorch 1.9+
-   CUDA (optional, for GPU acceleration)

### Step-by-step Setup

1. **Clone Repository**

    ```bash
    git clone <your-repo-url>
    cd mangrove-classifier
    ```

2. **Create Virtual Environment (Recommended)**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install Dependencies**

    ```bash
    pip install -r requirements.txt
    ```

4. **Prepare Data Structure**

    ```bash
    python prepare_data.py
    ```

5. **Add Training Data**
    - Collect mangrove and non-mangrove images
    - Place them in respective folders:
        - `data/mangrove/` - for mangrove images
        - `data/non-mangrove/` - for non-mangrove images

## 📖 Usage Guide

### Training the Model

#### Option 1: Jupyter Notebook (Recommended)

```bash
jupyter notebook notebooks/train_model.ipynb
```

Follow the step-by-step guide in the notebook.

#### Option 2: Python Script

```bash
python src/train.py
```

### Making Predictions

#### Command Line

```bash
python src/predict.py path/to/image.jpg
```

#### Python Integration

```python
from src.predict import MangroveClassifier

# Initialize classifier
classifier = MangroveClassifier()

# Single prediction
prediction = classifier.predict("image.jpg")
print(f"Prediction: {prediction}")

# Prediction with confidence
prediction, confidence = classifier.predict("image.jpg", return_confidence=True)
print(f"Prediction: {prediction} (confidence: {confidence:.2%})")

# Batch prediction
image_paths = ["img1.jpg", "img2.jpg", "img3.jpg"]
results = classifier.predict_batch(image_paths)
for result in results:
    print(f"{result['image']}: {result['prediction']} ({result['confidence']:.2%})")
```

## 🔧 Configuration

Edit `src/config.py` to customize training parameters:

```python
# Model parameters
BATCH_SIZE = 32          # Adjust based on GPU memory
EPOCHS = 10              # Number of training epochs
LEARNING_RATE = 0.001    # Learning rate
IMG_SIZE = (224, 224)    # Input image size

# Data paths
DATA_DIR = "data/"       # Training data directory
MODEL_DIR = "models/"    # Model save directory
```

## 📊 Data Requirements

### Image Requirements

-   **Format**: JPG, PNG, JPEG
-   **Size**: Minimum 224x224 pixels
-   **Quality**: Clear, well-lit images
-   **Quantity**: At least 50-100 images per class (more is better)

### Data Sources

-   **Kaggle**: Search for "mangrove satellite images"
-   **NASA Earth Data**: https://earthdata.nasa.gov/
-   **Sentinel-2**: Satellite imagery
-   **Google Earth Engine**: https://earthengine.google.com/
-   **Manual Collection**: Environmental monitoring websites

### Expected Data Structure

```
data/
├── mangrove/          # Mangrove images
│   ├── mangrove_001.jpg
│   ├── mangrove_002.jpg
│   └── ...
└── non-mangrove/      # Non-mangrove images
    ├── forest_001.jpg
    ├── urban_001.jpg
    └── ...
```

## 🧠 Model Architecture

-   **Base Model**: ResNet50 (pre-trained on ImageNet)
-   **Transfer Learning**: Freeze feature extractor, train final classifier
-   **Classes**: 2 (Mangrove, Non-Mangrove)
-   **Input Size**: 224x224x3
-   **Output**: Class probabilities

## 📈 Performance Tips

### For Better Accuracy

1. **More Data**: Collect diverse, high-quality images
2. **Balanced Dataset**: Equal numbers of each class
3. **Data Augmentation**: Enabled by default in training
4. **Hyperparameter Tuning**: Adjust learning rate, epochs
5. **GPU Training**: Use CUDA for faster training

### Troubleshooting

-   **CUDA Out of Memory**: Reduce `BATCH_SIZE` in config.py
-   **Low Accuracy**: Add more training data or train longer
-   **Overfitting**: Reduce epochs or add more data augmentation

## 🚀 Integration with Web App

This model can be integrated with the web application:

```python
# In your web server (e.g., Flask/FastAPI)
from mangrove_classifier.src.predict import MangroveClassifier

classifier = MangroveClassifier()

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    image_file = request.files['image']
    prediction = classifier.predict(image_file)
    return {'prediction': prediction}
```

## 📝 API Documentation

### MangroveClassifier Class

#### Methods

-   `__init__(model_path=None)`: Initialize classifier
-   `predict(image_path, return_confidence=False)`: Predict single image
-   `predict_batch(image_paths)`: Predict multiple images

#### Example Usage

```python
classifier = MangroveClassifier()
result = classifier.predict("test.jpg", return_confidence=True)
print(f"Class: {result[0]}, Confidence: {result[1]:.2%}")
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

-   ResNet50 architecture from torchvision
-   Transfer learning techniques
-   Environmental monitoring community
-   Open satellite imagery providers

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Ensure data is properly organized
3. Verify all dependencies are installed
4. Open an issue on GitHub with details

---

**Happy Classifying! 🌿🔬**
