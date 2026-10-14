@echo off
rem ============================================================
rem  APPS - Rural Health Unit Clinic, San Manuel, Isabela
rem  Double-click to start the system. No tech skills needed.
rem  1. Starts the clinic system on this computer
rem  2. Opens it in your browser automatically
rem  Keep this window open while using the system.
rem  To stop: press CTRL+C in this window, then close it.
rem ============================================================
title APPS - Rural Health Unit Clinic
cd /d "%~dp0"
set PORT=8000
goto check_php
:check_php
where php >nul 2>nul
if errorlevel 1 goto no_php
goto check_vendor
:no_php
echo.
echo  [ERROR] PHP was not found on this computer.
echo  Install XAMPP (with PHP) first, then double-click this again.
echo.
pause
exit /b 1
:check_vendor
if not exist "vendor\autoload.php" goto first_install
goto check_env
:first_install
echo.
echo  First-time setup - installing system files. Please wait...
echo  (This takes a few minutes and only happens once.)
echo.
where composer >nul 2>nul
if errorlevel 1 goto no_composer
call composer install --no-dev --no-interaction
if errorlevel 1 goto install_fail
goto check_env
:no_composer
echo.
echo  [ERROR] Composer was not found. Please contact Mat to finish setup.
echo.
pause
exit /b 1
:install_fail
echo.
echo  [ERROR] Setup failed while installing files.
echo  Take a photo of this window and send it to Mat.
echo.
pause
exit /b 1
:check_env
if not exist ".env" goto make_env
goto check_key
:make_env
if not exist ".env.example" goto no_env
echo.
echo  First run - creating your settings file...
copy /y ".env.example" ".env" >nul
if errorlevel 1 goto no_env
goto check_key
:no_env
echo.
echo  [ERROR] The .env settings file is missing.
echo  Please contact Mat to finish setup.
echo.
pause
exit /b 1
:check_key
findstr /b /c:"APP_KEY=" .env >nul 2>nul
if errorlevel 1 goto gen_key
findstr /b /c:"APP_KEY=base64:" .env >nul 2>nul
if errorlevel 1 goto gen_key
goto check_build
:gen_key
echo  Generating application key...
call php artisan key:generate --force
if errorlevel 1 goto key_fail
goto check_build
:key_fail
echo.
echo  [ERROR] Could not generate the application key.
echo  Take a photo of this window and send it to Mat.
echo.
pause
exit /b 1
:check_build
if exist "public\build\manifest.json" goto check_db
goto need_build
:need_build
echo.
echo  Building the screen files (one-time step). Please wait...
echo.
where npm >nul 2>nul
if errorlevel 1 goto no_npm
if not exist "node_modules" call npm install
if errorlevel 1 goto build_fail
call npm run build
if errorlevel 1 goto build_fail
goto check_db
:no_npm
echo.
echo  [ERROR] The screen files are missing and Node.js is not installed.
echo  Please contact Mat to finish setup.
echo.
pause
exit /b 1
:build_fail
echo.
echo  [ERROR] Could not build the screen files.
echo  Take a photo of this window and send it to Mat.
echo.
pause
exit /b 1
:check_db
if exist "storage\app\.first-run-done" goto start_server
goto first_db
:first_db
echo.
echo  Preparing the database (one-time step). Please wait...
echo  NOTE: if this fails, open XAMPP Control Panel and press Start
echo  on BOTH Apache and MySQL, then double-click this file again.
echo.
if not exist "database\database.sqlite" type nul > "database\database.sqlite"
call php artisan migrate --seed --force
if errorlevel 1 goto db_fail
echo DONE > "storage\app\.first-run-done"
goto start_server
:db_fail
echo.
echo  [ERROR] Could not connect to the database.
echo  1. Open XAMPP Control Panel
echo  2. Press Start on Apache and MySQL
echo  3. Double-click this file again
echo  If it still fails, take a photo of this window and send it to Mat.
echo.
pause
exit /b 1
:start_server
echo.
echo  ============================================================
echo   APPS is starting...
echo   Opening http://127.0.0.1:%PORT% in your browser.
echo   Keep this window OPEN while using the system.
echo   To stop: press CTRL+C here, then close the window.
echo  ============================================================
echo.
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:%PORT%"
call php artisan serve --host=127.0.0.1 --port=%PORT%
echo.
echo  The system has stopped. You may close this window.
pause
exit /b 0
