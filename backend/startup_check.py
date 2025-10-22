#!/usr/bin/env python3
"""
ChopChop Backend Startup Script
Ensures AWS configuration is properly set up before starting the server
"""

import os
import sys
import logging
from aws_config import setup_aws, check_aws_status

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main startup function"""
    logger.info("🚀 ChopChop Backend Startup Script")
    logger.info("=" * 50)
    
    # Check environment variables
    logger.info("📋 Checking environment variables...")
    required_vars = [
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY", 
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
        else:
            logger.info(f"  ✅ {var}: Set")
    
    if missing_vars:
        logger.error("❌ Missing required environment variables:")
        for var in missing_vars:
            logger.error(f"  - {var}")
        logger.error("\nPlease set these environment variables in your deployment platform.")
        sys.exit(1)
    
    # Setup AWS
    logger.info("\n🔧 Setting up AWS configuration...")
    aws_success = setup_aws()
    
    if not aws_success:
        logger.error("❌ AWS setup failed!")
        logger.error("Please check your AWS credentials and permissions.")
        logger.error("The server will start but Bedrock features will be disabled.")
    else:
        logger.info("✅ AWS setup completed successfully!")
    
    # Print final status
    logger.info("\n📊 Final Configuration Status:")
    aws_status = check_aws_status()
    logger.info(f"  AWS Region: {aws_status['region']}")
    logger.info(f"  AWS Configured: {'✅ Yes' if aws_status['is_configured'] else '❌ No'}")
    logger.info(f"  AWS Client Ready: {'✅ Yes' if aws_status['client_ready'] else '❌ No'}")
    
    logger.info("\n🎉 Startup checks completed!")
    logger.info("=" * 50)

if __name__ == "__main__":
    main()
