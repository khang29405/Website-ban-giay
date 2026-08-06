#!/bin/bash
# Chay boi service "db-seed" trong docker-compose.yml (image mcr.microsoft.com/mssql-tools18).
# Cho SQL Server san sang roi tao schema ShoeStoreDB neu chua co. An toan de chay lai
# nhieu lan (vd moi lan "docker compose up") vi kiem tra database da ton tai truoc khi
# chay file .sql - du lieu trong volume "mssql-data" khong bi ghi de/mat.
set -e

SQLCMD=/opt/mssql-tools18/bin/sqlcmd
SERVER="${DB_SERVER:-db}"
PASS="$DB_SA_PASSWORD"

echo "[db-seed] Cho SQL Server o $SERVER san sang..."
until "$SQLCMD" -S "$SERVER" -U sa -P "$PASS" -C -Q "SELECT 1" >/dev/null 2>&1; do
    sleep 2
done

DB_EXISTS=$("$SQLCMD" -S "$SERVER" -U sa -P "$PASS" -C -h -1 -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.databases WHERE name = 'ShoeStoreDB'" | tr -d '[:space:]')

if [ "$DB_EXISTS" = "0" ]; then
    echo "[db-seed] Chua co database ShoeStoreDB, dang tao schema tu ShoeStoreDB.sql..."
    "$SQLCMD" -S "$SERVER" -U sa -P "$PASS" -C -i /scripts/ShoeStoreDB.sql
    echo "[db-seed] Tao schema xong."
else
    echo "[db-seed] Database ShoeStoreDB da ton tai (du lieu trong volume), bo qua seed."
fi
