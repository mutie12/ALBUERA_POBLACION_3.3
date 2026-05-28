@echo off
echo === BUILD START ===
cd /d "C:\Users\svlom\OneDrive\Desktop\ALBUERA_POBLACION_3\frontend"
echo Working dir: %CD%
echo.
echo [1] Clearing Vite cache...
cmd /c "Remove-Item -Recurse -Force node_modules\.vite 2>nul"
echo Cache cleared.
echo.
echo [2] Running vite build...
call npx vite build 2>&1
echo.
echo BUILD EXIT CODE: %ERRORLEVEL%
