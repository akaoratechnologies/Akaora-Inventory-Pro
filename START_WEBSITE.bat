@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Akaora Inventory Pro v95 - Mobile Billing + Dashboard Polish Launcher
cls
echo ================================================
echo   AKAORA INVENTORY PRO - v95
echo ================================================
echo Opening the updated app at http://localhost:8765/
echo Your shop data stays in this browser and address.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_WEBSITE.ps1"
if errorlevel 1 (
 echo.
 echo Launcher could not start. Please read the error above.
 echo No workspace data has been deleted.
 pause
)
endlocal
