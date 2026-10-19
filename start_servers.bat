@echo off
setlocal
title Im-Here Server Runner
cd /d "%~dp0"

echo [1/3] Khoi dong PostgreSQL va Redis...
docker compose -f infrastructure\docker\docker-compose.yml up -d
if errorlevel 1 (
    echo Khong the khoi dong Docker dependencies. Hay kiem tra Docker Desktop.
    exit /b 1
)

echo [2/3] Build backend Spring Boot...
call mvn -f backend\pom.xml -DskipTests package
if errorlevel 1 (
    echo Build backend that bai.
    exit /b 1
)

echo [3/3] Khoi dong backend va frontend...
netstat -ano | findstr :8080 >nul
if errorlevel 1 (
    start "Backend Spring Boot" java -jar backend\target\backend-0.0.1-SNAPSHOT.jar
) else (
    echo Backend da chay tren port 8080.
)

netstat -ano | findstr :3000 >nul
if errorlevel 1 (
    start "Frontend Next.js" cmd /c "npm run dev"
) else (
    echo Frontend da chay tren port 3000.
)

echo ==============================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8080/api
echo Swagger UI: http://localhost:8080/swagger-ui.html
echo ==============================================
endlocal
