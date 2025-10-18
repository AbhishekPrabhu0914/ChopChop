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

interface RecipesProps {
  recipes: Recipe[];
}

export default function Recipes({ recipes }: RecipesProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');

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

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
        👨‍🍳 Recipes
      </h2>

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRecipe.ingredients_needed.map((ingredient, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: ingredient.available ? '#f0fdf4' : '#fef2f2',
                        borderRadius: '0.375rem',
                        border: `1px solid ${ingredient.available ? '#bbf7d0' : '#fecaca'}`
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>
                        {ingredient.available ? '✅' : '❌'}
                      </span>
                      <span style={{ 
                        flex: 1,
                        textDecoration: ingredient.available ? 'none' : 'line-through',
                        color: ingredient.available ? '#166534' : '#991b1b'
                      }}>
                        {ingredient.amount} {ingredient.name}
                      </span>
                    </div>
                  ))}
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
    </div>
  );
}
