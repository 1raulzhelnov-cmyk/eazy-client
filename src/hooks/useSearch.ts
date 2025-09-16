import { useState, useMemo } from 'react';

interface SearchFilters {
  cuisine: string[];
  priceRange: [number, number];
  rating: number;
  deliveryTime: number;
  sortBy: string;
}

interface SearchableItem {
  id: string;
  name: string;
  cuisine?: string;
  category?: string;
  price?: number;
  rating?: number;
  deliveryTime?: string;
  tags?: string[];
  description?: string;
}

const useSearch = <T extends SearchableItem>(items: T[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    cuisine: [],
    priceRange: [0, 50],
    rating: 0,
    deliveryTime: 0,
    sortBy: 'rating',
  });

  // Extract available cuisines from items
  const availableCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    items.forEach(item => {
      if (item.cuisine) cuisines.add(item.cuisine);
      if (item.category) cuisines.add(item.category);
    });
    return Array.from(cuisines).sort();
  }, [items]);

  // Parse delivery time string to number for comparison
  const parseDeliveryTime = (deliveryTime?: string): number => {
    if (!deliveryTime) return 999;
    const match = deliveryTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 999;
  };

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchLower) ||
        item.cuisine?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Cuisine filter
      if (filters.cuisine.length > 0) {
        const itemCuisine = item.cuisine || item.category;
        if (!itemCuisine || !filters.cuisine.includes(itemCuisine)) {
          return false;
        }
      }

      // Price range filter
      if (item.price !== undefined) {
        if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating > 0 && item.rating !== undefined) {
        if (item.rating < filters.rating) {
          return false;
        }
      }

      // Delivery time filter
      if (filters.deliveryTime > 0 && item.deliveryTime) {
        const itemDeliveryTime = parseDeliveryTime(item.deliveryTime);
        if (itemDeliveryTime > filters.deliveryTime) {
          return false;
        }
      }

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'delivery_time':
          return parseDeliveryTime(a.deliveryTime) - parseDeliveryTime(b.deliveryTime);
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'popularity':
          // Could be based on number of orders, for now use rating
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [items, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({
      cuisine: [],
      priceRange: [0, 50],
      rating: 0,
      deliveryTime: 0,
      sortBy: 'rating',
    });
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredAndSortedItems,
    availableCuisines,
    clearFilters,
  };
};

export default useSearch;