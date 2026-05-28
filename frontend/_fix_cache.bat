@echo off
echo Clearing Vite pre-bundle cache...
Call rmdir /s /q "%~dp0node_modules\.vite" 2>nul
echo Cache cleared. New build will regenerate fresh pre-bundles.
npx vite build
echo Build result: %ERRORLEVEL%
pause
