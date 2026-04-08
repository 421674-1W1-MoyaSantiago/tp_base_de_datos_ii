@echo off
REM Script to run Spring Boot Unit Tests for Lavadero Backend
REM This script will handle Maven installation and test execution

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Lavadero Backend Unit Tests
echo ============================================
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo.
    echo To run the tests, you need to:
    echo 1. Install Maven: https://maven.apache.org/download.cgi
    echo 2. Add Maven bin directory to your system PATH
    echo 3. Verify: mvn -version
    echo.
    echo OR use Docker (if available):
    echo   docker build -f Dockerfile.test -t lavadero-test .
    echo.
    exit /b 1
)

echo Maven found. Running tests...
echo.

REM Run the tests
cd %~dp0
mvn clean test

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   ✅ ALL TESTS PASSED!
    echo ============================================
    echo.
) else (
    echo.
    echo ============================================
    echo   ❌ TESTS FAILED
    echo ============================================
    echo.
    exit /b 1
)

endlocal
