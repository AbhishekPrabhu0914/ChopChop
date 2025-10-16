#!/usr/bin/env python3
"""
Test script for image preprocessing with IMG_3391.png
"""

import base64
import os
from PIL import Image
import io
import boto3
from botocore.exceptions import ClientError

def preprocess_image(image_base64, max_size_mb=4, max_dimension=2048):
    """
    Preprocess image to meet AWS Bedrock requirements
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        print(f"Original image: {image.size}, mode: {image.mode}")
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        print(f"After conversion: {image.size}, mode: {image.mode}")
        
        # Resize if too large
        width, height = image.size
        if width > max_dimension or height > max_dimension:
            if width > height:
                new_width = max_dimension
                new_height = int(height * max_dimension / width)
            else:
                new_height = max_dimension
                new_width = int(width * max_dimension / height)
            
            print(f"Resizing from {width}x{height} to {new_width}x{new_height}")
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Compress to meet size requirements
        max_size_bytes = max_size_mb * 1024 * 1024
        
        for quality in [95, 90, 85, 80, 75, 70, 65, 60]:
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            compressed_data = output.getvalue()
            
            if len(compressed_data) <= max_size_bytes:
                print(f"Image compressed to {len(compressed_data) / 1024 / 1024:.2f}MB with quality {quality}")
                return base64.b64encode(compressed_data).decode('utf-8'), 'jpeg'
        
        # If still too large, resize more aggressively
        print("Image still too large, resizing more aggressively")
        image = image.resize((int(image.width * 0.8), int(image.height * 0.8)), Image.Resampling.LANCZOS)
        
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=70, optimize=True)
        compressed_data = output.getvalue()
        
        print(f"Final image size: {len(compressed_data) / 1024 / 1024:.2f}MB")
        return base64.b64encode(compressed_data).decode('utf-8'), 'jpeg'
        
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        raise

def test_with_nova(image_base64, image_format):
    """Test the processed image with Nova Pro"""
    try:
        client = boto3.client("bedrock-runtime", region_name="us-east-1")
        model_id = "amazon.nova-pro-v1:0"
        
        # Try with raw bytes instead of base64
        image_bytes = base64.b64decode(image_base64)
        content = [
            {"text": "What do you see in this image?"},
            {
                "image": {
                    "format": image_format,
                    "source": {
                        "bytes": image_bytes
                    }
                }
            }
        ]
        
        # Debug: Check if base64 is valid
        try:
            decoded = base64.b64decode(image_base64)
            print(f"Base64 decode successful, decoded size: {len(decoded)} bytes")
            # Try to open the decoded image
            test_img = Image.open(io.BytesIO(decoded))
            print(f"Decoded image is valid: {test_img.size}, {test_img.format}")
            
            # Check first few bytes to see if it's a valid JPEG
            print(f"First 10 bytes: {decoded[:10]}")
            if decoded.startswith(b'\xff\xd8\xff'):
                print("✅ Valid JPEG header detected")
            else:
                print("❌ Invalid JPEG header")
                
        except Exception as e:
            print(f"Base64 decode test failed: {e}")
        
        conversation = [
            {
                "role": "user",
                "content": content,
            }
        ]
        
        print(f"Sending to Nova Pro with format: {image_format}")
        print(f"Image data length: {len(image_base64)} characters")
        
        response = client.converse(
            modelId=model_id,
            messages=conversation,
            inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9},
        )
        
        response_text = response["output"]["message"]["content"][0]["text"]
        print(f"Nova Pro response: {response_text}")
        return True
        
    except ClientError as e:
        print(f"AWS Client Error: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    # Look for IMG_3391.png in the current directory and parent directories
    possible_paths = [
        "IMG_3391.png",
        "../IMG_3391.png",
        "../../IMG_3391.png",
        "/Users/abhishekprabhu/Desktop/IMG_3391.png",
        "/Users/abhishekprabhu/Downloads/IMG_3391.png"
    ]
    
    image_path = None
    for path in possible_paths:
        if os.path.exists(path):
            image_path = path
            break
    
    if not image_path:
        print("IMG_3391.png not found. Creating a small test image instead.")
        # Create a small test image
        test_image = Image.new('RGB', (100, 100), color='red')
        test_image.save('test_small.jpg', 'JPEG')
        image_path = 'test_small.jpg'
        print(f"Created test image: {image_path}")
    else:
        print(f"Found image at: {image_path}")
    
    # Read and encode the image
    with open(image_path, "rb") as image_file:
        image_base64 = base64.b64encode(image_file.read()).decode('utf-8')
    
    original_size = len(image_base64) * 3 / 4 / 1024 / 1024
    print(f"Original image size: {original_size:.2f}MB")
    
    # Preprocess the image
    print("\n=== PREPROCESSING IMAGE ===")
    try:
        processed_base64, processed_format = preprocess_image(image_base64)
        processed_size = len(processed_base64) * 3 / 4 / 1024 / 1024
        print(f"Processed image size: {processed_size:.2f}MB")
        print(f"Processed format: {processed_format}")
    except Exception as e:
        print(f"Preprocessing failed: {e}")
        return
    
    # Test with Nova Pro
    print("\n=== TESTING WITH NOVA PRO ===")
    success = test_with_nova(processed_base64, processed_format)
    
    if success:
        print("\n✅ Test successful! Image preprocessing works correctly.")
    else:
        print("\n❌ Test failed. Check the error messages above.")

if __name__ == "__main__":
    main()
