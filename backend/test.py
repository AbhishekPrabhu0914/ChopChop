# Use the Conversation API to send text and image to Amazon Nova.

import boto3
import base64
from botocore.exceptions import ClientError

# Create a Bedrock Runtime client in the AWS Region you want to use.
client = boto3.client("bedrock-runtime", region_name="us-east-1")

# Set the model ID, e.g., Amazon Nova Lite.
model_id = "amazon.nova-lite-v1:0"

# Example 1: Text only
print("=== TEXT ONLY EXAMPLE ===")
user_message = "Describe the purpose of a 'hello world' program in one line."
conversation = [
    {
        "role": "user",
        "content": [{"text": user_message}],
    }
]

# Example 2: Text + Image (uncomment and provide image path)
print("\n=== TEXT + IMAGE EXAMPLE ===")
# image_path = "your_image.jpg"  # Replace with your image path
# user_message_with_image = "What do you see in this image?"

# # Encode image to base64
# try:
#     with open(image_path, "rb") as image_file:
#         image_base64 = base64.b64encode(image_file.read()).decode('utf-8')
    
#     conversation_with_image = [
#         {
#             "role": "user",
#             "content": [
#                 {"text": user_message_with_image},
#                 {
#                     "image": {
#                         "format": "jpeg",  # or "png"
#                         "source": {
#                             "bytes": image_base64
#                         }
#                     }
#                 }
#             ],
#         }
#     ]
# except FileNotFoundError:
#     print(f"Image file not found: {image_path}")
#     conversation_with_image = None

try:
    # Send the text-only message to the model
    print(f"User: {user_message}")
    response = client.converse(
        modelId=model_id,
        messages=conversation,
        inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9},
    )

    # Extract and print the response text.
    response_text = response["output"]["message"]["content"][0]["text"]
    print(f"Nova: {response_text}")

except (ClientError, Exception) as e:
    print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}")
    exit(1)

# Uncomment the section below to test with an image
# if conversation_with_image:
#     try:
#         print(f"\nUser: {user_message_with_image} (with image)")
#         response = client.converse(
#             modelId=model_id,
#             messages=conversation_with_image,
#             inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9},
#         )
#         
#         response_text = response["output"]["message"]["content"][0]["text"]
#         print(f"Nova: {response_text}")
#         
#     except (ClientError, Exception) as e:
#         print(f"ERROR: Can't invoke '{model_id}' with image. Reason: {e}")
