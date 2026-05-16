$cargoPath = "$env:USERPROFILE\.cargo\bin"
$vsPath = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build"

# Add cargo to PATH
$env:Path = "$cargoPath;$env:Path"

# Initialize VS Build Tools environment
if (Test-Path "$vsPath\vcvars64.bat") {
    cmd /c "`"$vsPath\vcvars64.bat`" >nul && set" | ForEach-Object {
        if ($_ -match '^(\w+)=(.*)') {
            Set-Item -Path "Env:$($matches[1])" -Value $matches[2]
        }
    }
}

Write-Host "Starting DartBinEditor..." -ForegroundColor Cyan
npm run tauri dev
