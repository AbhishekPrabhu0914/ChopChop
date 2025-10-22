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


print_status "Python version: $(python3 --version)"

# Set default values
export AWS_REGION=${AWS_REGION:-"us-east-1"}
export FLASK_DEBUG=${FLASK_DEBUG:-"false"}
export PORT=${PORT:-"5000"}

# Export environment variables explicitly (do not override platform-provided values)
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

# Check if .env file exists in parent directory
if [ -f "../.env" ]; then
    print_status "Loading environment variables from ../.env"
    set -a  # automatically export all variables
    source ../.env
    set +a  # stop automatically exporting
    print_success "Environment variables loaded from .env file"
elif [ -f ".env" ]; then
    print_status "Loading environment variables from .env"
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
    print_success "Environment variables loaded from .env file"
else
    print_warning "No .env file found. Using system environment variables."
fi

# Check required environment variables
print_status "Checking required environment variables..."

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        print_success "$var: Set"
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        print_error "  - $var"
    done
    print_error ""
    print_error "Please set these environment variables:"
    print_error "  export AWS_ACCESS_KEY_ID=your-access-key"
    print_error "  export AWS_SECRET_ACCESS_KEY=your-secret-key"
    print_error "  export SUPABASE_URL=your-supabase-url"
    print_error "  export SUPABASE_SERVICE_ROLE_KEY=your-supabase-key"
    print_error "  export AWS_REGION=us-east-1"
    print_error "  export FLASK_DEBUG=false"
    print_error "  export PORT=5000"
    print_error ""
    print_error "Or create a .env file in the project root with:"
    print_error "  AWS_ACCESS_KEY_ID=your-access-key"
    print_error "  AWS_SECRET_ACCESS_KEY=your-secret-key"
    print_error "  SUPABASE_URL=your-supabase-url"
    print_error "  SUPABASE_SERVICE_ROLE_KEY=your-supabase-key"
    print_error "  AWS_REGION=us-east-1"
    print_error "  FLASK_DEBUG=false"
    print_error "  PORT=5000"
    exit 1
fi

print_success "All required environment variables are set"

# Install dependencies if needed
print_status "Checking Python dependencies..."
if python3 -c "import flask, boto3, supabase" 2>/dev/null; then
    print_success "Required dependencies are installed"
else
    print_status "Installing dependencies from requirements.txt..."
    pip install -r requirements.txt
    print_success "Dependencies installed"
fi

# Start the server
print_status "Starting ChopChop backend server..."
print_status "Server will be available at: http://localhost:$PORT"
print_status "Press Ctrl+C to stop the server"
echo ""

# Start the Flask application
print_status "Starting nova_backend.py..."
python3 nova_backend.py
