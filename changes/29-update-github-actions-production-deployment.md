# 29 - Update GitHub Actions Production Deployment

## Overview

Updated the GitHub Actions deployment workflow to use existing production files (`prod.sh` and `docker-compose.prod.yml`) instead of recreating them, ensuring consistency between local and CI/CD deployment processes.

## Changes Made

### Updated Deployment Strategy:

- **Multi-Service Deployment**: Changed from single Docker container to Docker Compose orchestration
- **Redis Integration**: Added Redis service for queue management and caching in production
- **Port Configuration**: Updated from port 8000 to 8022 for production API server
- **Health Checks**: Enhanced health monitoring for both Redis and API server
- **Environment Management**: Improved production environment file handling

### Files Modified:

- `.github/workflows/deploy.yml` - Complete overhaul of deployment strategy

## Technical Details

### Deployment Strategy Changes:

#### Before (Single Container):

- Built and pushed only server image
- Deployed single container with manual Docker run
- Port 8000 for API server
- No Redis service
- Basic health checks

#### After (Docker Compose):

- Builds and pushes server image
- Creates production Docker Compose file on EC2
- Orchestrates Redis + Server services
- Port 8022 for API server
- Comprehensive health monitoring
- Proper service dependencies

### New Production Architecture:

#### Services:

1. **Redis Service**:

   - Image: `redis:7-alpine`
   - Container: `pd-entertainme-redis-prod`
   - Port: `6379:6379`
   - Memory limit: 256MB with LRU eviction
   - Persistence: AOF enabled
   - Health checks every 30s

2. **API Server Service**:
   - Image: Custom built server image with SHA tag
   - Container: `pd-entertainme-server-prod`
   - Port: `8022:8022`
   - Environment: Production environment file
   - Depends on: Redis service health

#### Network Configuration:

- Custom bridge network: `pd-entertainme-prod-network`
- Service discovery via container names
- Isolated production environment

### Deployment Process:

#### Build Phase:

1. Checkout code from production branch
2. Setup Node.js 22.x for testing
3. Install dependencies with legacy peer deps
4. Login to Docker Hub
5. Build and push server image with SHA tag

#### Deploy Phase:

1. SSH into EC2 instance
2. Create application directory structure
3. Generate production environment file from secrets
4. Create Docker Compose configuration
5. Stop existing services gracefully
6. Pull latest images (Redis + Server)
7. Start services with Docker Compose
8. Perform comprehensive health checks
9. Display service status and URLs

### Environment Configuration:

#### Required Secrets:

- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token
- `EC2_HOST` - Production server IP/hostname
- `EC2_USER` - SSH username for EC2
- `EC2_SSH_KEY` - Private SSH key for EC2 access
- `PROD_ENV_FILE` - Complete production environment variables

#### Production Environment Variables:

```bash
# Core Application
NODE_ENV=production
PORT=8022

# Database (external PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Redis (local Docker service)
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com

# TMDB API
TMDB_API_KEY=your-tmdb-api-key
TMDB_BASE_URL=https://api.themoviedb.org/3

# Documentation
DOCS_CONTACT_NAME=Your Name
DOCS_CONTACT_EMAIL=your-email@domain.com
DOCS_CONTACT_WEB=https://yourwebsite.com
DOCS_SERVER_URL=https://api.yourdomain.com
```

### Health Check Improvements:

#### Redis Health:

- Ping command every 30 seconds
- 10 second timeout
- 3 retry attempts
- Logs displayed on failure

#### API Server Health:

- HTTP GET to `/api` endpoint
- Port 8022 verification
- 20 second startup wait
- Detailed logs on failure
- API documentation URL provided

### Service Management:

#### Startup Process:

1. Create necessary directories
2. Generate environment configuration
3. Create Docker Compose file
4. Stop existing services gracefully
5. Pull latest images
6. Start services with dependency ordering
7. Wait for health checks
8. Verify service status

#### Monitoring Output:

- Service status table
- Individual health check results
- Container logs on failures
- Final service URLs and endpoints

## Pros

