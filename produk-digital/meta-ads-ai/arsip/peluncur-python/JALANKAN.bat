@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Bot Peluncur Iklan Meta

where py >nul 2>nul
if %errorlevel%==0 (set PY=py -3) else (set PY=python)
%PY% --version >nul 2>nul
if errorlevel 1 (
  echo Python belum terpasang. Pasang Python 3.11 atau lebih baru dari python.org, lalu jalankan lagi.
  pause
  exit /b 1
)
if not exist ".env" (
  echo Berkas .env belum ada. Salin .env.contoh menjadi .env lalu isi token. Lihat BACA-DULU.md.
  pause
  exit /b 1
)
if not exist "brief.json" (
  echo Berkas brief.json belum ada. Salin brief.contoh.json menjadi brief.json lalu isi.
  pause
  exit /b 1
)

:menu
echo.
echo ================================================
echo   BOT PELUNCUR IKLAN META
echo ================================================
echo   1. Cek       (periksa akun dan brief; aman)
echo   2. Rencana   (lihat yang AKAN dibuat; aman)
echo   3. Luncurkan (buat semuanya dalam keadaan JEDA)
echo   4. Aktifkan  (nyalakan; uang mulai terpakai)
echo   5. Jeda      (jeda semuanya)
echo   6. Status
echo   7. SEKALI KLIK: Cek lalu Luncurkan (tetap JEDA)
echo   0. Keluar
echo ================================================
set /p PILIH=Pilih nomor:

if "%PILIH%"=="1" %PY% peluncur.py cek
if "%PILIH%"=="2" %PY% peluncur.py rencana
if "%PILIH%"=="3" %PY% peluncur.py luncurkan
if "%PILIH%"=="4" %PY% peluncur.py aktifkan
if "%PILIH%"=="5" %PY% peluncur.py jeda
if "%PILIH%"=="6" %PY% peluncur.py status
if "%PILIH%"=="7" (
  %PY% peluncur.py cek
  if not errorlevel 1 %PY% peluncur.py luncurkan
)
if "%PILIH%"=="0" exit /b 0
goto menu
