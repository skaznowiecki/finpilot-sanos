#!/bin/bash

# Deploy frontend to S3 and invalidate CloudFront cache
# Usage: ./deploy.sh [environment]

set -e

# Start timing
DEPLOY_START_TIME=$(date +%s)

# Cleanup function for unexpected exits
cleanup_on_exit() {
    if [ -f ".env.backup" ]; then
        echo
        log_warn "Script interrupted - restoring local environment..."
        mv .env.backup .env 2>/dev/null || true
        log_info "Local development environment restored"
    fi
}

# Set trap to ensure cleanup on exit
trap cleanup_on_exit EXIT

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="657846272473"
AWS_PROFILE="finpilot"
DOMAIN="finpilot.ar"
SUBDOMAIN="sanos"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
S3_BUCKET="${FULL_DOMAIN}"
BUILD_DIR="dist"
CLOUDFRONT_DISTRIBUTION_ID="E2N4HD4ZL93Z1N"

# Parse arguments
ENVIRONMENT=${1:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to format elapsed time
format_elapsed_time() {
    local elapsed=$1
    local hours=$((elapsed / 3600))
    local minutes=$(((elapsed % 3600) / 60))
    local seconds=$((elapsed % 60))
    
    if [ $hours -gt 0 ]; then
        printf "%dh %dm %ds" $hours $minutes $seconds
    elif [ $minutes -gt 0 ]; then
        printf "%dm %ds" $minutes $seconds
    else
        printf "%ds" $seconds
    fi
}

# Function to show elapsed time
show_elapsed_time() {
    local current_time=$(date +%s)
    local elapsed=$((current_time - DEPLOY_START_TIME))
    log_info "⏱️  Elapsed time: $(format_elapsed_time $elapsed)"
}

# Function to check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Node.js and npm
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    log_info "All dependencies are installed"
}

# Function to check if AWS CLI is configured
check_aws_config() {
    log_info "Checking AWS configuration with profile: ${AWS_PROFILE}..."
    aws sts get-caller-identity --profile "${AWS_PROFILE}" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        log_error "AWS CLI not configured for profile '${AWS_PROFILE}'. Please check your AWS configuration."
        exit 1
    fi
    
    # Check if we have access to the S3 bucket
    aws s3 ls "s3://${S3_BUCKET}" --profile "${AWS_PROFILE}" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        log_error "Cannot access S3 bucket: ${S3_BUCKET}"
        log_error "Please check your AWS permissions for profile '${AWS_PROFILE}'."
        exit 1
    fi
    
    log_info "AWS CLI configured and S3 bucket accessible with profile: ${AWS_PROFILE}"
}

# Function to install dependencies
install_dependencies() {
    log_step "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        log_info "node_modules not found, installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            log_error "Failed to install dependencies"
            exit 1
        fi
    else
        log_info "Dependencies already installed, skipping..."
    fi
    
    log_info "Dependencies ready"
    show_elapsed_time
}

# Function to build the frontend
build_frontend() {
    log_step "Building frontend application..."
    
    # Clean previous build
    if [ -d "${BUILD_DIR}" ]; then
        log_info "Cleaning previous build..."
        rm -rf "${BUILD_DIR}"
    fi
    
    # Setup environment file for production
    if [ -f ".env.prod" ]; then
        # Save current .env file if it exists (for local development)
        if [ -f ".env" ]; then
            log_info "Backing up current .env file for local development..."
            cp .env .env.backup
            if [ $? -ne 0 ]; then
                log_error "Failed to backup current .env file"
                exit 1
            fi
            log_info "Current .env file backed up as .env.backup"
        fi
        
        log_info "Found .env.prod file, copying to .env for build..."
        cp .env.prod .env
        if [ $? -ne 0 ]; then
            log_error "Failed to copy .env.prod to .env"
            exit 1
        fi
        log_info "Production environment variables configured"
    else
        log_warn ".env.prod file not found, building with current environment settings"
    fi
    
    # Build the application
    log_info "Running build command..."
    npm run build
    if [ $? -ne 0 ]; then
        log_error "Failed to build frontend application"
        exit 1
    fi
    
    # Clean up environment file after build (restore will happen at the end)
    if [ -f ".env.prod" ]; then
        log_info "Build completed with production environment variables"
    fi
    
    # Verify build output
    if [ ! -d "${BUILD_DIR}" ]; then
        log_error "Build directory ${BUILD_DIR} not found after build"
        exit 1
    fi
    
    # Check if index.html exists
    if [ ! -f "${BUILD_DIR}/index.html" ]; then
        log_error "index.html not found in build directory"
        exit 1
    fi
    
    log_info "Frontend application built successfully"
    show_elapsed_time
}

