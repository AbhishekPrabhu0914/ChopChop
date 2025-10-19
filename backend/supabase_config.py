"""
Supabase configuration and database operations for ChopChop
"""
import os
import json
import logging
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class SupabaseManager:
    def __init__(self):
        """Initialize Supabase client with environment variables"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        # Try service role key first, then fall back to anon key
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_API_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            logger.warning("Supabase credentials not found. Supabase features will be disabled.")
            logger.warning("To enable Supabase features, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_API_KEY) environment variables")
            self.supabase = None
            self.enabled = False
        else:
            try:
                self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
                self.enabled = True
                logger.info("Supabase client initialized successfully")
                if os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
                    logger.info("Using service role key (full access)")
                else:
                    logger.warning("Using anon key (limited access - some operations may fail)")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.supabase = None
                self.enabled = False
        
        # Email configuration
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
    
    
    def save_user_data(self, user_email: str, items: List[Dict], recipes: List[Dict]) -> Optional[str]:
        """
        Save user's grocery items and recipes to Supabase
        
        Args:
            user_email: User's email address
            items: List of grocery items
            recipes: List of recipes
            
        Returns:
            UUID of the saved record or None if failed
        """
        if not self.enabled:
            logger.warning("Supabase is not enabled. Cannot save data.")
            return None
            
        try:
            # First check if user exists
            existing_result = self.supabase.table('Users').select('id').eq('email', user_email).execute()
            
            data = {
                'email': user_email,
                'items': json.dumps(items),
                'recipes': json.dumps(recipes)
            }
            
            if existing_result.data:
                # Update existing user
                result = self.supabase.table('Users').update(data).eq('email', user_email).execute()
                record_id = existing_result.data[0]['id']
            else:
                # Insert new user
                result = self.supabase.table('Users').insert(data).execute()
                record_id = result.data[0]['id']
            
            if result.data:
                logger.info(f"Successfully saved data for user {user_email} with ID {record_id}")
                return record_id
            else:
                logger.error(f"Failed to save data for user {user_email}")
                return None
                
        except Exception as e:
            logger.error(f"Error saving user data: {e}")
            return None
    
    def get_user_data(self, user_email: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve user's saved data from Supabase
        
        Args:
            user_email: User's email address
            
        Returns:
            Dictionary containing items and recipes or None if not found
        """
        if not self.enabled:
            logger.warning("Supabase is not enabled. Cannot retrieve data.")
            return None
            
        try:
            result = self.supabase.table('Users').select('*').eq('email', user_email).execute()
            
            if result.data:
                record = result.data[0]
                return {
                    'id': record['id'],
                    'items': json.loads(record['items']) if record.get('items') else [],
                    'recipes': json.loads(record['recipes']) if record.get('recipes') else []
                }
            else:
                logger.info(f"No data found for user {user_email}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving user data: {e}")
            return None
    
    def update_user_data(self, user_email: str, items: List[Dict], recipes: List[Dict]) -> bool:
        """
        Update user's existing data in Supabase
        
        Args:
            user_email: User's email address
            items: Updated list of grocery items
            recipes: Updated list of recipes
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            logger.warning("Supabase is not enabled. Cannot update data.")
            return False
            
        try:
            data = {
                'items': json.dumps(items),
                'recipes': json.dumps(recipes)
            }
            
            result = self.supabase.table('Users').update(data).eq('email', user_email).execute()
            
            if result.data:
                logger.info(f"Successfully updated data for user {user_email}")
                return True
            else:
                logger.error(f"Failed to update data for user {user_email}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating user data: {e}")
            return False
    
    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
        """
        Send email to user with their grocery list and recipes
        
        Args:
            to_email: Recipient's email address
            subject: Email subject
            body: Email body content
            is_html: Whether the body is HTML format
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not all([self.smtp_user, self.smtp_password]):
            logger.error("SMTP credentials not configured")
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False
    
    def send_grocery_list_email(self, user_email: str, items: List[Dict], recipes: List[Dict]) -> bool:
        """
        Send a formatted email with grocery list and recipes
        
        Args:
            user_email: User's email address
            items: List of grocery items
            recipes: List of recipes
            
        Returns:
            True if email sent successfully, False otherwise
        """
        subject = "Your ChopChop Grocery List & Recipes"
        
        # Create HTML email body
        html_body = self._create_html_email_body(items, recipes)
        
        return self.send_email(user_email, subject, html_body, is_html=True)
    
    def _create_html_email_body(self, items: List[Dict], recipes: List[Dict]) -> str:
        """Create HTML formatted email body"""
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px; }
                .section { margin: 20px 0; }
                .item { background-color: #f8fafc; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #3b82f6; }
                .recipe { background-color: #fef3c7; padding: 15px; margin: 10px 0; border-radius: 8px; }
                .priority-high { border-left-color: #ef4444; }
                .priority-medium { border-left-color: #f59e0b; }
                .priority-low { border-left-color: #10b981; }
                .checked { text-decoration: line-through; opacity: 0.6; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🛒 Your ChopChop Grocery List & Recipes</h1>
                <p>Generated by your Kitchen Assistant</p>
            </div>
        """
        
        # Add grocery list section
        if items:
            html += """
            <div class="section">
                <h2>🛒 Grocery List</h2>
            """
            for item in items:
                priority_class = f"priority-{item.get('priority', 'medium')}"
                checked_class = "checked" if item.get('checked', False) else ""
                html += f"""
                <div class="item {priority_class} {checked_class}">
                    <strong>{item.get('item', 'Unknown Item')}</strong>
                    <span style="float: right; background-color: #e5e7eb; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                        {item.get('priority', 'medium').upper()}
                    </span>
                    <br>
                    <small>Category: {item.get('category', 'general')} | Needed for: {item.get('needed_for', 'General use')}</small>
                </div>
                """
            html += "</div>"
        
        # Add recipes section
        if recipes:
            html += """
            <div class="section">
                <h2>👨‍🍳 Recipes</h2>
            """
            for recipe in recipes:
                html += f"""
                <div class="recipe">
                    <h3>{recipe.get('name', 'Untitled Recipe')}</h3>
                    <p><strong>Description:</strong> {recipe.get('description', 'No description')}</p>
                    <p><strong>Cooking Time:</strong> {recipe.get('cooking_time', 'Not specified')} | 
                       <strong>Difficulty:</strong> {recipe.get('difficulty', 'Not specified')} | 
                       <strong>Servings:</strong> {recipe.get('servings', 'Not specified')}</p>
                """
                
                # Add ingredients
                if recipe.get('ingredients_needed'):
                    html += "<p><strong>Ingredients:</strong></p><ul>"
                    for ingredient in recipe['ingredients_needed']:
                        available = "✅" if ingredient.get('available', False) else "❌"
                        html += f"<li>{available} {ingredient.get('amount', '')} {ingredient.get('name', '')}</li>"
                    html += "</ul>"
                
                # Add instructions
                if recipe.get('instructions'):
                    html += "<p><strong>Instructions:</strong></p><ol>"
                    for instruction in recipe['instructions']:
                        html += f"<li>{instruction}</li>"
                    html += "</ol>"
                
                # Add tips
                if recipe.get('tips'):
                    html += f"<p><strong>Tips:</strong> {recipe['tips']}</p>"
                
                html += "</div>"
            html += "</div>"
        
        html += """
            <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
                <p>Generated by <strong>ChopChop</strong> - Your Kitchen Assistant</p>
                <p>Visit <a href="http://localhost:3000">ChopChop App</a> to manage your lists and discover more recipes!</p>
            </div>
        </body>
        </html>
        """
        
        return html

# Global instance
supabase_manager = SupabaseManager()
