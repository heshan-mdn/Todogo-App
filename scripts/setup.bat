@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Todogo Application Setup
echo ========================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo [INFO] Building Docker images...
docker-compose build

if %errorlevel% equ 0 (
    echo [SUCCESS] Docker images built successfully
) else (
    echo [ERROR] Failed to build Docker images
    exit /b 1
)

echo.
echo [INFO] Starting services...
docker-compose up -d

if %errorlevel% equ 0 (
    echo [SUCCESS] Services started successfully
) else (
    echo [ERROR] Failed to start services
    exit /b 1
)

echo.
echo [INFO] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   Application is ready!
echo ========================================
echo.
echo Frontend:     http://localhost:3000
echo Backend API:  http://localhost:8080
echo PostgreSQL:   localhost:5432
echo.
echo Tips:
echo   - View logs: docker-compose logs -f
echo   - Stop services: docker-compose down
echo   - Rebuild: docker-compose up -d --build
echo.
