# Starts the HackMate backend against the Docker database "hackmate-db" on port 5433.
# Usage (from anywhere):  powershell -ExecutionPolicy Bypass -File backend\start-backend.ps1

Set-Location $PSScriptRoot

$env:DB_URL = "jdbc:postgresql://localhost:5433/hackmate"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "postgres"

.\mvnw.cmd spring-boot:run
