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
from dotenv import load_dotenv
from supabase_config import supabase_manager
import uuid
import time

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Simple in-memory session store (in production, use Redis or database)
user_sessions = {}

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

def create_user_session(email):
    """Create a new user session"""
    session_id = str(uuid.uuid4())
    user_sessions[session_id] = {
        'email': email,
        'created_at': time.time(),
        'last_activity': time.time()
    }
    return session_id

def validate_session(session_id):
    """Validate user session and return email if valid"""
    if session_id in user_sessions:
        session = user_sessions[session_id]
        # Check if session is not expired (24 hours)
        if time.time() - session['created_at'] < 86400:
            session['last_activity'] = time.time()
            return session['email']
        else:
            # Remove expired session
            del user_sessions[session_id]
    return None

def preprocess_image(image_base64, max_size_mb=3, max_dimension=1024):
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
                "maxTokens": 2048,  # Increased for detailed structured output
                "temperature": 0.3,  # Lower for more consistent JSON
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

@app.route("/auth/signin", methods=["POST"])
def signin():
    """Sign in with email"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Basic email validation
        if '@' not in email or '.' not in email.split('@')[1]:
            return jsonify({"error": "Invalid email format"}), 400
        
        # Create user session
        session_id = create_user_session(email)
        
        logger.info(f"User signed in: {email}")
        
        return jsonify({
            "success": True,
            "message": "Signed in successfully",
            "session_id": session_id,
            "email": email
        })
        
    except Exception as e:
        logger.error(f"Sign in error: {e}")
        return jsonify({"error": "Sign in failed"}), 500


@app.route("/auth/verify", methods=["POST"])
def verify_session():
    """Verify user session"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', '')
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
        
        email = validate_session(session_id)
        
        if email:
            return jsonify({
                "success": True,
                "email": email,
                "message": "Session is valid"
            })
        else:
            return jsonify({"error": "Invalid or expired session"}), 401
            
    except Exception as e:
        logger.error(f"Session verification error: {e}")
        return jsonify({"error": "Session verification failed"}), 500

@app.route("/auth/signout", methods=["POST"])
def signout():
    """Sign out user"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', '')
        
        if session_id and session_id in user_sessions:
            del user_sessions[session_id]
            logger.info(f"User signed out: {session_id}")
        
        return jsonify({
            "success": True,
            "message": "Signed out successfully"
        })
        
    except Exception as e:
        logger.error(f"Sign out error: {e}")
        return jsonify({"error": "Sign out failed"}), 500

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
        email = data.get('email')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        logger.info(f"Received message: {message[:50]}...")
        if image_base64:
            logger.info(f"Received image with format: {image_format}")
            # Check image size (limit to 4MB for Vercel compatibility)
            image_size_mb = len(image_base64) * 3 / 4 / 1024 / 1024  # Approximate size from base64
            if image_size_mb > 4:
                return jsonify({
                    "error": f"Image too large ({image_size_mb:.1f}MB). Maximum supported size is 4MB."
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
            # Send message to Nova Pro model (text only)
            response_text = send_message_to_nova(message)
        
        # Save chat message and response to database if user email is provided
        if email and supabase_manager.enabled:
            try:
                # Save user message
                supabase_manager.save_chat_message(email, message, 'user', image_base64, image_format)
                
                # Save Nova response
                if isinstance(response_text, dict) and response_text.get('type') == 'structured':
                    # For structured responses, save the full response
                    supabase_manager.save_chat_message(email, str(response_text), 'nova')
                else:
                    # For text responses, save as text
                    response_text_str = response_text if isinstance(response_text, str) else str(response_text)
                    supabase_manager.save_chat_message(email, response_text_str, 'nova')
                    
            except Exception as e:
                logger.warning(f"Failed to save chat message: {e}")
                # Don't fail the request if saving fails
        
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

@app.route('/recent-recipes/add', methods=['POST'])
def add_recent_recipe():
    """Add a selected recipe to user's recent recipes (keep last 10)"""
    try:
        if not supabase_manager.enabled:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            }), 503

        data = request.get_json()
        email = data.get('email')
        recipe = data.get('recipe')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        if not recipe or not isinstance(recipe, dict):
            return jsonify({"error": "Recipe object is required"}), 400

        success = supabase_manager.add_recent_recipe(email, recipe)

        if success:
            return jsonify({"success": True, "message": "Recent recipe added"})
        else:
            return jsonify({"success": False, "error": "Failed to add recent recipe"}), 500

    except Exception as e:
        logger.error(f"Error adding recent recipe: {e}")
        return jsonify({"success": False, "error": "Failed to add recent recipe", "details": str(e)}), 500


