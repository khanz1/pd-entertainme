# 29 - Update GitHub Actions Production Deployment (Corrected)

## Overview

Updated the GitHub Actions deployment workflow to use existing production files (`prod.sh` and `docker-compose.prod.yml`) instead of recreating them, ensuring consistency between local and CI/CD deployment processes.

## Changes Made

### Updated Deployment Strategy:

- **Use Existing Scripts**: Modified to use existing `prod.sh` and `docker-compose.prod.yml` instead of recreating them
- **File Transfer**: Added SCP action to copy deployment files from repository to EC2
- **Script Execution**: Uses existing production deployment script for consistency
- **Image Override**: Dynamically updates docker-compose to use pre-built images from Docker Hub
- **Port Alignment**: Maintains port 8022 configuration from existing docker-compose.prod.yml

### Files Modified:

- `.github/workflows/deploy.yml` - Updated to use existing production files and scripts

## Technical Details

### New Deployment Process:

#### Build Phase (unchanged):

1. Checkout code from production branch
2. Setup Node.js 22.x for testing
3. Install dependencies with legacy peer deps
4. Login to Docker Hub
5. Build and push server image with SHA tag

#### Deploy Phase (improved):

1. **Copy Files**: Use SCP to transfer `docker-compose.prod.yml` and `scripts/prod.sh` from repository to EC2
2. **Setup Environment**: Create production environment file from GitHub secrets
3. **Modify Docker Compose**: Use `sed` commands to replace build configuration with pre-built image
4. **Execute Production Script**: Run the existing `prod.sh` script
5. **Health Checks**: Perform additional health verification after deployment

### Key Improvements:

#### File Consistency:

- Uses actual `docker-compose.prod.yml` from repository
- Uses actual `prod.sh` script from repository
- No duplication or recreation of configuration files
- Ensures local and CI/CD environments use identical configurations

#### Dynamic Image Configuration:

```bash
# Replace build configuration with image reference
sed -i 's|build:|# build:|g' ~/app/docker-compose.prod.yml
sed -i 's|context: ./server|# context: ./server|g' ~/app/docker-compose.prod.yml
sed -i 's|dockerfile: Dockerfile|# dockerfile: Dockerfile|g' ~/app/docker-compose.prod.yml

# Add pre-built image reference
sed -i '/# Server (API)/a\    image: USERNAME/pd-entertainme-server:SHA' ~/app/docker-compose.prod.yml
```

#### Production Script Execution:

- Copies and executes the actual `prod.sh` script
- Maintains all existing functionality and output formatting
- Ensures consistent deployment behavior
- Leverages existing error handling and service management

### Configuration Changes:

#### GitHub Actions Workflow:

1. **Added SCP Step**:

   ```yaml
   - name: Copy deployment files
     uses: appleboy/scp-action@v0.1.7
     with:
       source: "docker-compose.prod.yml,scripts/prod.sh"
       target: "~/app/"
   ```

2. **Modified SSH Step**:
   - Removed file creation logic
   - Added sed commands for image configuration
   - Kept existing health checks
   - Added production script execution

#### File Transfer Pattern:

- `docker-compose.prod.yml` → `~/app/docker-compose.prod.yml`
- `scripts/prod.sh` → `~/app/scripts/prod.sh`
- Environment file created from GitHub secrets

### Deployment Flow:

#### Steps:

1. Build and push Docker image with SHA tag
2. Copy production files via SCP
3. SSH into EC2 and:
   - Create environment file
   - Modify docker-compose to use pre-built image
   - Make prod.sh executable
   - Pull the specific image
   - Execute `./scripts/prod.sh`
   - Wait for services to stabilize
   - Perform health checks
   - Display final status

#### Benefits:

- **Consistency**: Same files used locally and in CI/CD
- **Maintainability**: Single source of truth for production configuration
- **Reliability**: Proven production scripts and configurations
- **Simplicity**: No duplication of configuration logic

## Pros

### Configuration Management:

- **Single Source**: Production files maintained in one place
- **Version Control**: All production configurations tracked in git
- **Consistency**: Local and CI/CD use identical files
- **Maintainability**: Changes only need to be made once

### Deployment Reliability:

- **Tested Scripts**: Uses proven production deployment scripts
- **Error Handling**: Inherits existing error handling from prod.sh
- **Service Management**: Proper service lifecycle management
- **Monitoring**: Consistent logging and status reporting

### Development Experience:

- **Local Testing**: Can test exact production deployment locally
- **Debugging**: Same environment and scripts for troubleshooting
- **Updates**: Easy to update production configuration
- **Validation**: Changes can be validated locally before deployment

## Cons

### Complexity:

- **File Transfer**: Additional SCP step required
- **Dynamic Modification**: sed commands to modify docker-compose
- **Dependencies**: Requires both SCP and SSH actions

### Maintenance:

- **Script Dependencies**: Changes to prod.sh affect CI/CD
- **File Paths**: Must maintain correct file paths in SCP
- **Image Configuration**: sed commands need maintenance if docker-compose structure changes

## Potential Issues

### Issue 1: SCP Transfer Failures

**Problem**: Network issues or permission problems during file transfer
**Solution**:

- Add retry logic to SCP action
- Verify file permissions and paths
- Add error handling for transfer failures

### Issue 2: sed Command Failures

**Problem**: Docker compose structure changes breaking sed patterns
**Solution**:

- Use more robust sed patterns
- Add validation after sed modifications
- Consider using yq or other YAML tools for modifications

### Issue 3: Script Path Issues

**Problem**: Incorrect paths to prod.sh or docker-compose files
**Solution**:

- Verify file structure consistency
- Use absolute paths where possible
- Add file existence checks before execution

### Issue 4: Environment Variable Conflicts

**Problem**: Conflicts between GitHub secrets and script expectations
**Solution**:

- Document required environment variables
- Add validation in prod.sh script
- Use consistent naming conventions

## Migration Guide

### For Existing Deployments:

1. **Verify Files**: Ensure `docker-compose.prod.yml` and `scripts/prod.sh` exist in repository
2. **Test Locally**: Run `scripts/prod.sh` locally to verify functionality
3. **Update Secrets**: Ensure all GitHub secrets are properly configured
4. **Deploy Gradually**: Test deployment in staging environment first
5. **Monitor**: Watch deployment logs for any file transfer or execution issues

### Required Repository Structure:

```
project-root/
├── docker-compose.prod.yml
├── scripts/
│   └── prod.sh
└── .github/
    └── workflows/
        └── deploy.yml
```

## Git Commit Message

```
feat(deploy): use existing prod.sh and docker-compose files

• add SCP action to copy production files from repository
• modify docker-compose dynamically to use pre-built images
• execute existing prod.sh script for consistent deployment
• remove duplication of production configuration
• ensure local and CI/CD environments use identical files
• maintain existing error handling and service management

BREAKING CHANGE: deployment now requires docker-compose.prod.yml and
scripts/prod.sh files to exist in repository
```
