import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Trash2, ArrowUpRight } from 'lucide-react';
import { Language, ThemePalette } from '../types';
import { 
  getRecentSearches, 
  removeRecentSearchItem, 
  clearAllRecentSearches 
} from '../utils/recentSearches';

interface RecentSearchesProps {
  category?: 'all' | 'deals' | 'food' | 'sunset' | 'photomap' | 'ai';
  onSelectQuery: (query: string) => void;
  lang: Language;
  theme?: ThemePalette;
  className?: string;
  maxDisplay?: number;
  currentQuery?: string;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  category = 'all',
  onSelectQuery,
  lang,
  theme = 'golden',
  className = '',
  maxDisplay = 6,
  currentQuery
}) => {
  const [searches, setSearches] = useState<string[]>([]);
  const isTwilight = theme === 'twilight';

  const loadSearches = () => {
    const list = getRecentSearches(category);
    setSearches(list);
  };

  useEffect(() => {
    loadSearches();
    // Listen to custom window storage event or update when currentQuery changes
    const handleStorageChange = () => loadSearches();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [category, currentQuery]);

  const handleRemove = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = removeRecentSearchItem(item, category);
    setSearches(updated);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllRecentSearches(category);
    setSearches([]);
  };

  if (searches.length === 0) {
    return null; // Keep UI completely uncluttered when empty
  }

  const displayedSearches = searches.slice(0, maxDisplay);

  return (
    <div className={`space-y-1.5 py-1 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#857467] tracking-wider uppercase">
          <History className={`w-3 h-3 ${isTwilight ? 'text-[#38bdf8]' : 'text-[#d49b48]'}`} />
          <span>{lang === 'vi' ? 'Tìm kiếm gần đây' : 'Recent Searches'}</span>
        </div>

        <button
          onClick={handleClearAll}
          className={`text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
            isTwilight 
              ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e2f50]' 
              : 'text-[#8a7566] hover:text-[#99472e] hover:bg-[#ede2cf]'
          }`}
          title={lang === 'vi' ? 'Xóa toàn bộ lịch sử tìm kiếm' : 'Clear all recent searches'}
        >
          <Trash2 className="w-2.5 h-2.5 opacity-70" />
          <span>{lang === 'vi' ? 'Xóa tất cả' : 'Clear'}</span>
        </button>
      </div>

      {/* Pill items scrollable / wrap */}
      <div className="flex flex-wrap items-center gap-1.5">
        <AnimatePresence mode="popLayout">
          {displayedSearches.map((item) => (
            <motion.div
              key={item}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              onClick={() => onSelectQuery(item)}
              className={`group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-normal transition-all cursor-pointer border shadow-2xs ${
                isTwilight
                  ? 'bg-[#182744] hover:bg-[#20345b] text-[#cbd5e1] hover:text-[#f8fafc] border-[#24375b] hover:border-[#38bdf8]/40'
                  : 'bg-[#f6ede0] hover:bg-[#eee1cd] text-[#52443a] hover:text-[#3a2e28] border-[#dfd4c0] hover:border-[#c7b9a5]'
              }`}
            >
              <span className="truncate max-w-[170px] sm:max-w-[240px]">{item}</span>
              
              <button
                type="button"
                onClick={(e) => handleRemove(e, item)}
                className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                  isTwilight
                    ? 'text-[#94a3b8] hover:text-[#fb7185] hover:bg-[#2b4168]'
                    : 'text-[#9c897b] hover:text-[#99472e] hover:bg-[#ded1be]'
                }`}
                title={lang === 'vi' ? 'Xóa' : 'Remove'}
                aria-label={`Remove search query ${item}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
