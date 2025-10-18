#!/usr/bin/env python3
"""
Flask backend server for ChopChop Frontend
Integrates with Amazon Nova Lite model via AWS Bedrock
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import base64
import os
from botocore.exceptions import ClientError
import logging
from PIL import Image
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure AWS SDK
def get_bedrock_client():
    """Get configured Bedrock client"""
    try:
        client = boto3.client(
            "bedrock-runtime", 
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        return client
    except Exception as e:
        logger.error(f"Failed to create Bedrock client: {e}")
        raise

def preprocess_image(image_base64, max_size_mb=4, max_dimension=2048):
    """
    Preprocess image to meet AWS Bedrock requirements
    
    Args:
        image_base64 (str): Base64 encoded image
        max_size_mb (int): Maximum file size in MB (default 4MB to be safe)
        max_dimension (int): Maximum width/height in pixels (default 2048)
    
    Returns:
        tuple: (processed_image_base64, format)
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary (handles RGBA, P, etc.)
        if image.mode in ('RGBA', 'P'):
            # Create white background for transparency
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large
        width, height = image.size
        if width > max_dimension or height > max_dimension:
            # Calculate new dimensions maintaining aspect ratio
            if width > height:
                new_width = max_dimension
                new_height = int(height * max_dimension / width)
            else:
                new_height = max_dimension
                new_width = int(width * max_dimension / height)
            
            logger.info(f"Resizing image from {width}x{height} to {new_width}x{new_height}")
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Compress to meet size requirements
        max_size_bytes = max_size_mb * 1024 * 1024
        
        # Try different quality levels
        for quality in [95, 90, 85, 80, 75, 70, 65, 60]:
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            compressed_data = output.getvalue()
            
            if len(compressed_data) <= max_size_bytes:
                logger.info(f"Image compressed to {len(compressed_data) / 1024 / 1024:.2f}MB with quality {quality}")
                return compressed_data, 'jpeg'
        
        # If still too large, resize more aggressively
        logger.warning("Image still too large after compression, resizing more aggressively")
        image = image.resize((int(image.width * 0.8), int(image.height * 0.8)), Image.Resampling.LANCZOS)
        
        # Try compression again
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=70, optimize=True)
        compressed_data = output.getvalue()
        
        logger.info(f"Final image size: {len(compressed_data) / 1024 / 1024:.2f}MB")
        return compressed_data, 'jpeg'
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise Exception(f"Failed to preprocess image: {e}")

def generate_recipes_from_fridge(message, image_bytes, image_format):
    """
    Generate recipes based on ingredients found in a fridge photo
    
    Args:
        message (str): The user's message
        image_bytes (bytes): Raw image bytes
        image_format (str): Image format
    
    Returns:
        str: Recipe suggestions based on ingredients
    """
    client = get_bedrock_client()
    model_id = "amazon.nova-pro-v1:0"
    
    # Prepare specialized prompt for fridge analysis with structured output
    fridge_prompt = """You are a professional chef and food expert. Analyze this fridge photo and return a JSON response with the following structure:

{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "estimated amount",
      "category": "dairy/vegetables/meat/etc",
      "freshness": "fresh/good/needs_use_soon/expired"
    }
  ],
  "grocery_list": [
    {
      "item": "item name",
      "category": "category",
      "needed_for": "recipe name or general use",
      "priority": "high/medium/low",
      "checked": false
    }
  ],
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "cooking_time": "X minutes",
      "difficulty": "Easy/Medium/Hard",
      "servings": "X servings",
      "ingredients_needed": [
        {
          "name": "ingredient",
          "amount": "quantity",
          "available": true/false
        }
      ],
      "instructions": [
        "Step 1: ...",
        "Step 2: ..."
      ],
      "tips": "Additional cooking tips"
    }
  ]
}

Analyze the fridge photo and provide this structured response. Be specific about quantities and cooking techniques."""
    
    # Prepare the content
    content = [
            {"text": fridge_prompt},
            {
                "image": {
                    "format": image_format or "jpeg",
                    "source": {
                        "bytes": image_bytes
                    }
                }
            }
        ]
    
    # Prepare the conversation
    conversation = [
        {
            "role": "user",
            "content": content,
        }
    ]
    
    try:
        # Send the message to the model with higher token limit for detailed recipes
        response = client.converse(
            modelId=model_id,
            messages=conversation,
            inferenceConfig={
                "maxTokens": 2048,  # Increased for detailed structured output
                "temperature": 0.3,  # Lower for more consistent JSON
                "topP": 0.9
            },
        )
        
        # Extract and parse the response text
        response_text = response["output"]["message"]["content"][0]["text"]
        
        # Try to parse as JSON, fallback to text if parsing fails
        try:
            import json
            # Look for JSON in the response (sometimes Nova adds extra text)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                parsed_data = json.loads(json_str)
                return {
                    "type": "structured",
                    "data": parsed_data
                }
            else:
                # Fallback to text response
                return {
                    "type": "text",
                    "data": response_text
                }
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse JSON response: {e}")
            return {
                "type": "text", 
                "data": response_text
            }
        
    except ClientError as e:
        logger.error(f"AWS Client Error: {e}")
        raise Exception(f"AWS Client Error: {e}")
    except Exception as e:
        logger.error(f"Error generating recipes: {e}")
        raise Exception(f"Error generating recipes: {e}")

