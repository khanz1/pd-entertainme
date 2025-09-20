#!/bin/bash

# Production Docker Compose Helper Script
set -e

echo "🚀 Starting PD EntertainMe Production Environment"

# Create necessary directories
mkdir -p ./server/logs
# mkdir -p ./client/dist

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi
# ls -la ./server
# cat ./server/.env.production
# Check for required environment variables
# if [ ! -f ./server/.env.production ]; then
#     echo "❌ .env.production file not found. Please create one with your production configuration."
#     exit 1
# fi

# Load environment variables
echo "1 >>"
set -a
echo "2 >>"
cat ./server/.env.production
# source ./server/.env.production
echo "3 >>"
set +a

echo "4 >>"
# Validate required environment variables
# required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "TMDB_API_KEY")
# missing_vars=()

# for var in "${required_vars[@]}"; do
#     if [ -z "${!var}" ]; then
#         missing_vars+=("$var")
#     fi
# done

# if [ ${#missing_vars[@]} -ne 0 ]; then
#     echo "❌ Missing required environment variables:"
#     printf '  - %s\n' "${missing_vars[@]}"
#     echo "Please update your .env file and try again."
#     exit 1
# fi

# Set build metadata
# export GIT_SHA=${GIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")}
# export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# echo "📋 Build Info:"
# echo "  - Git SHA: $GIT_SHA"
# echo "  - Build Date: $BUILD_DATE"


# Build and start services
echo "🔨 Building and starting production services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
# echo "⏳ Waiting for services to be ready..."
# sleep 15

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Production environment is ready!"
echo ""
echo "🌐 Services Available:"
echo "  - Client (Frontend): http://localhost"
echo "  - Server (API): http://localhost:8000"
echo "  - API Documentation: http://localhost:8000/docs"
echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f [service]"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Update services: docker-compose -f docker-compose.prod.yml up --build -d"
echo ""

# Ask if user wants to follow logs
# echo "📋 Would you like to follow the logs? (y/n)"
# read -r follow_logs

# if [[ "$follow_logs" =~ ^[Yy]$ ]]; then
#     echo "🔍 Following logs for all services (Press Ctrl+C to stop)..."
#     echo ""
#     docker-compose -f docker-compose.prod.yml logs -f
# fi
