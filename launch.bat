@echo off
title Simurelay Windows Launcher
cd /d "%~dp0"
echo ===================================================================
echo              SIMURELAY CAD - WINDOWS EDITION
echo ===================================================================
echo [1] Buka sebagai Aplikasi Desktop (WebView App Mode - Rekomendasi)
echo [2] Buka di Browser (Google Chrome / Edge Tab)
echo.
set /p opt="Pilih opsi (1/2, default 1): "
if "%opt%"=="2" (
    call run-browser.bat
) else (
    call run-webview-app.bat
)
