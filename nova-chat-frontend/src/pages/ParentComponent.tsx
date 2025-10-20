import { useRef } from 'react';
import Pantry from '../components/Pantry';
import { PantryItem } from '../types/PantryItem';

export default function ParentComponent() {
  const cardsRef = useRef<HTMLDivElement>(null);

  const handlePantryUpdate = (updatedItems: PantryItem[]) => {
    console.log('Updated pantry items:', updatedItems);
  };

  const scrollToCards = () => {
    cardsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // No initial pantry items defined here; provide from real data source if needed
  const transformedPantryItems: PantryItem[] = [];

  return (
    <div>
      <h1>Parent Component</h1>
      <button onClick={scrollToCards}>Learn More</button>
      <div ref={cardsRef}>
        <Pantry 
          initialItems={transformedPantryItems} 
          onUpdate={handlePantryUpdate}
        />
      </div>
    </div>
  );
}
