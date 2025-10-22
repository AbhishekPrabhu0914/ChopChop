#!/usr/bin/env python3
"""
AWS Self-Test Script for ChopChop Backend

Checks that:
- AWS credentials are discoverable via the default credential chain
- Region is set (defaults to us-east-1)
- Bedrock clients (control plane and runtime) can be instantiated
- Optionally performs a tiny live model call when --live is passed

Usage:
  python aws_selftest.py              # non-invasive checks (no model invocation)
  python aws_selftest.py --live       # include a minimal Bedrock Converse call

Notes:
- Avoids STS per operational constraints
- Control plane call (list_foundation_models) is best-effort and tolerated if denied
"""

import os
import sys
import json
import time
import logging
from typing import Tuple

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger("aws_selftest")


def check_credentials() -> Tuple[bool, str]:
    try:
        session = boto3.Session()
        creds = session.get_credentials()
        if creds is None:
            return False, "No credentials found in default AWS credential chain"
        frozen = creds.get_frozen_credentials()
        provider = getattr(creds, 'method', 'unknown')
        return True, f"Credentials resolved via: {provider}; access_key starts with: {frozen.access_key[:4]}***"
    except Exception as e:
        return False, f"Error resolving credentials: {e}"


def check_region() -> Tuple[bool, str]:
    region = os.getenv('AWS_REGION', 'us-east-1')
    return True, f"Region set to: {region}"


def check_bedrock_clients() -> Tuple[bool, str]:
    region = os.getenv('AWS_REGION', 'us-east-1')
    try:
        runtime = boto3.client('bedrock-runtime', region_name=region)
        # Best-effort control plane reachability; not required
        try:
            control = boto3.client('bedrock', region_name=region)
            control.list_foundation_models(MaxResults=1)
            control_msg = "Bedrock control plane reachable"
        except Exception as ce:
            control_msg = f"Control plane check skipped/denied: {ce}"
        return True, f"Bedrock runtime client created. {control_msg}"
    except NoCredentialsError:
        return False, "Credentials error when creating Bedrock runtime client"
    except ClientError as ce:
        return False, f"ClientError creating Bedrock runtime client: {ce}"
    except Exception as e:
        return False, f"Unexpected error creating Bedrock runtime client: {e}"


def live_converse_test() -> Tuple[bool, str]:
    """Optional tiny live test to verify invocation works. Costs may apply.
    Uses a minimal prompt with low maxTokens.
    """
    region = os.getenv('AWS_REGION', 'us-east-1')
    model_id = os.getenv('AWS_BEDROCK_MODEL_ID', 'amazon.nova-pro-v1:0')
    try:
        client = boto3.client('bedrock-runtime', region_name=region)
        response = client.converse(
            modelId=model_id,
            messages=[{"role": "user", "content": [{"text": "ping"}]}],
            inferenceConfig={"maxTokens": 8, "temperature": 0.1}
        )
        text = response.get("output", {}).get("message", {}).get("content", [{}])[0].get("text", "")
        return True, f"Converse succeeded. Model: {model_id}. Sample: {text[:40]!r}"
    except ClientError as ce:
        return False, f"Converse ClientError: {ce}"
    except Exception as e:
        return False, f"Converse error: {e}"


def main():
    live = '--live' in sys.argv
    logger.info("Starting AWS self-test (live=%s)", live)

    checks = [
        ("credentials", check_credentials),
        ("region", check_region),
        ("bedrock_clients", check_bedrock_clients),
    ]

    all_ok = True
    results = {}
    for name, fn in checks:
        ok, msg = fn()
        results[name] = {"ok": ok, "message": msg}
        logger.info("%s: %s", name, msg)
        all_ok = all_ok and ok

    if live:
        ok, msg = live_converse_test()
        results["live_converse"] = {"ok": ok, "message": msg}
        logger.info("live_converse: %s", msg)
        all_ok = all_ok and ok

    print(json.dumps({
        "ok": all_ok,
        "timestamp": time.time(),
        "results": results
    }, indent=2))

    sys.exit(0 if all_ok else 1)


if __name__ == '__main__':
    main()


