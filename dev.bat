@echo off
cd /d "%~dp0"
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" >nul
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
echo Starting DartBinEditor...
npm run tauri dev
