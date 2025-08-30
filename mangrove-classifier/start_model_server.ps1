Write-Host "Starting Mangrove Classification Model Server..." -ForegroundColor Green
Write-Host ""

Set-Location "e:\projects\Hackout\mangrove-classifier"

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host ""
Write-Host "Starting Flask server on port 5001..." -ForegroundColor Yellow
python model_server.py

Read-Host "Press Enter to exit"
