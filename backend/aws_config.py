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

class AWSConfig:
    """AWS Configuration Manager"""
    
    def __init__(self):
        self.region = os.getenv(AWS_REGION_ENV, "us-east-1")
        self.bedrock_client = None
        self.is_configured = False
        
    def validate_credentials(self) -> bool:
        """Validate AWS credentials are present and accessible"""
        try:
            # Use default credential chain (includes ~/.aws/credentials and ~/.aws/config)
            session = boto3.Session()
            creds = session.get_credentials()
            
            if creds is None:
                logger.error("AWS credentials not found in default chain!")
                logger.error("Please ensure credentials are configured in one of:")
                logger.error("  - ~/.aws/credentials file")
                logger.error("  - ~/.aws/config file")
                logger.error("  - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)")
                logger.error("  - IAM role (for EC2/ECS/Lambda)")
                logger.error("  - AWS CLI: run 'aws configure' to set up credentials")
                return False
                
            logger.info(f"✅ AWS credentials found from default chain")
            logger.info(f"Using AWS region: {self.region}")
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
            
            # Create Bedrock client using default credential chain
            self.bedrock_client = boto3.client(
                "bedrock-runtime",
                region_name=self.region
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
            """
            Best-effort Bedrock availability check.
            Uses the control-plane list_foundation_models only if supported.
            Does NOT fail if unavailable (for BedrockRuntime-only credentials).
            """
            try:
                control = boto3.client("bedrock", region_name=self.region)
                if hasattr(control, "list_foundation_models"):
                    control.list_foundation_models()
                    logger.info("✅ Bedrock control plane reachable")
                else:
                    logger.info("ℹ️ Bedrock control client does not support list_foundation_models; skipping test")
                return True
            except Exception as e:
                logger.warning(f"⚠️ Skipping Bedrock control-plane check: {e}")
                # Don’t fail — runtime will still work
                return True

    
    def get_bedrock_client(self) -> Optional[boto3.client]:
        """Get Bedrock client (creates if not already initialized)"""
        if not self.is_configured:
            return self.setup_bedrock_client()
        return self.bedrock_client
    
    def get_aws_info(self) -> Dict[str, Any]:
        """Get AWS configuration info for debugging"""
        client_ready = self.bedrock_client is not None
        # Keep flags consistent: if client is ready, consider configured
        self.is_configured = self.is_configured or client_ready
        return {
            "region": self.region,
            # Credential presence is managed by the default chain; do not expose keys
            "has_access_key": None,
            "has_secret_key": None,
            "is_configured": self.is_configured,
            "client_ready": client_ready
        }
    
    def print_config_status(self):
        """Print AWS configuration status"""
        info = self.get_aws_info()
        logger.info("🔧 AWS Configuration Status:")
        logger.info(f"  Region: {info['region']}")
        logger.info("  Credentials: using default AWS credential chain")
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
