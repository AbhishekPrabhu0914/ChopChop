#!/usr/bin/env python3
"""
Simple script to interact with Amazon Nova Lite model via AWS Bedrock
"""

import boto3
from botocore.exceptions import ClientError

def send_message_to_nova(message, region="us-east-1"):
    """
    Send a message to Amazon Nova Lite model and get response
    
    Args:
        message (str): The message to send to the model
        region (str): AWS region (default: us-east-1)
    
    Returns:
        str: Response from the model
    """
    # Create a Bedrock Runtime client
    client = boto3.client("bedrock-runtime", region_name=region)
    
    # Set the model ID
    model_id = "amazon.nova-lite-v1:0"
    
    # Prepare the conversation
    conversation = [
        {
            "role": "user",
            "content": [{"text": message}],
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
    print("Amazon Nova Lite Chat Script")
    print("=" * 30)
    
    # Example message
    user_message = "Describe the purpose of a 'hello world' program in one line."
    print(f"User: {user_message}")
    
    # Get response from Nova
    response = send_message_to_nova(user_message)
    print(f"Nova: {response}")
    
    # Interactive mode
    print("\nInteractive mode (type 'quit' to exit):")
    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break
        
        if user_input:
            response = send_message_to_nova(user_input)
            print(f"Nova: {response}")

if __name__ == "__main__":
    main()
