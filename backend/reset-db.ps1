# Wipes the HackMate database and recreates it empty, so the backend reloads fresh demo data
# on its next start. Stops a running backend first (port 8080).
# Usage (from anywhere):  powershell -ExecutionPolicy Bypass -File backend\reset-db.ps1
# Then start the backend again with start-backend.ps1.

# 1. Stop the backend if it is running
$listener = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    Stop-Process -Id $listener.OwningProcess -Force
    Write-Host "Stopped the backend on port 8080"
}

# 2. Delete the database container and its data volume
docker rm -f hackmate-db 2>$null | Out-Null
docker volume rm hackmate-db-data 2>$null | Out-Null

# 3. Recreate an empty database on port 5433
docker run -d --name hackmate-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hackmate -v hackmate-db-data:/var/lib/postgresql/data -p 5433:5432 postgres:16 | Out-Null

# 4. Wait until PostgreSQL accepts connections
for ($i = 0; $i -lt 30; $i++) {
    docker exec hackmate-db pg_isready -U postgres -d hackmate -q 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
}
Write-Host "Database reset. Start the backend with start-backend.ps1 to load the demo data."
