# Docker Development and Production Setup with Redis

## What Was Changed, Fixed, or Added

### Added Files:

- `docker-compose.yml` - Development environment configuration
- `docker-compose.prod.yml` - Production environment configuration
- `client/Dockerfile` - Multi-stage client build configuration
- `client/nginx.conf` - Nginx configuration for production client
- `scripts/dev.sh` - Development helper script
- `scripts/prod.sh` - Production helper script

### Changes Made:

- **Docker Compose Development Setup**: Created a comprehensive development environment with Redis, PostgreSQL, server, and client services
- **Docker Compose Production Setup**: Created optimized production configuration with health checks, proper networking, and security considerations
- **Redis Integration**: Added Redis service to both environments, properly configured to work with existing BullMQ queue system
- **Client Dockerfile**: Created multi-stage Dockerfile supporting both development and production builds
- **Nginx Configuration**: Added production-ready Nginx configuration with security headers, gzip compression, and client-side routing support
- **Helper Scripts**: Created convenient shell scripts for starting development and production environments

### Configuration Updates:

- **Redis URL**: Configured to use Docker Redis service (`redis://redis:6379`)
- **Database URL**: Updated to use Docker PostgreSQL service
- **Environment Variables**: Structured environment variable management for both environments
- **Health Checks**: Added comprehensive health checks for all services
- **Networking**: Configured Docker networks for service isolation

## Pros and Cons

### Pros:

- **Consistent Environment**: Both development and production use identical infrastructure
- **Local Redis**: No external Redis dependency, everything runs locally via Docker
- **Simplified Setup**: Single command to start entire environment
- **Production Ready**: Multi-stage builds, health checks, and security configurations
- **Scalable**: Docker Compose allows easy scaling of services
- **Isolated**: Each environment runs in its own Docker network
- **Version Control**: Infrastructure as code - all configurations are version controlled

### Cons:

- **Resource Usage**: Running multiple Docker containers requires more system resources
- **Complexity**: Adds Docker knowledge requirement for developers
- **Initial Setup Time**: First build takes longer due to Docker image building
- **Debugging**: Debugging containerized applications can be more complex
- **Storage**: Docker volumes and images consume disk space

## Potential Issues and Fixes

### Issue 1: Port Conflicts

**Problem**: Services might conflict with existing local services on the same ports
**Solution**: Update port mappings in docker-compose files or stop conflicting local services

### Issue 2: Environment Variables Missing

**Problem**: Missing required environment variables (API keys, secrets)
**Solution**:

- Copy `.env.example` to `.env` and fill in actual values
- Ensure all required variables are set before running production

### Issue 3: Redis Data Persistence

**Problem**: Redis data might be lost on container restart
**Solution**: Redis is configured with `appendonly yes` and data volumes for persistence

### Issue 4: Build Performance

**Problem**: Initial Docker builds might be slow
**Solution**:

- Use Docker BuildKit for faster builds
- Leverage Docker layer caching
- Consider multi-stage build optimization

### Issue 5: File Permissions

**Problem**: File permission issues with Docker volumes
**Solution**: Scripts are made executable with `chmod +x`, ensure proper ownership in Dockerfiles

## Quick Start Guide

### Development Environment:

```bash
# Make scripts executable (done automatically)
chmod +x scripts/dev.sh

# Start development environment
./scripts/dev.sh

# Access services:
# - Frontend: http://localhost:5173
# - API: http://localhost:8000
# - Docs: http://localhost:8000/docs
```

### Production Environment:

```bash
# Create and configure .env file
cp .env.example .env
# Edit .env with your actual values

# Make scripts executable (done automatically)
chmod +x scripts/prod.sh

# Start production environment
./scripts/prod.sh

# Access services:
# - Frontend: http://localhost
# - API: http://localhost:8000
```

### Common Commands:

```bash
# View logs
docker-compose logs -f [service_name]

# Stop services
docker-compose down

# Restart specific service
docker-compose restart [service_name]

# Update and rebuild
docker-compose up --build -d
```

---

## Git Commit Message

```
feat(infra): add docker compose setup for dev and prod with redis

• create docker-compose.yml for development environment
• create docker-compose.prod.yml for production environment
• add redis service to both configurations
• create multi-stage client dockerfile with nginx
• add development and production helper scripts
• configure redis integration with existing bullmq setup
• add health checks and proper networking
• include security headers and optimization for production

BREAKING CHANGE: applications now require Docker to run in containerized mode
```
