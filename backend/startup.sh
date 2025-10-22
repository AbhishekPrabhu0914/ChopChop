#!/bin/bash

# ChopChop Backend Startup Script
# This script loads environment variables and starts the backend server

set -e  # Exit on any error

echo "🚀 ChopChop Backend Startup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the backend directory
if [ ! -f "nova_backend.py" ]; then
    print_error "This script must be run from the backend directory"
    print_error "Please cd to the backend directory and run: ./startup.sh"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed or not in PATH"
    exit 1
fi

print_status "Python version: $(python3 --version)"

# Check if virtual environment exists and activate it
if [ -d "../venv" ]; then
    print_status "Activating virtual environment..."
    source ../venv/bin/activate
    print_success "Virtual environment activated"
else
    print_warning "No virtual environment found. Using system Python."
fi

# Load environment variables
print_status "Loading environment variables..."

# Set default values
export AWS_REGION=${AWS_REGION:-"us-east-1"}
export FLASK_DEBUG=${FLASK_DEBUG:-"false"}
export PORT=${PORT:-"5000"}

# Export environment variables explicitly
print_status "Setting up environment variables..."

# AWS Configuration
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-""}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-""}
export AWS_REGION=${AWS_REGION:-"us-east-1"}

# Supabase Configuration
export SUPABASE_URL=${SUPABASE_URL:-""}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-""}

# Flask Configuration
export FLASK_DEBUG=${FLASK_DEBUG:-"false"}
export PORT=${PORT:-"5000"}


python3 nova_backend.py
