import os

# Directory paths
DATA_DIR = "data/"
MODEL_DIR = "models/"
TRAIN_DIR = os.path.join(DATA_DIR, "train")
TEST_DIR = os.path.join(DATA_DIR, "test")

# Model parameters
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001
IMG_SIZE = (224, 224)  # resize for pre-trained model

# Class names
CLASS_NAMES = ['mangrove', 'non-mangrove']
NUM_CLASSES = len(CLASS_NAMES)
