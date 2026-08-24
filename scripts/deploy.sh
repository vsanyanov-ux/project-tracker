#!/bin/bash
set -e

echo "🚀 [Project Tracker] Запуск развертывания на VPS..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker не найден. Устанавливаем Docker..."
    curl -fsSL https://get.docker.com | sh
fi

# Проверка docker compose
if ! docker compose version &> /dev/null; then
    echo "⚠️ Docker Compose plugin не найден..."
fi

echo "📦 Сборка и запуск контейнера..."
docker compose down || true
docker compose up -d --build

echo "✨ Успешно! Приложение запущено и доступно на порту 80."
