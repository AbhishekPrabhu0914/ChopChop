'use client';

import { useState, useRef, useEffect } from 'react';
import GroceryList from './GroceryList';
import Recipes from './Recipes';
import Pantry from './Pantry';
import { SupabaseService } from '../lib/supabase';
import { authService } from '../lib/auth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nova';
  timestamp: Date;
  hasImage?: boolean;
  imageUrl?: string;
  structuredData?: any;
}

interface ChatInterfaceProps {
  onSignOut: () => void;
}

interface GroceryItem {
  item: string;
  category: string;
  needed_for: string;
  priority: 'high' | 'medium' | 'low';
  checked: boolean;
}

interface Recipe {
  name: string;
  description: string;
  cooking_time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: string;
  ingredients_needed: Array<{
    name: string;
    amount: string;
    available: boolean;
  }>;
  instructions: string[];
  tips: string;
}

interface PantryItem {
  name: string;
  quantity: string;
  category: string;
  freshness: 'fresh' | 'good' | 'needs_use_soon' | 'expired';
  detected_at: string;
}

export default function ChatInterface({ onSignOut }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFridgeMode, setIsFridgeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'grocery' | 'recipes' | 'pantry'>('chat');
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const handleRecipesGenerated = (newRecipes: Recipe[]) => {
    setRecipes(prevRecipes => {
      // Merge new recipes with existing ones, avoiding duplicates based on name
      const existingNames = prevRecipes.map(recipe => recipe.name.toLowerCase());
      const uniqueNewRecipes = newRecipes.filter(recipe => 
        !existingNames.includes(recipe.name.toLowerCase())
      );
      return [...prevRecipes, ...uniqueNewRecipes];
    });
  };
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize messages on client side only to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: '1',
          text: 'Hey, I\'m ChopChop, your Kitchen Assistant! Upload a fridge photo and I\'ll analyze the ingredients to help you with cooking suggestions and recipes.',
          sender: 'nova',
          timestamp: new Date()
        }
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Load user data and chat history automatically on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user) {
          setUserEmail(user.email);
          
          // Automatically load user's saved data
          if (user) {
            try {
              // Load user's saved data
              const dataResponse = await fetch('/api/get-data', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: user?.email
                }),
              });

              const dataResult = await dataResponse.json();

              if (dataResult.success && dataResult.data) {
                if (dataResult.data.items && dataResult.data.items.length > 0) {
                  setGroceryItems(dataResult.data.items);
                  // Also populate pantry from the same items data
                  const pantryItemsFromGrocery: PantryItem[] = dataResult.data.items.map((item: any) => ({
                    name: item.item || item.name || 'Unknown item',
                    quantity: item.quantity || 'Unknown quantity',
                    category: item.category || 'other',
                    freshness: item.freshness || 'good',
                    detected_at: item.detected_at || new Date().toISOString()
                  }));
                  setPantryItems(pantryItemsFromGrocery);
                }
                if (dataResult.data.recipes && dataResult.data.recipes.length > 0) {
                  setRecipes(dataResult.data.recipes);
                }
              }

              // Load chat history
              const chatResponse = await fetch('/api/chat-history', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: user?.email
                }),
              });

              const chatResult = await chatResponse.json();

              if (chatResult.success && chatResult.chat_history && chatResult.chat_history.length > 0) {
                // Convert chat history to Message format
                const chatMessages: Message[] = chatResult.chat_history.map((msg: any, index: number) => ({
                  id: `loaded-${index}-${Date.now()}`,
                  text: msg.message,
                  sender: msg.sender as 'user' | 'nova',
                  timestamp: new Date(msg.timestamp || Date.now()),
                  hasImage: !!msg.image_data,
                  imageUrl: msg.image_data ? `data:image/${msg.image_format || 'jpeg'};base64,${msg.image_data}` : undefined,
                  structuredData: msg.sender === 'nova' && msg.message.includes('{') ? JSON.parse(msg.message) : undefined
                }));

                // Replace the initial welcome message with loaded chat history
                setMessages(chatMessages);
              }
            } catch (error) {
              console.error('Error loading user data:', error);
            }
          }
        }
      }
      setIsLoadingData(false);
    };
    
    loadUserData();
  }, []);

  // Auto-save data when grocery items, recipes, or pantry items change
  useEffect(() => {
    if (!isLoadingData && authService.isAuthenticated()) {
      const autoSave = async () => {
        const user = authService.getCurrentUser();
        if (user && (groceryItems.length > 0 || recipes.length > 0 || pantryItems.length > 0)) {
          try {
            // Convert pantry items back to grocery items format for saving
            const updatedGroceryItems = pantryItems.map(pantryItem => ({
              item: pantryItem.name,
              category: pantryItem.category,
              needed_for: 'pantry',
              priority: 'medium' as const,
              checked: false,
              quantity: pantryItem.quantity,
              freshness: pantryItem.freshness,
              detected_at: pantryItem.detected_at
            }));
            
            await fetch('/api/save-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user?.email,
                items: updatedGroceryItems,
                recipes: recipes,
              }),
            });
          } catch (error) {
            console.error('Error auto-saving data:', error);
          }
        }
      };

      // Debounce auto-save to avoid too many requests
      const timeoutId = setTimeout(autoSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [groceryItems, recipes, pantryItems, isLoadingData]);



  const uploadFridgePhoto = async (file: File) => {
    console.log('Starting fridge photo upload:', file.name, file.type, file.size);
    
    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Image too large. Maximum supported size is 100MB. Please compress or resize your image.');
      return;
    }
    
    // Check file format
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedFormats.includes(file.type.toLowerCase())) {
      alert('Unsupported image format. Please use JPEG, PNG, GIF, or WebP images.');
      return;
    }
    
    setIsFridgeMode(true);
    
    // Create image preview for user message
    const imagePreviewUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    console.log('Image preview created, length:', imagePreviewUrl.length);

    // Add user message showing the uploaded fridge photo
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: "📸 Uploaded fridge photo - analyzing ingredients and generating recipes...",
      sender: 'user',
      timestamp: new Date(),
      hasImage: true,
      imageUrl: imagePreviewUrl
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      console.log('Sending request to backend with imageBase64 length:', imageBase64.length);
      const user = authService.getCurrentUser();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Analyze this fridge photo and suggest recipes based on the ingredients you can see. List the ingredients first, then provide 2-3 recipe suggestions with cooking instructions.",
          imageBase64,
          imageFormat: file.type.split('/')[1],
          email: user?.email
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Check if response is structured data
        if (data.response && typeof data.response === 'object' && data.response.type === 'structured') {
          const structuredData = data.response.data;
          
          // Update grocery list, recipes, and pantry
          if (structuredData.grocery_list) {
            setGroceryItems(structuredData.grocery_list);
          }
          if (structuredData.recipes) {
            setRecipes(prevRecipes => {
              // Merge new recipes with existing ones, avoiding duplicates based on name
              const existingNames = prevRecipes.map(recipe => recipe.name.toLowerCase());
              const newRecipes = structuredData.recipes.filter((recipe: Recipe) => 
                !existingNames.includes(recipe.name.toLowerCase())
              );
              return [...prevRecipes, ...newRecipes];
            });
          }
          if (structuredData.ingredients) {
            // Convert detected ingredients to pantry items
            const pantryItemsFromIngredients: PantryItem[] = structuredData.ingredients.map((ingredient: any) => ({
              name: ingredient.name || 'Unknown ingredient',
              quantity: ingredient.quantity || 'Unknown quantity',
              category: ingredient.category || 'other',
              freshness: ingredient.freshness || 'good',
              detected_at: new Date().toISOString()
            }));
            setPantryItems(prev => {
              // Merge with existing pantry items, avoiding duplicates
              const existingNames = prev.map(item => item.name.toLowerCase());
              const newItems = pantryItemsFromIngredients.filter(item => 
                !existingNames.includes(item.name.toLowerCase())
              );
              return [...prev, ...newItems];
            });
          }
          
          // Switch to pantry tab to show detected ingredients
          setActiveTab('pantry');
          
          const novaMessage: Message = {
            id: `nova-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: `I've analyzed your fridge! I found ${structuredData.ingredients?.length || 0} ingredients and created ${structuredData.recipes?.length || 0} recipes for you. Check out the Pantry, Grocery List, and Recipes tabs!`,
            sender: 'nova',
            timestamp: new Date(),
            structuredData: structuredData
          };
          setMessages(prev => [...prev, novaMessage]);
        } else {
          // Regular text response - normalize it to handle objects
          const responseText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response, null, 2);
          const novaMessage: Message = {
            id: `nova-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: responseText,
            sender: 'nova',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, novaMessage]);
        }
      } else {
        console.error('Backend error:', data);
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error analyzing fridge photo:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: 'Sorry, I encountered an error analyzing your fridge photo. Please try again.',
        sender: 'nova',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsFridgeMode(false);
    }
  };


  const handleSignOut = async () => {
    await authService.signOut();
    setGroceryItems([]);
    setRecipes([]);
    onSignOut();
  };


  


  // Show loading screen while loading user data
  if (isLoadingData) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        backgroundColor: '#f9fafb',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>Loading your data...</div>
        <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Please wait while we load your saved recipes and grocery lists</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ChopChop Fridge Analyzer
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
              Powered by Amazon Bedrock
              {userEmail && (
                <span style={{ marginLeft: '1rem', color: '#10b981' }}>
                  • Signed in as {userEmail}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* upload button moved to chat input area */}
            
            

            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', padding: '0 1rem' }}>
          {[
            { id: 'chat', label: 'Fridge', icon: '🍳' },
            { id: 'pantry', label: 'Pantry', icon: '🏠' },
            { id: 'grocery', label: 'Grocery List', icon: '🛒' },
            { id: 'recipes', label: 'Recipes', icon: '👨‍🍳' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.label} {tab.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'chat' && (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((message) => (
          <div
            key={message.id}
            style={{ display: 'flex', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              style={{
                maxWidth: '28rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: message.sender === 'user' ? '#2563eb' : 'white',
                color: message.sender === 'user' ? 'white' : '#1f2937',
                border: message.sender === 'user' ? 'none' : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '1.25rem', marginTop: '0.125rem' }}>
                {message.sender === 'nova' ? '🤖' : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                {message.hasImage && message.imageUrl && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <img
                      src={message.imageUrl}
                      alt="Uploaded"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.375rem' }}
                    />
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.25rem' }}>{message.text}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.25rem' }}>🤖</div>
              <div style={{ width: '1rem', height: '1rem', border: '2px solid #6b7280', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {isFridgeMode ? 'Analyzing your fridge and generating recipes...' : 'Analyzing your image...'}
              </span>
            </div>
          </div>
        )}
        
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === 'pantry' && (
          <Pantry 
            initialItems={pantryItems} 
            onUpdate={setPantryItems}
          />
        )}

        {activeTab === 'grocery' && (
          <GroceryList 
            initialItems={groceryItems} 
            onUpdate={setGroceryItems}
          />
        )}

        {activeTab === 'recipes' && (
          <Recipes 
            recipes={recipes} 
            pantryItems={pantryItems}
            onRecipesGenerated={handleRecipesGenerated}
          />
        )}
      </div>

      {/* Upload buttons - only show in chat tab */}
      {activeTab === 'chat' && (
        <div style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    uploadFridgePhoto(file);
                  }
                };
                input.click();
              }}
              title="Upload Fridge Photo"
              aria-label="Upload Fridge Photo"
              disabled={isLoading}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              🍳 Upload Fridge Photo
            </button>
          </div>
        </div>
      )}


      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
