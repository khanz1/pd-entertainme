# Fix Database Connection for Docker Services

## What Was Changed, Fixed, or Added

### Fixed Issues:

- **Database Connection Error**: Server was trying to connect to `localhost:5432` instead of Docker PostgreSQL service
- **Missing Service Dependencies**: Server wasn't waiting for PostgreSQL to be ready
- **Environment File Handling**: Simplified environment variable management in development script

### Key Changes Made:

#### Docker Compose (`docker-compose.yml`):

- **Fixed DATABASE_URL**: Changed from `localhost:5432` to `postgres:5432` (Docker service name)
- **Added PostgreSQL Dependency**: Server now depends on both `postgres` and `redis` services with health checks
- **Simplified Environment Variables**: Moved from separate `.env.development` files to inline environment variables
- **Correct Service Network**: All services now communicate using Docker service names

#### Development Script (`scripts/dev.sh`):

- **Simplified Environment Setup**: Removed complex client/server specific `.env.development` handling
- **Single Environment File**: Now uses root `.env` file for external configuration
- **Added Wait Time**: Gives services time to start up properly

#### Configuration Updates:

- **Database URL**: `postgresql://postgres:postgres@postgres:5432/postgres`
- **Redis URL**: `redis://redis:6379`
- **Service Communication**: All internal services use Docker service names
- **External Variables**: API keys and external configurations still come from environment

## Pros and Cons

### Pros:

- **Fixed Connection Issues**: Server can now properly connect to PostgreSQL container
- **Proper Service Dependencies**: Server waits for database to be healthy before starting
- **Simplified Configuration**: Less complex environment file management
- **Container Networking**: Proper Docker internal networking between services
- **Development Stability**: Services start in correct order with health checks

### Cons:

- **Less Flexibility**: Harder to use external databases in development
- **Embedded Configuration**: Some settings are now hardcoded in docker-compose.yml
- **Environment Management**: Need to manage both inline and external environment variables

## Potential Issues and Fixes

### Issue 1: Database Schema Missing

**Problem**: PostgreSQL container starts fresh without your database schema
**Solution**:

```bash
# Connect to PostgreSQL container and create schema
docker-compose exec postgres psql -U postgres -d postgres
# Run your SQL migrations or schema setup
```

### Issue 2: Data Persistence

**Problem**: Database data might be lost when containers restart
**Solution**: Database data is persisted in `postgres_data` volume - data will survive container restarts

### Issue 3: Port Conflicts

**Problem**: Local PostgreSQL might conflict with Docker PostgreSQL on port 5432
**Solution**:

- Stop local PostgreSQL: `brew services stop postgresql` (on macOS)
- Or change port mapping in docker-compose.yml

### Issue 4: Slow Startup

**Problem**: Services might not be ready when script finishes
**Solution**: The script now waits 10 seconds and checks health status

## Quick Start Guide

### Fixed Development Setup:

```bash
# Create environment file
cp env.example .env
# Edit .env with your external API keys (TMDB, Google OAuth, etc.)

# Start development environment (now works!)
./scripts/dev.sh

# Check if all services are running
docker-compose ps

# View logs if issues persist
docker-compose logs -f server
```

### Database Connection Test:

```bash
# Test PostgreSQL connection
docker-compose exec postgres psql -U postgres -d postgres -c "SELECT version();"

# Test Redis connection
docker-compose exec redis redis-cli ping

# Check server logs
docker-compose logs server
```

### Environment Variables:

The server now uses these Docker-internal URLs:

- **Database**: `postgresql://postgres:postgres@postgres:5432/postgres`
- **Redis**: `redis://redis:6379`

External APIs still use environment variables:

- `TMDB_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- etc.

### Troubleshooting:

```bash
# Restart services in correct order
docker-compose down
./scripts/dev.sh

# Check service health
docker-compose ps

# View detailed logs
docker-compose logs -f

# Reset everything (if needed)
docker-compose down -v  # This removes data volumes too!
```

---

## Git Commit Message

```
fix(docker): resolve database connection using docker service names

• fix DATABASE_URL to use postgres service name instead of localhost
• add postgres dependency with health check to server service
• simplify environment variable management in docker-compose
• update development script to use single root .env file
• ensure proper service startup order with health checks
• configure redis and postgres URLs for docker internal networking

The server can now properly connect to the PostgreSQL container instead of
trying to reach localhost which was causing connection refused errors.
```
