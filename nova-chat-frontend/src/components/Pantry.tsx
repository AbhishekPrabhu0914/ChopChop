'use client';

import { useState } from 'react';
import { PantryItem } from '../types/PantryItem';

type Freshness = 'fresh' | 'needs_use_soon' | 'expired';

interface PantryProps {
  initialItems: PantryItem[];
  onUpdate: (updatedItems: PantryItem[]) => void;
}

const pantryItems: PantryItem[] = [
  {
    id: '1',
    name: 'Tomatoes',
    quantity: '2 lbs',
    category: 'vegetables',
    freshness: 'fresh',
    detected_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Milk',
    quantity: '1 gallon',
    category: 'dairy',
    freshness: 'needs_use_soon',
    detected_at: '2024-01-10T12:30:00Z'
  },
  {
    id: '3',
    name: 'Chicken Breast',
    quantity: '3 pieces',
    category: 'meat',
    freshness: 'expired',
    detected_at: '2024-01-05T09:15:00Z'
  }
];

export default function Pantry({ initialItems, onUpdate }: PantryProps) {
  const [items, setItems] = useState<PantryItem[]>(initialItems);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: '',
    freshness: 'fresh' as Freshness
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      const item: PantryItem = {
        id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
          ? (crypto as Crypto).randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
      case 'needs_use_soon': return '#f59e0b'; // yellow
      case 'expired': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getFreshnessIcon = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return '🟢';
      case 'needs_use_soon': return '🟡';
      case 'expired': return '🔴';
      default: return '⚪';
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
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    freshness: e.target.value as 'fresh' | 'needs_use_soon' | 'expired', // Ensure type compatibility
                  })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="fresh">Fresh</option>
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
              key={item.id || index}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                borderLeft: `4px solid ${getFreshnessColor(item.freshness)}`,
                transition: 'box-shadow 0.2s, transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>
                {getFreshnessIcon(item.freshness)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      border: '1px solid transparent',
                      background: 'transparent',
                      padding: '0.25rem 0.375rem',
                      borderRadius: '0.375rem',
                      minWidth: '120px'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  />
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#1f2937',
                    backgroundColor: '#e5e7eb',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px'
                  }}>
                    {item.category || 'uncategorized'}
                  </span>
                  {item.quantity && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#065f46',
                      backgroundColor: '#d1fae5',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px'
                    }}>
                      {item.quantity}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', flexWrap: 'wrap' }}>
                  <select
                    value={item.freshness}
                    onChange={(e) => handleUpdateItem(index, 'freshness', e.target.value)}
                    style={{
                      border: '1px solid #e5e7eb',
                      background: 'white',
                      fontSize: '0.875rem',
                      color: getFreshnessColor(item.freshness),
                      fontWeight: '600',
                      borderRadius: '0.375rem',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    <option value="fresh">Fresh</option>
                    <option value="needs_use_soon">Needs Use Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    Detected {new Date(item.detected_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRemoveItem(index)}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '2rem',
                  height: '2rem',
                  transition: 'background-color 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fecaca';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
                title="Remove item"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
