@echo off
title GlucoControl IPS - Servidor para celular
echo.
echo  ================================================
echo   GlucoControl IPS - Acceso desde tu celular
echo  ================================================
echo.
echo  1. Tu PC y celular deben estar en la misma WiFi
echo  2. Anota la IP de tu PC (ipconfig)
echo  3. En el celular abre: http://TU-IP:3000
echo.
echo  Para INSTALAR como app:
echo  - Android: Menu ^> Instalar aplicacion
echo  - iPhone: Compartir ^> Agregar a pantalla de inicio
echo.
cd /d "%~dp0"
npm run dev:mobile
