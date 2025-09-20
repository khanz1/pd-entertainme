#!/bin/bash

# Production Docker Compose Helper Script
set -e

echo "🚀 Starting PD EntertainMe Production Environment"

# Create necessary directories
mkdir -p ./server/logs

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi
 
# Build and start services
echo "🔨 Building server image (no cache)..."
docker-compose -f docker-compose.prod.yml build --no-cache server

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d --force-recreate
# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Production environment is ready!"
echo ""
echo "🌐 Services Available:"
echo "  - Server (API): http://localhost:8022"
echo "  - API Documentation: http://localhost:8022/docs"
echo "  - Redis: localhost:6379"
echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f [service]"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Update services: docker-compose -f docker-compose.prod.yml up --build -d"
echo ""
