@echo off
chcp 65001 >nul
title GlucoControl IPS - Configurar Turso
echo.
echo ============================================
echo   GlucoControl IPS - Login Turso (GitHub)
echo ============================================
echo.
echo Se abrira el navegador para iniciar sesion en Turso.
echo Usa tu cuenta de GitHub (gratis).
echo.
start https://api.turso.tech?redirect=false
echo Esperando login (hasta 3 minutos)...
wsl -d kali-linux bash -lc "cd '/mnt/c/Users/mcneumaticos/Desktop/Proyecto para diabeticos/tools' && timeout 180 ./turso auth login --headless"
echo.
echo Verificando...
wsl -d kali-linux bash -lc "cd '/mnt/c/Users/mcneumaticos/Desktop/Proyecto para diabeticos/tools' && ./turso auth whoami"
if errorlevel 1 (
  echo.
  echo No se completo el login. Intenta de nuevo.
  pause
  exit /b 1
)
echo.
echo Login OK. Provisionando base de datos y Vercel...
cd /d "%~dp0.."
node scripts/provision-all.mjs
echo.
pause
