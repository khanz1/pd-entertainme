# Fix Docker Development Setup and Add Logs Integration

## What Was Changed, Fixed, or Added

### Fixed Issues:

- **Nodemon Not Found Error**: Fixed server development container failing to start due to missing dev dependencies
- **Development Dependencies**: Created separate `Dockerfile.dev` for development environment with all dependencies
- **Environment Variables**: Updated configuration to use external environment variables for DATABASE_URL and REDIS_URL

### Added Files:

- `server/Dockerfile.dev` - Development-specific Dockerfile with dev dependencies
- `scripts/logs-dev.sh` - Interactive development logs viewer
- `scripts/logs-prod.sh` - Interactive production logs viewer

### Updated Files:

- `docker-compose.yml` - Now uses development Dockerfile and environment variables
- `docker-compose.prod.yml` - Updated version format and added trailing newline
- `scripts/dev.sh` - Added interactive follow logs option
- `scripts/prod.sh` - Added interactive follow logs option
- `env.example` - Updated comments to clarify external DB usage

### Key Changes:

- **Development Dockerfile**: Separate Dockerfile for development that installs all dependencies including nodemon
- **Interactive Logs**: Both helper scripts now ask if you want to follow logs after startup
- **Dedicated Log Scripts**: Standalone scripts for viewing logs without restarting services
- **Flexible Database**: Development setup now supports external database configuration via environment variables
- **Service Selection**: Log scripts allow choosing specific services to follow

## Pros and Cons

### Pros:

- **Fixed Development Issues**: Nodemon now works properly in development containers
- **Better Log Management**: Easy access to logs with interactive prompts
- **Flexible Configuration**: Environment variables allow external database usage
- **Dedicated Log Scripts**: Can view logs without restarting entire environment
- **Service-Specific Logs**: Option to follow logs for individual services
- **User-Friendly**: Interactive prompts make it easier for developers to access logs

### Cons:

- **Additional Files**: More Dockerfiles to maintain (dev vs prod)
- **Complexity**: Multiple scripts for different purposes
- **Environment Setup**: Requires proper .env configuration for external services

## Potential Issues and Fixes

### Issue 1: Development Dependencies Conflicts

**Problem**: Development Dockerfile might install conflicting versions
**Solution**: Pin dependency versions in package.json and use npm ci for consistent installs

### Issue 2: External Database Connection

**Problem**: Development environment might not connect to external database
**Solution**:

- Ensure DATABASE_URL points to accessible database
- Check network connectivity and firewall settings
- Verify database credentials and permissions

### Issue 3: Log Overflow

**Problem**: Following logs for all services might be overwhelming
**Solution**: Use service-specific log scripts (`./scripts/logs-dev.sh`) and select individual services

### Issue 4: Environment Variable Loading

**Problem**: Environment variables might not be loaded properly
**Solution**:

- Ensure .env file exists and is properly formatted
- Check that docker-compose loads environment variables correctly
- Verify variable names match exactly

## Quick Start Guide

### Fixed Development Environment:

```bash
# Copy and configure environment variables
cp env.example .env
# Edit .env with your external database and Redis settings

# Start development environment (now with working nodemon)
./scripts/dev.sh

# Follow logs during startup (optional prompt)
# Or view logs separately:
./scripts/logs-dev.sh
```

### Log Management:

```bash
# Development logs (interactive)
./scripts/logs-dev.sh

# Production logs (interactive)
./scripts/logs-prod.sh

# Direct commands:
docker-compose logs -f                    # All services
docker-compose logs -f server            # Server only
docker-compose logs -f client            # Client only
docker-compose logs -f redis             # Redis only
```

### Environment Configuration:

```bash
# Example .env for development with external DB
DATABASE_URL=postgresql://user:pass@your-db-host:5432/your_db
REDIS_URL=redis://localhost:6379
TMDB_API_KEY=your_tmdb_key
GOOGLE_CLIENT_ID=your_google_client_id
# ... other variables
```

### Troubleshooting:

```bash
# Check service status
docker-compose ps

# Restart specific service
docker-compose restart server

# Rebuild with latest changes
docker-compose up --build -d

# View container resource usage
docker stats
```

---

## Git Commit Message

```
fix(docker): resolve development dependencies and add interactive logs

• create Dockerfile.dev for development with nodemon support
• fix server container failing to start due to missing dev dependencies
• add interactive log following to dev.sh and prod.sh scripts
• create dedicated log viewer scripts for dev and prod environments
• update docker-compose to use external DATABASE_URL and REDIS_URL
• add service-specific log viewing capabilities
• improve environment variable documentation in env.example

The development environment now properly supports hot reloading with nodemon
and provides convenient log management through interactive scripts.
```
