# Step 1: Kill node processes
Get-Process -Name "node","nodemon" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
"Node processes cleaned" | Out-File "C:\Users\svlom\OneDrive\Desktop\Albuera-Poblacion_EMS\backend\step1.txt"

# Step 2: Start backend server
Write-Output "Starting backend server..."
cd "C:\Users\svlom\OneDrive\Desktop\Albuera-Poblacion_EMS\backend"
npm run dev > "C:\Users\svlom\OneDrive\Desktop\Albuera-Poblacion_EMS\backend\server.log" 2>&1
$global:serverProcess = $LASTEXITCODE
"Server started with PID: $($global:serverProcess)" | Out-File "C:\Users\svlom\OneDrive\Desktop\Albuera-Poblacion_EMS\backend\step2.txt"
