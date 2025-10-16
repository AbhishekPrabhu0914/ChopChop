#!/usr/bin/env python3
"""
Enhanced script to interact with Amazon Nova Lite model via AWS Bedrock
Supports both text and image inputs (multimodal)
"""

import boto3
import base64
from botocore.exceptions import ClientError
from typing import Optional, Union

def encode_image_to_base64(image_path: str) -> str:
    """
    Encode an image file to base64 string
    
    Args:
        image_path (str): Path to the image file
    
    Returns:
        str: Base64 encoded image string
    """
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except FileNotFoundError:
        raise FileNotFoundError(f"Image file not found: {image_path}")
    except Exception as e:
        raise Exception(f"Error encoding image: {e}")

def send_message_to_nova(
    message: str, 
    image_path: Optional[str] = None,
    region: str = "us-east-1"
) -> str:
    """
    Send a message (with optional image) to Amazon Nova Lite model and get response
    
    Args:
        message (str): The text message to send to the model
        image_path (str, optional): Path to an image file to include
        region (str): AWS region (default: us-east-1)
    
    Returns:
        str: Response from the model
    """
    # Create a Bedrock Runtime client
    client = boto3.client("bedrock-runtime", region_name=region)
    
    # Set the model ID
    model_id = "amazon.nova-lite-v1:0"
    
    # Prepare the content
    content = [{"text": message}]
    
    # Add image if provided
    if image_path:
        try:
            image_base64 = encode_image_to_base64(image_path)
            content.append({
                "image": {
                    "format": "jpeg",  # or "png" depending on your image
                    "source": {
                        "bytes": image_base64
                    }
                }
            })
        except Exception as e:
            return f"ERROR processing image: {e}"
    
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
        return f"ERROR: AWS Client Error - {e}"
    except Exception as e:
        return f"ERROR: {e}"

def main():
    """Main function to run the script"""
    print("Amazon Nova Lite Multimodal Chat Script")
    print("=" * 40)
    
    # Example 1: Text only
    print("\n1. Text-only example:")
    user_message = "Describe the purpose of a 'hello world' program in one line."
    print(f"User: {user_message}")
    response = send_message_to_nova(user_message)
    print(f"Nova: {response}")
    
    # Example 2: Text with image (if you have an image file)
    print("\n2. Text + Image example:")
    image_path = "sample_image.jpg"  # Replace with your image path
    image_message = "What do you see in this image?"
    
    print(f"User: {image_message} (with image: {image_path})")
    response = send_message_to_nova(image_message, image_path)
    print(f"Nova: {response}")
    
    # Interactive mode
    print("\nInteractive mode (type 'quit' to exit):")
    print("Commands:")
    print("  - Type text message for text-only chat")
    print("  - Type 'image:path/to/image.jpg your message' for image + text")
    
    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break
        
        if user_input.startswith('image:'):
            # Parse image command
            parts = user_input.split(' ', 1)
            if len(parts) >= 2:
                image_path = parts[0][6:]  # Remove 'image:' prefix
                message = parts[1]
                response = send_message_to_nova(message, image_path)
                print(f"Nova: {response}")
            else:
                print("Usage: image:path/to/image.jpg your message")
        elif user_input:
            response = send_message_to_nova(user_input)
            print(f"Nova: {response}")

if __name__ == "__main__":
    main()