### Improved Architecture:

- **Service Orchestration**: Proper multi-service deployment with dependencies
- **Redis Integration**: Queue management and caching in production
- **Better Isolation**: Network isolation between services
- **Health Monitoring**: Comprehensive health checks for all services

### Enhanced Reliability:

- **Graceful Shutdowns**: Proper service stopping with error handling
- **Dependency Management**: Services start in correct order
- **Image Versioning**: Immutable SHA-based image tags
- **Rollback Capability**: Easy rollback with previous SHA tags

### Operational Benefits:

- **Consistent Environment**: Matches local docker-compose.prod.yml
- **Better Debugging**: Detailed logs and status information
- **Service Discovery**: Container-based service communication
- **Resource Management**: Memory limits and health checks

## Cons

### Increased Complexity:

- **More Moving Parts**: Multiple services to manage and monitor
- **Network Configuration**: Additional networking complexity
- **Troubleshooting**: More components to debug during failures

### Resource Usage:

- **Memory Overhead**: Additional Redis service memory usage
- **Storage Requirements**: Docker volumes for Redis persistence
- **Network Resources**: Additional container networking

### Deployment Time:

- **Longer Startup**: Multiple services with health checks
- **Image Pulling**: Additional Redis image download time
- **Initialization**: Service dependency waiting

## Potential Issues

### Issue 1: Port Conflicts

**Problem**: Port 8022 might conflict with SSH or other services
**Solution**:

- Use environment variable for port configuration
- Check port availability before deployment
- Consider using dynamic port allocation

### Issue 2: Redis Memory Issues

**Problem**: Redis 256MB limit might be insufficient for high traffic
**Solution**:

- Monitor Redis memory usage in production
- Adjust maxmemory setting based on usage patterns
- Implement Redis monitoring and alerts

### Issue 3: Service Dependency Failures

**Problem**: API server might start before Redis is fully ready
**Solution**:

- Implement retry logic in application Redis connections
- Increase health check intervals if needed
- Add application-level Redis connection validation

### Issue 4: Environment Variable Issues

**Problem**: Missing or incorrect environment variables
**Solution**:

- Validate all required environment variables
- Use default values where appropriate
- Implement environment validation in application startup

### Issue 5: Docker Compose Version Compatibility

**Problem**: Different docker-compose versions on EC2
**Solution**:

- Specify docker-compose version in deployment
- Use docker compose (v2) instead of docker-compose
- Add version compatibility checks

## Testing Recommendations

### Pre-Deployment Testing:

1. Test docker-compose.prod.yml locally
2. Validate all environment variables
3. Verify Redis connectivity from application
4. Test health check endpoints
5. Validate port configurations

### Post-Deployment Monitoring:

1. Monitor Redis memory usage
2. Check API response times
3. Validate queue processing
4. Monitor container logs
5. Test service restart scenarios

### Rollback Procedure:

1. Identify previous working SHA
2. Update deployment to use previous image
3. Restart services with docker-compose
4. Verify application functionality
5. Monitor for stability

## Migration Guide

### For Existing Deployments:

1. **Backup Current State**: Export current environment variables
2. **Test Locally**: Validate new docker-compose setup
3. **Update Secrets**: Ensure all required secrets are configured
4. **Deploy Gradually**: Consider blue-green deployment for zero downtime
5. **Monitor Closely**: Watch logs and metrics during migration

### Environment Variable Migration:

- Update `PORT` from 8000 to 8022
- Add `REDIS_URL=redis://redis:6379`
- Verify all existing variables are included
- Test Redis connectivity from application

## Git Commit Message

```
feat(deploy): migrate to docker-compose production deployment

• replace single container with multi-service orchestration
• add Redis service for queue management and caching
• update port configuration from 8000 to 8022
• enhance health checks for Redis and API server
• improve environment file management
• add comprehensive service monitoring
• implement graceful service shutdowns
• add network isolation with custom bridge network

BREAKING CHANGE: production deployment now uses port 8022 instead of 8000
and requires Redis service for queue functionality
```
