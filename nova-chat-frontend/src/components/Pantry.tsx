'use client';

import { useState } from 'react';

interface PantryItem {
  name: string;
  quantity: string;
  category: string;
  freshness: 'fresh' | 'good' | 'needs_use_soon' | 'expired';
  detected_at: string;
}

interface PantryProps {
  initialItems: PantryItem[];
  onUpdate: (items: PantryItem[]) => void;
  onRecipesGenerated?: (recipes: any[]) => void;
}

interface RecipeGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (difficulty: string, timeConstraint: string) => void;
  isLoading: boolean;
}

const RecipeGenerationModal: React.FC<RecipeGenerationModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [difficulty, setDifficulty] = useState('Easy');
  const [timeConstraint, setTimeConstraint] = useState('30 minutes');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(difficulty, timeConstraint);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
          textAlign: 'center',
        }}>
          🍳 Generate Recipes
        </h2>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Tell us your preferences and we'll create recipes based on your available ingredients
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: 'white',
              }}
            >
              <option value="Easy">Easy - Simple recipes for beginners</option>
              <option value="Medium">Medium - Some cooking experience needed</option>
              <option value="Hard">Hard - Advanced techniques required</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Time Available
            </label>
            <select
              value={timeConstraint}
              onChange={(e) => setTimeConstraint(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: 'white',
              }}
            >
              <option value="15 minutes">15 minutes - Quick meals</option>
              <option value="30 minutes">30 minutes - Standard cooking time</option>
              <option value="45 minutes">45 minutes - More elaborate dishes</option>
              <option value="1 hour">1 hour - Complex recipes</option>
              <option value="2+ hours">2+ hours - Slow cooking or baking</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '0.375rem',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {isLoading ? 'Generating...' : 'Generate Recipes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Pantry({ initialItems, onUpdate, onRecipesGenerated }: PantryProps) {
  const [items, setItems] = useState<PantryItem[]>(initialItems);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: '',
    freshness: 'fresh' as const
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      const item: PantryItem = {
        ...newItem,
        detected_at: new Date().toISOString()
      };
      const updatedItems = [...items, item];
      setItems(updatedItems);
      onUpdate(updatedItems);
      setNewItem({ name: '', quantity: '', category: '', freshness: 'fresh' });
      setShowAddForm(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  const handleUpdateItem = (index: number, field: keyof PantryItem, value: string) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return '#10b981'; // green
      case 'good': return '#3b82f6'; // blue
      case 'needs_use_soon': return '#f59e0b'; // yellow
      case 'expired': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getFreshnessIcon = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return '🟢';
      case 'good': return '🔵';
      case 'needs_use_soon': return '🟡';
      case 'expired': return '🔴';
      default: return '⚪';
    }
  };

  const generateRecipes = async (difficulty: string, timeConstraint: string) => {
    if (!onRecipesGenerated) return;
    
    setIsGeneratingRecipes(true);
    setShowRecipeModal(false);
    
    try {
      const availableIngredients = items.map(item => item.name).join(', ');
      
      const prompt = `Based on these available ingredients: ${availableIngredients}

Please generate 3 recipes that:
- Are ${difficulty.toLowerCase()} difficulty
- Can be prepared in ${timeConstraint}
- Use primarily the available ingredients
- Include clear cooking instructions

Return the response as a JSON object with this structure:
{
  "type": "structured",
  "data": {
    "recipes": [
      {
        "name": "Recipe Name",
        "description": "Brief description",
        "cooking_time": "${timeConstraint}",
        "difficulty": "${difficulty}",
        "servings": "X servings",
        "ingredients_needed": [
          {
            "name": "ingredient name",
            "amount": "amount needed",
            "available": true/false
          }
        ],
        "instructions": ["step 1", "step 2", "step 3"],
        "tips": "Helpful cooking tip"
      }
    ]
  }
}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        try {
          const parsedResponse = JSON.parse(data.response);
          if (parsedResponse.type === 'structured' && parsedResponse.data.recipes) {
            onRecipesGenerated(parsedResponse.data.recipes);
            alert('Recipes generated successfully! Check the Recipes tab.');
          } else {
            throw new Error('Invalid response format');
          }
        } catch (parseError) {
          console.error('Error parsing recipe response:', parseError);
          alert('Generated recipes but had trouble parsing them. Check the chat for the response.');
        }
      } else {
        throw new Error('Failed to generate recipes');
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert('Sorry, I encountered an error generating recipes. Please try again.');
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  const categories = ['vegetables', 'fruits', 'dairy', 'meat', 'poultry', 'seafood', 'grains', 'condiments', 'beverages', 'snacks', 'other'];

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          🏠 Pantry
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowRecipeModal(true)}
            disabled={items.length === 0 || isGeneratingRecipes}
            style={{
              backgroundColor: items.length === 0 || isGeneratingRecipes ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: items.length === 0 || isGeneratingRecipes ? 'not-allowed' : 'pointer',
              opacity: items.length === 0 || isGeneratingRecipes ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isGeneratingRecipes ? '⏳' : '🍳'} Generate Recipes
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: '#3b82f6',
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
            ➕ Add Item
          </button>
        </div>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Track ingredients detected from your fridge photos and manually add items to your pantry.
      </p>

      {showAddForm && (
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Add New Item
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Item Name *
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Tomatoes"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Quantity
              </label>
              <input
                type="text"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                placeholder="e.g., 2 lbs"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Category
              </label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Freshness
              </label>
              <select
                value={newItem.freshness}
                onChange={(e) => setNewItem({ ...newItem, freshness: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="fresh">Fresh</option>
                <option value="good">Good</option>
                <option value="needs_use_soon">Needs Use Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleAddItem}
              disabled={!newItem.name.trim()}
              style={{
                backgroundColor: newItem.name.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: newItem.name.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Your pantry is empty
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            Upload a fridge photo or add items manually to start tracking your ingredients.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>
                {getFreshnessIcon(item.freshness)}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      border: 'none',
                      background: 'transparent',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      minWidth: '100px'
                    }}
                  />
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {item.category || 'uncategorized'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      minWidth: '80px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <select
                    value={item.freshness}
                    onChange={(e) => handleUpdateItem(index, 'freshness', e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.875rem',
                      color: getFreshnessColor(item.freshness),
                      fontWeight: '500'
                    }}
                  >
                    <option value="fresh">Fresh</option>
                    <option value="good">Good</option>
                    <option value="needs_use_soon">Needs Use Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                  <span style={{ fontSize: '0.75rem' }}>
                    Added {new Date(item.detected_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveItem(index)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '2rem',
                  height: '2rem'
                }}
                title="Remove item"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
      
      <RecipeGenerationModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onGenerate={generateRecipes}
        isLoading={isGeneratingRecipes}
      />
    </div>
  );
}
