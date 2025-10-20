export interface PantryItem {
    id: string;
  name: string;
  quantity: string;
  category: string;
  freshness: 'fresh' | 'needs_use_soon' | 'expired';
  detected_at: string;
}