def send_message_to_nova(message, image_bytes=None, image_format=None):
    """
    Send a message to Amazon Nova Pro model and get response
    
    Args:
        message (str): The text message to send to the model
        image_bytes (bytes, optional): Raw image bytes
        image_format (str, optional): Image format (jpeg, png)
    
    Returns:
        str: Response from the model
    """
    client = get_bedrock_client()
    model_id = "amazon.nova-pro-v1:0"
    
    # Prepare the content
    content = [{"text": message}]
    
    # Add image if provided
    if image_bytes:
        content.append({
            "image": {
                "format": image_format or "jpeg",
                "source": {
                    "bytes": image_bytes
                }
            }
        })
    
    # Prepare the conversation
    conversation = [
        {
            "role": "user",
            "content": content,
        }
    ]
    
    try:
        # Send the message to the model
        response = client.converse(
            modelId=model_id,
            messages=conversation,
            inferenceConfig={
                "maxTokens": 512, 
                "temperature": 0.5, 
                "topP": 0.9
            },
        )
        
        # Extract and return the response text
        response_text = response["output"]["message"]["content"][0]["text"]
        return response_text
        
    except ClientError as e:
        logger.error(f"AWS Client Error: {e}")
        raise Exception(f"AWS Client Error: {e}")
    except Exception as e:
        logger.error(f"Error calling Nova model: {e}")
        raise Exception(f"Error calling Nova model: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "chopchop-backend"})

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        message = data.get('message')
        image_base64 = data.get('imageBase64')
        image_format = data.get('imageFormat')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        logger.info(f"Received message: {message[:50]}...")
        if image_base64:
            logger.info(f"Received image with format: {image_format}")
            # Check image size (limit to 100MB)
            image_size_mb = len(image_base64) * 3 / 4 / 1024 / 1024  # Approximate size from base64
            if image_size_mb > 100:
                return jsonify({
                    "error": f"Image too large ({image_size_mb:.1f}MB). Maximum supported size is 100MB."
                }), 400
            
            # Preprocess image to meet AWS Bedrock requirements
            try:
                logger.info("Preprocessing image for AWS Bedrock compatibility...")
                processed_image_bytes, processed_format = preprocess_image(image_base64)
                logger.info(f"Image preprocessing complete. New format: {processed_format}")
                image_bytes = processed_image_bytes
                image_format = processed_format
            except Exception as e:
                logger.error(f"Image preprocessing failed: {e}")
                return jsonify({
                    "error": f"Failed to process image: {str(e)}"
                }), 400
        
        # Check if this is a fridge photo request
        if image_base64 and ("fridge" in message.lower() or "recipe" in message.lower() or "ingredient" in message.lower() or "analyze" in message.lower()):
            logger.info("Detected fridge photo request - using recipe generation")
            # Validate image format
            if image_format and image_format.lower() not in ['jpeg', 'jpg', 'png', 'gif', 'webp']:
                return jsonify({
                    "error": f"Unsupported image format: {image_format}. Supported formats: JPEG, PNG, GIF, WebP"
                }), 400
            response_text = generate_recipes_from_fridge(message, image_bytes, image_format)
        else:
            # Send message to Nova Pro model
            # Validate image format
            if image_base64 and image_format and image_format.lower() not in ['jpeg', 'jpg', 'png', 'gif', 'webp']:
                return jsonify({
                    "error": f"Unsupported image format: {image_format}. Supported formats: JPEG, PNG, GIF, WebP"
                }), 400
            response_text = send_message_to_nova(message, image_bytes, image_format)
        
        return jsonify({
            "success": True,
            "response": response_text
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return jsonify({
            "error": "Failed to get response from Nova model",
            "details": str(e)
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "message": "ChopChop Backend API",
        "endpoints": {
            "/health": "GET - Health check",
            "/chat": "POST - Send message to Nova Lite model"
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting ChopChop Backend on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