# Function to sync files to S3
sync_to_s3() {
    log_step "Uploading files to S3..."
    
    log_info "Syncing files to s3://${S3_BUCKET}/"
    
    # Sync files to S3 with appropriate cache headers
    aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" \
        --profile "${AWS_PROFILE}" \
        --region "${AWS_REGION}" \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "*.html" \
        --exclude "*.json"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to sync static assets to S3"
        exit 1
    fi
    
    # Upload HTML files with shorter cache (for SPA routing)
    aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" \
        --profile "${AWS_PROFILE}" \
        --region "${AWS_REGION}" \
        --cache-control "max-age=300" \
        --include "*.html"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to sync HTML files to S3"
        exit 1
    fi
    
    # Upload JSON files with shorter cache
    aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" \
        --profile "${AWS_PROFILE}" \
        --region "${AWS_REGION}" \
        --cache-control "max-age=300" \
        --include "*.json"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to sync JSON files to S3"
        exit 1
    fi
    
    log_info "Files uploaded successfully to S3"
    show_elapsed_time
}

# Function to set CloudFront distribution ID
get_distribution_id() {
    log_info "Using CloudFront distribution ID: ${CLOUDFRONT_DISTRIBUTION_ID}"
    DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID}"
}

# Function to invalidate CloudFront cache
invalidate_cloudfront() {
    log_step "Invalidating CloudFront cache..."
    
    get_distribution_id
    
    log_info "Creating cache invalidation for distribution: ${DISTRIBUTION_ID}"
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --profile "${AWS_PROFILE}" \
        --distribution-id "${DISTRIBUTION_ID}" \
        --paths "/*" \
        --region "${AWS_REGION}" \
        --query "Invalidation.Id" \
        --output text)
    
    if [ $? -ne 0 ]; then
        log_error "Failed to create CloudFront invalidation"
        exit 1
    fi
    
    log_info "Cache invalidation created: ${INVALIDATION_ID}"
    log_info "It may take a few minutes for the cache to be fully invalidated"
    show_elapsed_time
}

# Function to restore local environment file
restore_environment() {
    log_step "Restoring local development environment..."
    
    if [ -f ".env.backup" ]; then
        log_info "Restoring original .env file for local development..."
        mv .env.backup .env
        if [ $? -ne 0 ]; then
            log_error "Failed to restore .env file from backup"
            log_warn "Your original .env file is saved as .env.backup"
            return 1
        fi
        log_info "Local development environment restored successfully"
        # Clear the trap since we've successfully restored
        trap - EXIT
    elif [ -f ".env.prod" ] && [ -f ".env" ]; then
        log_info "Removing production .env file (no local backup found)..."
        rm -f .env
        log_info "Production .env file removed"
        # Clear the trap since cleanup is done
        trap - EXIT
    else
        log_info "No environment restoration needed"
        # Clear the trap since no restoration was needed
        trap - EXIT
    fi
}

# Function to show deployment summary
show_summary() {
    log_step "Deployment Summary"
    echo
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo
    echo "📦 Build Directory: ${BUILD_DIR}"
    echo "🗂️  S3 Bucket: s3://${S3_BUCKET}"
    echo "🌐 CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
    echo "🔗 Website URL: https://${FULL_DOMAIN}"
    echo
    echo -e "${YELLOW}Note: CloudFront cache invalidation may take 5-15 minutes to complete.${NC}"
    echo
}

# Main execution
main() {
    echo
    log_info "🚀 Starting frontend deployment process..."
    log_info "⏰ Start time: $(date '+%Y-%m-%d %H:%M:%S')"
    log_info "Environment: ${ENVIRONMENT}"
    log_info "AWS Profile: ${AWS_PROFILE}"
    log_info "Domain: ${FULL_DOMAIN}"
    log_info "S3 Bucket: ${S3_BUCKET}"
    log_info "CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
    echo
    
    check_dependencies
    check_aws_config
    install_dependencies
    build_frontend
    sync_to_s3
    invalidate_cloudfront
    restore_environment
    show_summary
    
    # Calculate and display total deployment time
    DEPLOY_END_TIME=$(date +%s)
    TOTAL_ELAPSED=$((DEPLOY_END_TIME - DEPLOY_START_TIME))
    echo
    log_info "🏁 Total deployment time: $(format_elapsed_time $TOTAL_ELAPSED)"
    log_info "⏰ End time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo
    log_info "🎉 Frontend deployment completed successfully!"
}

# Run main function
main