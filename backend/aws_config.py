#!/usr/bin/env python3
"""
AWS Configuration Module for ChopChop Backend
Render-safe version: supports lazy initialization and Bedrock (Nova) runtime client.
"""

import os
import boto3
import logging
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional, Dict, Any

# -------------------------------------------------------------------
# Logging setup
# -------------------------------------------------------------------
logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

# -------------------------------------------------------------------
# AWS Configuration Class
# -------------------------------------------------------------------
class AWSConfig:
    """Manages AWS Bedrock Runtime (for Nova models)."""

    def __init__(self):
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.bedrock_client: Optional[boto3.client] = None
        self.is_configured: bool = False

    # ---------------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------------
    def _has_valid_env(self) -> bool:
        """Check whether required environment variables exist."""
        has_id = bool(os.getenv("AWS_ACCESS_KEY_ID"))
        has_secret = bool(os.getenv("AWS_SECRET_ACCESS_KEY"))
        if not has_id or not has_secret:
            logger.warning("⚠️ Missing AWS credentials in environment variables.")
        return has_id and has_secret

    def _create_runtime_client(self) -> Optional[boto3.client]:
        """Create and return a Bedrock Runtime client explicitly using env vars."""
        try:
            logger.info(f"🧠 Creating Bedrock Runtime client in region {self.region} ...")
            client = boto3.client(
                "bedrock-runtime",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=self.region,
            )

            # Verify that the client supports .converse()
            if not hasattr(client, "converse"):
                logger.warning(
                    "⚠️ Your boto3 version may not support .converse(); "
                    "upgrade to boto3>=1.35.0, botocore>=1.35.0"
                )

            logger.info("✅ Bedrock Runtime client created successfully.")
            return client

        except NoCredentialsError:
            logger.error("❌ AWS credentials not found or invalid.")
            return None
        except ClientError as e:
            logger.error(f"❌ AWS client error: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected error creating Bedrock client: {e}", exc_info=True)
            return None

    # ---------------------------------------------------------------
    # Public interface
    # ---------------------------------------------------------------
    def setup_bedrock_client(self) -> Optional[boto3.client]:
        """Initialize and store the Bedrock runtime client."""
        if not self._has_valid_env():
            logger.warning("⚠️ AWS credentials not available; skipping initial Bedrock setup.")
            return None

        client = self._create_runtime_client()
        if client:
            self.bedrock_client = client
            self.is_configured = True
            return client
        else:
            logger.warning("⚠️ Bedrock client setup failed; will retry lazily later.")
            return None

    def get_bedrock_client(self) -> Optional[boto3.client]:
        """
        Return an initialized Bedrock client.
        Lazily creates one if not yet available.
        """
        if self.bedrock_client is not None:
            return self.bedrock_client

        logger.info("🧠 Bedrock client not initialized — attempting lazy setup...")
        self.bedrock_client = self._create_runtime_client()
        if self.bedrock_client:
            self.is_configured = True
            logger.info("✅ Lazy Bedrock client initialization successful.")
        else:
            logger.error("❌ Lazy Bedrock initialization failed — client still None.")
        return self.bedrock_client

    def get_aws_info(self) -> Dict[str, Any]:
        """Return diagnostic info (never exposes secrets)."""
        return {
            "region": self.region,
            "is_configured": self.is_configured,
            "client_ready": self.bedrock_client is not None,
            "env_has_creds": self._has_valid_env(),
        }

    def print_config_status(self):
        """Print configuration status for debugging."""
        info = self.get_aws_info()
        logger.info("🔧 AWS Configuration Status:")
        logger.info(f"  Region: {info['region']}")
        logger.info(f"  Credentials Present: {'✅ Yes' if info['env_has_creds'] else '❌ No'}")
        logger.info(f"  Configured: {'✅ Yes' if info['is_configured'] else '❌ No'}")
        logger.info(f"  Client Ready: {'✅ Yes' if info['client_ready'] else '❌ No'}")

# -------------------------------------------------------------------
# Global access functions
# -------------------------------------------------------------------

aws_config = AWSConfig()

def get_bedrock_client():
    """Return a valid Bedrock runtime client, reinitializing if needed."""
    try:
        return aws_config.get_bedrock_client()
    except Exception as e:
        logger.error(f"❌ Error in get_bedrock_client(): {e}", exc_info=True)
        return None

def setup_aws() -> bool:
    """Initialize AWS configuration at startup (non-fatal for Render)."""
    logger.info("🚀 Setting up AWS configuration (non-fatal)...")
    aws_config.print_config_status()
    try:
        client = aws_config.setup_bedrock_client()
        if client:
            logger.info("✅ AWS setup completed successfully.")
        else:
            logger.warning("⚠️ AWS setup incomplete; will retry later when credentials available.")
        return True
    except Exception as e:
        logger.error(f"⚠️ AWS setup error: {e}", exc_info=True)
        logger.warning("Continuing without Bedrock until runtime credentials are available.")
        return True  # Never fail deployment

def check_aws_status() -> Dict[str, Any]:
    """Return AWS configuration status for /health endpoint."""
    return aws_config.get_aws_info()

# -------------------------------------------------------------------
# Standalone test (optional)
# -------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    setup_aws()
    info = check_aws_status()
    print("AWS Status:", info)
