import React, { useState } from 'react';

interface RecipeIngredient {
  name: string;
  amount: string;
  available: boolean;
}

interface Recipe {
  name: string;
  description: string;
  cooking_time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: string;
  ingredients_needed: RecipeIngredient[];
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


interface RecipeGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (difficulty: string, timeConstraint: string, additionalNotes: string) => void;
  isLoading: boolean;
}

interface RecipesProps {
  recipes: Recipe[];
  pantryItems?: PantryItem[];
  onRecipesGenerated?: (recipes: Recipe[]) => void;
}


const RecipeGenerationModal: React.FC<RecipeGenerationModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [difficulty, setDifficulty] = useState('Easy');
  const [timeConstraint, setTimeConstraint] = useState('30 minutes');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(difficulty, timeConstraint, additionalNotes);
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
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                backgroundColor: isLoading ? '#f9fafb' : 'white',
              }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
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
              Time Constraint
            </label>
            <select
              value={timeConstraint}
              onChange={(e) => setTimeConstraint(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                backgroundColor: isLoading ? '#f9fafb' : 'white',
              }}
            >
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="45 minutes">45 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="1.5 hours">1.5 hours</option>
              <option value="2+ hours">2+ hours</option>
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
              Additional Notes (Optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., vegetarian, spicy, kid-friendly, etc."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                backgroundColor: isLoading ? '#f9fafb' : 'white',
                resize: 'vertical',
                minHeight: '80px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                backgroundColor: isLoading ? '#9ca3af' : '#10b981',
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

export default function Recipes({ recipes, pantryItems = [], onRecipesGenerated }: RecipesProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const filteredRecipes = recipes.filter(recipe => 
    filter === 'all' || recipe.difficulty === filter
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCookingTimeColor = (time: string) => {
    const minutes = parseInt(time.replace(/\D/g, ''));
    if (minutes <= 30) return '#10b981';
    if (minutes <= 60) return '#f59e0b';
    return '#ef4444';
  };

  const generateRecipes = async (difficulty: string, timeConstraint: string, additionalNotes: string = '') => {
    if (!onRecipesGenerated) return;
    
    setIsGeneratingRecipes(true);
    setShowRecipeModal(false);
    
    try {
      const availableIngredients = pantryItems.map(item => item.name).join(', ');
      
      let prompt = `Based on these available ingredients: ${availableIngredients}

Please generate 3 recipes that:
- Are ${difficulty.toLowerCase()} difficulty
- Can be prepared in ${timeConstraint}
- Use primarily the available ingredients
- Include clear cooking instructions`;

      if (additionalNotes.trim()) {
        prompt += `\n- Additional requirements: ${additionalNotes}`;
      }

      prompt += `

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
            // No alert - recipes are added directly to the page
          } else {
            throw new Error('Invalid response format');
          }
        } catch (parseError) {
          console.error('Error parsing recipe response:', parseError);
          // Still no alert - just log the error
        }
      } else {
        throw new Error('Failed to generate recipes');
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
      // No alert - just log the error
    } finally {
      setIsGeneratingRecipes(false);
    }
  };


  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          👨‍🍳 Recipes
        </h2>
        {pantryItems.length > 0 && onRecipesGenerated && (
          <button
            onClick={() => setShowRecipeModal(true)}
            disabled={isGeneratingRecipes}
            style={{
              backgroundColor: isGeneratingRecipes ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isGeneratingRecipes ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s',
            }}
          >
            {isGeneratingRecipes ? '⏳' : '🍳'} Generate Recipes
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['all', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setFilter(difficulty as any)}
            style={{
              backgroundColor: filter === difficulty ? '#3b82f6' : '#f3f4f6',
              color: filter === difficulty ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {difficulty} ({recipes.filter(recipe => difficulty === 'all' || recipe.difficulty === difficulty).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredRecipes.map((recipe, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div style={{ padding: '1rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                {recipe.name}
              </h3>
              
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginBottom: '0.75rem',
                lineHeight: '1.4'
              }}>
                {recipe.description}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    backgroundColor: getDifficultyColor(recipe.difficulty),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {recipe.difficulty}
                </span>
                <span
                  style={{
                    backgroundColor: getCookingTimeColor(recipe.cooking_time),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {recipe.cooking_time}
                </span>
                <span
                  style={{
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {recipe.servings}
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Ingredients:</strong> {recipe.ingredients_needed.length} items
                </div>
                <div>
                  <strong>Available:</strong> {recipe.ingredients_needed.filter(ing => ing.available).length}/{recipe.ingredients_needed.length}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          No recipes found. Upload a fridge photo to get recipe suggestions!
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
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
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
            >
              ×
            </button>

            <div style={{ padding: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                {selectedRecipe.name}
              </h2>

              <p style={{ 
                fontSize: '1rem', 
                color: '#6b7280', 
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {selectedRecipe.description}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span
                  style={{
                    backgroundColor: getDifficultyColor(selectedRecipe.difficulty),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {selectedRecipe.difficulty}
                </span>
                <span
                  style={{
                    backgroundColor: getCookingTimeColor(selectedRecipe.cooking_time),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {selectedRecipe.cooking_time}
                </span>
                <span
                  style={{
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {selectedRecipe.servings}
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
                  Ingredients
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* What you have */}
                  <div>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      marginBottom: '0.5rem', 
                      color: '#374151',
                      borderBottom: '2px solid #6b7280',
                      paddingBottom: '0.25rem'
                    }}>
                      ✅ What you have
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedRecipe.ingredients_needed
                        .filter(ingredient => ingredient.available)
                        .map((ingredient, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#f9fafb',
                              borderRadius: '0.375rem',
                              border: '1px solid #d1d5db',
                              color: '#374151'
                            }}
                          >
                            {ingredient.amount} {ingredient.name}
                          </div>
                        ))}
                      {selectedRecipe.ingredients_needed.filter(ingredient => ingredient.available).length === 0 && (
                        <div style={{ 
                          padding: '0.5rem', 
                          color: '#6b7280', 
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}>
                          No ingredients available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* What you need */}
                  <div>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      marginBottom: '0.5rem', 
                      color: '#374151',
                      borderBottom: '2px solid #6b7280',
                      paddingBottom: '0.25rem'
                    }}>
                      🛒 What you need
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedRecipe.ingredients_needed
                        .filter(ingredient => !ingredient.available)
                        .map((ingredient, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#f9fafb',
                              borderRadius: '0.375rem',
                              border: '1px solid #d1d5db',
                              color: '#374151'
                            }}
                          >
                            {ingredient.amount} {ingredient.name}
                          </div>
                        ))}
                      {selectedRecipe.ingredients_needed.filter(ingredient => !ingredient.available).length === 0 && (
                        <div style={{ 
                          padding: '0.5rem', 
                          color: '#6b7280', 
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}>
                          You have everything!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
                  Instructions
                </h3>
                <ol style={{ paddingLeft: '1.5rem' }}>
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index} style={{ 
                      marginBottom: '0.5rem', 
                      lineHeight: '1.5',
                      color: '#374151'
                    }}>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.tips && (
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
                    Tips
                  </h3>
                  <p style={{ 
                    padding: '0.75rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '0.375rem',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    lineHeight: '1.5'
                  }}>
                    {selectedRecipe.tips}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Generation Modal */}
      <RecipeGenerationModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onGenerate={generateRecipes}
        isLoading={isGeneratingRecipes}
      />

    </div>
  );
}
