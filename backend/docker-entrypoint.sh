#!/bin/bash
set -e

echo "==> Iniciando backend Laravel..."

# Esperar a que MySQL esté disponible
echo "==> Esperando MySQL..."
until php artisan migrate:status > /dev/null 2>&1; do
    echo "   MySQL no disponible aún, reintentando en 3s..."
    sleep 3
done

echo "==> Ejecutando migraciones..."
php artisan migrate --force

echo "==> Optimizando la aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Iniciando servidor Laravel en puerto 8000..."
php artisan serve --host=0.0.0.0 --port=8000