@app.route('/recent-recipes/get', methods=['POST'])
def get_recent_recipes():
    """Get the user's recent recipes (up to 10)"""
    try:
        if not supabase_manager.enabled:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            }), 503

        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        recent = supabase_manager.get_recent_recipes(email)

        if recent is None:
            return jsonify({"success": False, "error": "Failed to retrieve recent recipes"}), 500
        else:
            return jsonify({"success": True, "recent_recipes": recent})

    except Exception as e:
        logger.error(f"Error retrieving recent recipes: {e}")
        return jsonify({"success": False, "error": "Failed to retrieve recent recipes", "details": str(e)}), 500

@app.route('/save-data', methods=['POST'])
def save_data():
    """Save user's grocery items, recipes, and pantry to Supabase"""
    try:
        if not supabase_manager.enabled:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            }), 503
        
        data = request.get_json()
        email = data.get('email')
        items = data.get('items', [])
        recipes = data.get('recipes', [])
        
        if not email:
            return jsonify({
                "success": False,
                "error": "Email is required to save data"
            }), 400
        
        # User is authenticated with email, save to database
        record_id = supabase_manager.save_user_data(email, items, recipes)
        
        if record_id:
            return jsonify({
                "success": True,
                "message": "Data saved successfully",
                "record_id": record_id
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to save data"
            }), 500
            
    except Exception as e:
        logger.error(f"Error saving data: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to save data",
            "details": str(e)
        }), 500

@app.route('/get-data', methods=['POST'])
def get_data():
    """Retrieve user's saved data from Supabase"""
    try:
        if not supabase_manager.enabled:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            }), 503
        
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({
                "success": False,
                "error": "Email is required to retrieve data"
            }), 400
        
        # User is authenticated with email, retrieve from database
        user_data = supabase_manager.get_user_data(email)
        
        if user_data:
            return jsonify({
                "success": True,
                "data": user_data
            })
        else:
            return jsonify({
                "success": True,
                "data": {
                    "id": None,
                    "items": [],
                    "recipes": []
                }
            })
            
    except Exception as e:
        logger.error(f"Error retrieving data: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve data",
            "details": str(e)
        }), 500

@app.route('/update-data', methods=['POST'])
def update_data():
    """Update user's existing data in Supabase"""
    try:
        if not supabase_manager.enabled:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            }), 503
        
        data = request.get_json()
        email = data.get('email')
        items = data.get('items', [])
        recipes = data.get('recipes', [])
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        success = supabase_manager.update_user_data(email, items, recipes)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Data updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to update data"
            }), 500
            
    except Exception as e:
        logger.error(f"Error updating data: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to update data",
            "details": str(e)
        }), 500

@app.route('/send-email', methods=['POST'])
def send_email():
    """Send email with grocery list and recipes to user"""
    try:
        if not supabase_manager.enabled:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            }), 503
        
        data = request.get_json()
        email = data.get('email')
        items = data.get('items', [])
        recipes = data.get('recipes', [])
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        success = supabase_manager.send_grocery_list_email(email, items, recipes)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Email sent successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to send email"
            }), 500
            
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to send email",
            "details": str(e)
        }), 500

@app.route('/chat-history', methods=['POST'])
def get_chat_history():
    """Get user's chat history"""
    try:
        if not supabase_manager.enabled:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            }), 503
        
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({
                "success": False,
                "error": "Email is required to retrieve chat history"
            }), 400
        
        # User is authenticated with email, retrieve chat history
        chat_history = supabase_manager.get_chat_history(email)
        
        if chat_history is not None:
            return jsonify({
                "success": True,
                "chat_history": chat_history
            })
        else:
            return jsonify({
                "success": True,
                "chat_history": []
            })
            
    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve chat history",
            "details": str(e)
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "message": "ChopChop Backend API",
        "endpoints": {
            "/health": "GET - Health check",
            "/chat": "POST - Send message to Nova Pro model",
            "/chat-history": "POST - Get user's chat history",
            "/save-data": "POST - Save user data to Supabase",
            "/get-data": "POST - Retrieve user data from Supabase",
            "/update-data": "POST - Update user data in Supabase",
            "/send-email": "POST - Send email with grocery list and recipes",
            "/auth/signin": "POST - Sign in with email",
            "/auth/verify": "POST - Verify session",
            "/auth/signout": "POST - Sign out user"
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting ChopChop Backend on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
