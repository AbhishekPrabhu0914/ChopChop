#!/usr/bin/env python3
"""
AWS Configuration Module for ChopChop Backend
Handles AWS credentials setup and validation before each run
"""

import os
import boto3
import logging
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Environment variable names
AWS_REGION_ENV = "AWS_REGION"
AWS_ACCESS_KEY_ID_ENV = "AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY_ENV = "AWS_SECRET_ACCESS_KEY"

class AWSConfig:
    """AWS Configuration Manager"""
    
    def __init__(self):
        self.region = os.getenv(AWS_REGION_ENV, "us-east-1")
        self.access_key_id = os.getenv(AWS_ACCESS_KEY_ID_ENV)
        self.secret_access_key = os.getenv(AWS_SECRET_ACCESS_KEY_ENV)
        self.bedrock_client = None
        self.is_configured = False
        
    def validate_credentials(self) -> bool:
        """Validate AWS credentials are present and accessible"""
        try:
            if not self.access_key_id or not self.secret_access_key:
                logger.error("AWS credentials not found!")
                logger.error("Required environment variables:")
                logger.error(f"  - {AWS_ACCESS_KEY_ID_ENV}")
                logger.error(f"  - {AWS_SECRET_ACCESS_KEY_ENV}")
                logger.error(f"  - {AWS_REGION_ENV} (optional, defaults to us-east-1)")
                return False
                
            logger.info(f"AWS credentials found for region: {self.region}")
            return True
            
        except Exception as e:
            logger.error(f"Error validating AWS credentials: {e}")
            return False
    
    def setup_bedrock_client(self) -> Optional[boto3.client]:
        """Setup and return Bedrock client"""
        try:
            if not self.validate_credentials():
                return None
                
            logger.info("Initializing AWS Bedrock client...")
            
            # Create Bedrock client with explicit credentials
            self.bedrock_client = boto3.client(
                "bedrock-runtime",
                region_name=self.region,
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key
            )
            
            # Test the client with a simple operation
            self._test_bedrock_access()
            
            logger.info("✅ AWS Bedrock client initialized successfully")
            self.is_configured = True
            return self.bedrock_client
            
        except NoCredentialsError:
            logger.error("❌ AWS credentials not found or invalid")
            logger.error(f"Please set {AWS_ACCESS_KEY_ID_ENV} and {AWS_SECRET_ACCESS_KEY_ENV} environment variables")
            return None
            
        except ClientError as e:
            logger.error(f"❌ AWS client error: {e}")
            logger.error("Please check your AWS credentials and permissions")
            return None
            
        except Exception as e:
            logger.error(f"❌ Unexpected error initializing AWS client: {e}")
            return None
    
    def _test_bedrock_access(self) -> bool:
        """Test Bedrock access with a simple operation"""
        try:
            # Try to list foundation models (this is a read-only operation)
            response = self.bedrock_client.list_foundation_models()
            logger.info(f"✅ Bedrock access verified. Found {len(response.get('modelSummaries', []))} models")
            return True
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'AccessDeniedException':
                logger.warning("⚠️  Bedrock access limited (AccessDenied) - this may be normal for some regions")
                logger.info("✅ Bedrock client created successfully (access will be tested on first model call)")
                return True
            else:
                logger.error(f"❌ Bedrock access test failed: {e}")
                raise e
                
        except Exception as e:
            logger.error(f"❌ Bedrock access test failed: {e}")
            raise e
    
    def get_bedrock_client(self) -> Optional[boto3.client]:
        """Get Bedrock client (creates if not already initialized)"""
        if not self.is_configured:
            return self.setup_bedrock_client()
        return self.bedrock_client
    
    def get_aws_info(self) -> Dict[str, Any]:
        """Get AWS configuration info for debugging"""
        return {
            "region": self.region,
            "has_access_key": bool(self.access_key_id),
            "has_secret_key": bool(self.secret_access_key),
            "is_configured": self.is_configured,
            "client_ready": self.bedrock_client is not None
        }
    
    def print_config_status(self):
        """Print AWS configuration status"""
        info = self.get_aws_info()
        logger.info("🔧 AWS Configuration Status:")
        logger.info(f"  Region: {info['region']}")
        logger.info(f"  Access Key: {'✅ Set' if info['has_access_key'] else '❌ Missing'}")
        logger.info(f"  Secret Key: {'✅ Set' if info['has_secret_key'] else '❌ Missing'}")
        logger.info(f"  Configured: {'✅ Yes' if info['is_configured'] else '❌ No'}")
        logger.info(f"  Client Ready: {'✅ Yes' if info['client_ready'] else '❌ No'}")

# Global AWS configuration instance
aws_config = AWSConfig()

def get_bedrock_client():
    """Get configured Bedrock client"""
    return aws_config.get_bedrock_client()

def setup_aws():
    """Setup AWS configuration (call this at startup)"""
    logger.info("🚀 Setting up AWS configuration...")
    aws_config.print_config_status()
    
    client = aws_config.setup_bedrock_client()
    if client:
        logger.info("✅ AWS setup completed successfully")
        return True
    else:
        logger.error("❌ AWS setup failed")
        return False

def check_aws_status():
    """Check AWS configuration status"""
    return aws_config.get_aws_info()

if __name__ == "__main__":
    # Test the configuration
    logging.basicConfig(level=logging.INFO)
    setup_aws()
