@echo off
set PORT=41739
start "Interview Journey Server" /B python -m http.server %PORT%
timeout /t 1 /nobreak >nul
start chrome "http://localhost:%PORT%/#/dashboard"
echo Data Science Interview Journey is running at http://localhost:%PORT%
echo Close this window to leave the server running, or press Ctrl-C to stop it first.
pause
