@echo off
echo ========================================
echo   Popolamento dati Strapi...
echo ========================================
echo.
echo ATTENZIONE: Assicurati che Strapi sia in running!
echo.
pause
cd backend
node scripts/seed-data.js
pause
