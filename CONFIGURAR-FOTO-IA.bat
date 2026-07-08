@echo off
chcp 65001 >nul
title GlucoControl IPS - Configurar analisis de foto con IA
echo.
echo  ============================================
echo   GlucoControl IPS - Configurar foto con IA
echo  ============================================
echo.
echo  Se abrira Google AI Studio para obtener tu clave GRATIS.
echo  (No pide tarjeta de credito - 1500 fotos/dia gratis)
echo.
start https://aistudio.google.com/app/apikey
echo.
set /p GEMINI_KEY="Pega aca tu clave AIza... y presiona Enter: "
if "%GEMINI_KEY%"=="" (
  echo.
  echo  No ingresaste clave. La app sigue funcionando con analisis en el celular.
  pause
  exit /b 1
)
echo.
echo  Configurando en Vercel produccion...
cd /d "%~dp0"
call npx vercel env rm GEMINI_API_KEY production --yes 2>nul
call npx vercel env add GEMINI_API_KEY production --value "%GEMINI_KEY%" --yes --sensitive
echo.
echo  Desplegando a produccion...
call npx vercel --prod --yes
echo.
echo  Listo! La foto de comidas ahora usa Google Gemini IA.
echo  Proba en: https://glucocontrol-ips.vercel.app/app
echo.
pause
