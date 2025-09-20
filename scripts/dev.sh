#!/bin/bash

# Development Docker Compose Helper Script
set -e

echo "🚀 Starting PD EntertainMe Development Environment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
mkdir -p ./server/logs
# mkdir -p ./client/dist

# Copy environment file if it doesn't exist
if [ ! -f ./client/.env.development ]; then
  echo "->> .env.development file not found. Please create one with your configuration."
  exit 1
fi

if [ ! -f ./server/.env.development ]; then
  echo "->> .env.development file not found. Please create one with your configuration."
  exit 1
fi

# Build and start services
echo "🔨 Building and starting development services..."
docker-compose -f docker-compose.yml up --build -d

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.yml ps

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Services Available:"
echo "  - Client (Frontend): http://localhost:5173"
echo "  - Server (API): http://localhost:8000"
echo "  - API Documentation: http://localhost:8000/docs"
echo "  - Redis: localhost:6379"
echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker-compose -f docker-compose.yml logs -f [service]"
echo "  - Stop services: docker-compose -f docker-compose.yml down"
echo "  - Restart service: docker-compose -f docker-compose.yml restart [service]"
echo ""

# Ask if user wants to follow logs
docker-compose -f docker-compose.yml logs -f
