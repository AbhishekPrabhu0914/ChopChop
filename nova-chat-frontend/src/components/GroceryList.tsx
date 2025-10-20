import React, { useState, useEffect } from 'react';

interface GroceryItem {
  item: string;
  category: string;
  needed_for: string;
  priority: 'high' | 'medium' | 'low';
  checked: boolean;
}

interface GroceryListProps {
  initialItems: GroceryItem[];
  onUpdate: (items: GroceryItem[]) => void;
}

export default function GroceryList({ initialItems, onUpdate }: GroceryListProps) {
  const [items, setItems] = useState<GroceryItem[]>(initialItems);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    onUpdate(items);
  }, [items, onUpdate]);

  const addItem = () => {
    if (newItem.trim()) {
      const item: GroceryItem = {
        item: newItem.trim(),
        category: newCategory || 'other',
        needed_for: 'manual',
        priority: 'medium',
        checked: false
      };
      setItems([...items, item]);
      setNewItem('');
      setNewCategory('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const toggleChecked = (index: number) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    ));
  };

  const updateItem = (index: number, field: keyof GroceryItem, value: string) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.priority === filter;
  });

  const categories = ['vegetables', 'fruits', 'dairy', 'meat', 'poultry', 'seafood', 'grains', 'condiments', 'beverages', 'snacks', 'other'];

  const generateAmazonSearchUrl = (itemName: string) => {
    const encodedItem = encodeURIComponent(itemName);
    return `https://www.amazon.com/s?k=${encodedItem}`;
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          🛒 Grocery List
        </h2>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Manage your grocery items and track what you need to buy.
      </p>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { key: 'all', label: 'All', count: items.length },
          { key: 'high', label: 'High Priority', count: items.filter(item => item.priority === 'high').length },
          { key: 'medium', label: 'Medium Priority', count: items.filter(item => item.priority === 'medium').length },
          { key: 'low', label: 'Low Priority', count: items.filter(item => item.priority === 'low').length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'high' | 'medium' | 'low')}
            style={{
              backgroundColor: filter === key ? '#3b82f6' : 'white',
              color: filter === key ? 'white' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Add new item */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem', 
        borderRadius: '0.5rem', 
        marginBottom: '1rem',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
          Add New Item
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Item name"
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              minWidth: '120px'
            }}
          >
            <option value="">Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            style={{
              backgroundColor: newItem.trim() ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: newItem.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            {filter === 'all' ? 'Your grocery list is empty' : `No ${filter} priority items`}
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            {filter === 'all' ? 'Add items to get started with your grocery list.' : 'Try a different filter or add some items.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredItems.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: item.checked ? 0.6 : 1,
                textDecoration: item.checked ? 'line-through' : 'none'
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleChecked(index)}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer'
                }}
              />
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => updateItem(index, 'item', e.target.value)}
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
                    {item.category}
                  </span>
                  <select
                    value={item.priority}
                    onChange={(e) => updateItem(index, 'priority', e.target.value)}
                    style={{
                      fontSize: '0.75rem',
                      border: 'none',
                      background: 'transparent',
                      color: item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f59e0b' : '#10b981',
                      fontWeight: '500'
                    }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Needed for: {item.needed_for}</span>
                  <span>•</span>
                  <a
                    href={generateAmazonSearchUrl(item.item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    title={`Search for ${item.item} on Amazon`}
                  >
                    🛒 Search Amazon
                  </a>
                </div>
              </div>
              
              <button
                onClick={() => removeItem(index)}
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
    </div>
  );
}