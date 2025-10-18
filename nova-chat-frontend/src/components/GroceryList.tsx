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
        category: newCategory || 'general',
        needed_for: 'Manual addition',
        priority: 'medium',
        checked: false
      };
      setItems([...items, item]);
      setNewItem('');
      setNewCategory('');
    }
  };

  const toggleItem = (index: number) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const updateItem = (index: number, field: keyof GroceryItem, value: any) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const filteredItems = items.filter(item => 
    filter === 'all' || item.priority === filter
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'dairy': '#fef3c7',
      'vegetables': '#dcfce7',
      'meat': '#fecaca',
      'pantry': '#e0e7ff',
      'frozen': '#dbeafe',
      'general': '#f3f4f6'
    };
    return colors[category as keyof typeof colors] || '#f3f4f6';
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
        🛒 Grocery List
      </h2>

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
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category"
            style={{
              width: '120px',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
          <button
            onClick={addItem}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['all', 'high', 'medium', 'low'].map((priority) => (
          <button
            key={priority}
            onClick={() => setFilter(priority as any)}
            style={{
              backgroundColor: filter === priority ? '#3b82f6' : '#f3f4f6',
              color: filter === priority ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {priority} ({items.filter(item => priority === 'all' || item.priority === priority).length})
          </button>
        ))}
      </div>

      {/* Grocery items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredItems.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              opacity: item.checked ? 0.6 : 1
            }}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(index)}
              style={{ width: '1.25rem', height: '1.25rem' }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.25rem'
              }}>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '500',
                  textDecoration: item.checked ? 'line-through' : 'none'
                }}>
                  {item.item}
                </span>
                <span
                  style={{
                    backgroundColor: getPriorityColor(item.priority),
                    color: 'white',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {item.priority}
                </span>
                <span
                  style={{
                    backgroundColor: getCategoryColor(item.category),
                    color: '#374151',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}
                >
                  {item.category}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Needed for: {item.needed_for}
              </div>
            </div>

            <button
              onClick={() => removeItem(index)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          No items found. Add some items to your grocery list!
        </div>
      )}
    </div>
  );
}
