#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER backendUser;
	CREATE DATABASE corvus;
	GRANT ALL PRIVILEGES ON DATABASE corvus TO backendUser;
EOSQL