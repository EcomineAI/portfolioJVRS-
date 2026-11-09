@echo off
echo Starting EcomineAI Portfolio...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting development server...
REM Run vite dev with the --open flag to automatically launch the browser
call npm run dev -- --open

pause
