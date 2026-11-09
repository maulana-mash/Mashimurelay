@echo off
title Simurelay Windows (WebView App Mode)
cd /d "%~dp0"
echo ===================================================================
echo     SIMURELAY WINDOWS - STANDALONE WEBVIEW CAD APPLICATION
echo ===================================================================
echo Memulai server lokal Simurelay...

start /b python serve.py --no-browser
timeout /t 1 /nobreak >nul

if not exist "runtime\webview-profile" mkdir "runtime\webview-profile"

set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

if exist %EDGE_PATH% (
    echo Membuka aplikasi Simurelay dalam mode WebView (Microsoft Edge)...
    start "" %EDGE_PATH% --app="http://localhost:8080/index.html" --window-size=1280,820 --user-data-dir="%~dp0runtime\webview-profile"
) else if exist %CHROME_PATH% (
    echo Membuka aplikasi Simurelay dalam mode WebView (Google Chrome)...
    start "" %CHROME_PATH% --app="http://localhost:8080/index.html" --window-size=1280,820 --user-data-dir="%~dp0runtime\webview-profile"
) else (
    echo Membuka di browser default...
    start http://localhost:8080/index.html
)

echo Aplikasi Simurelay Windows aktif!
