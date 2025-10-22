#!/bin/bash

# ChopChop Backend Startup Script
# This script sets up the environment and starts the backend server

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

# Check if virtual environment exists
if [ -d "../venv" ]; then
    print_status "Activating virtual environment..."
    source ../venv/bin/activate
    print_success "Virtual environment activated"
else
    print_warning "No virtual environment found. Using system Python."
fi

# Check if requirements are installed
print_status "Checking Python dependencies..."
if python3 -c "import flask, boto3, supabase" 2>/dev/null; then
    print_success "Required dependencies are installed"
else
    print_status "Installing dependencies from requirements.txt..."
    pip install -r requirements.txt
    print_success "Dependencies installed"
fi

# Check environment variables
print_status "Checking environment variables..."

# Required environment variables
REQUIRED_VARS=(
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

# Optional environment variables with defaults
AWS_REGION=${AWS_REGION:-"us-east-1"}
FLASK_DEBUG=${FLASK_DEBUG:-"false"}
PORT=${PORT:-"5000"}

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
    print_error "  export AWS_ACCESS_KEY_ID='your-access-key'"
    print_error "  export AWS_SECRET_ACCESS_KEY='your-secret-key'"
    print_error "  export SUPABASE_URL='your-supabase-url'"
    print_error "  export SUPABASE_SERVICE_ROLE_KEY='your-supabase-key'"
    print_error ""
    print_error "Optional variables:"
    print_error "  export AWS_REGION='us-east-1'  # Default: us-east-1"
    print_error "  export FLASK_DEBUG='false'     # Default: false"
    print_error "  export PORT='5000'             # Default: 5000"
    exit 1
fi

print_success "All required environment variables are set"

# Run startup check
print_status "Running startup checks..."
if python3 startup_check.py; then
    print_success "Startup checks passed"
else
    print_error "Startup checks failed"
    exit 1
fi

# Start the server
print_status "Starting ChopChop backend server..."
print_status "Server will be available at: http://localhost:$PORT"
print_status "Press Ctrl+C to stop the server"
echo ""

# Start the Flask application
if [ "$FLASK_DEBUG" = "true" ]; then
    print_status "Starting in DEBUG mode..."
    python3 nova_backend.py
else
    print_status "Starting in PRODUCTION mode..."
    # Use gunicorn for production
    if command -v gunicorn &> /dev/null; then
        gunicorn -w 2 -k gthread -b 0.0.0.0:$PORT nova_backend:app
    else
        print_warning "Gunicorn not found, installing..."
        pip install gunicorn
        gunicorn -w 2 -k gthread -b 0.0.0.0:$PORT nova_backend:app
    fi
fi
