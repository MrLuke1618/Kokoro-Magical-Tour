export interface RecentSearchEntry {
  id: string;
  query: string;
  timestamp: number;
  category?: 'all' | 'deals' | 'food' | 'sunset' | 'photomap' | 'ai';
}

const STORAGE_KEY_PREFIX = 'hanoi_sunset_recent_queries';

export function getRecentSearches(category: string = 'all'): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${category}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => (typeof item === 'string' ? item : item.query)).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('Failed to read recent searches from localStorage:', err);
  }
  return [];
}

export function saveRecentSearch(query: string, category: string = 'all', maxItems: number = 8): string[] {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches(category);

  try {
    const current = getRecentSearches(category);
    // Remove if already exists (to bump it to front)
    const filtered = current.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, maxItems);
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_${category}`, JSON.stringify(updated));
    
    // Also save into general 'all' if category is specific
    if (category !== 'all') {
      const allList = getRecentSearches('all');
      const filteredAll = allList.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updatedAll = [trimmed, ...filteredAll].slice(0, 10);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_all`, JSON.stringify(updatedAll));
    }

    return updated;
  } catch (err) {
    console.warn('Failed to save recent search to localStorage:', err);
    return [];
  }
}

export function removeRecentSearchItem(query: string, category: string = 'all'): string[] {
  try {
    const current = getRecentSearches(category);
    const updated = current.filter(item => item.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_${category}`, JSON.stringify(updated));
    
    if (category !== 'all') {
      const allList = getRecentSearches('all');
      const updatedAll = allList.filter(item => item.toLowerCase() !== query.toLowerCase());
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_all`, JSON.stringify(updatedAll));
    }

    return updated;
  } catch (err) {
    console.warn('Failed to remove recent search item:', err);
    return [];
  }
}

export function clearAllRecentSearches(category: string = 'all'): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${category}`);
    if (category === 'all') {
      ['deals', 'food', 'sunset', 'photomap', 'ai'].forEach(cat => {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${cat}`);
      });
    }
  } catch (err) {
    console.warn('Failed to clear recent searches:', err);
  }
}
