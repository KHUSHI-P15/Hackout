@echo off
echo Starting Mangrove Classification Model Server...
echo.

cd /d "e:\projects\Hackout\mangrove-classifier"

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask server on port 5001...
python model_server.py

pause
