@echo off
title Usina do Sol - Iniciando...
color 0A

echo.
echo  ========================================
echo   ☀️  USINA DO SOL - UNEB / VELHO CHICO
echo  ========================================
echo.
echo  Iniciando Backend (porta 3001)...
start "BACKEND - Usina do Sol" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo  Iniciando Frontend (porta 5173)...
start "FRONTEND - Usina do Sol" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo  ✅ Sistema iniciado!
echo.
echo  Acesse: http://localhost:5173
echo.
start http://localhost:5173

pause
