import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  ExternalLink, 
  Sparkles, 
  Star, 
  Heart, 
  Flame, 
  Check, 
  BookmarkCheck, 
  Trash2, 
  Copy, 
  Zap, 
  Maximize2,
  Globe
} from 'lucide-react';
import { Language, DealItem, ThemePalette } from '../types';
import { DEAL_ITEMS } from '../data/mockData';
import { GhibliVisionAnalyzer } from './GhibliVisionAnalyzer';
import { CardFocusModal } from './CardFocusModal';
import { RecentSearches } from './RecentSearches';
import { saveRecentSearch } from '../utils/recentSearches';

interface TabDealHunterProps {
  lang: Language;
  theme?: ThemePalette;
}

export const TabDealHunter: React.FC<TabDealHunterProps> = ({ lang, theme = 'golden' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savedDeals, setSavedDeals] = useState<string[]>(['deal-1', 'deal-2']);
  const [showSavedDrawer, setShowSavedDrawer] = useState<boolean>(false);
  const [copiedList, setCopiedList] = useState<boolean>(false);
  const [focusCardIndex, setFocusCardIndex] = useState<number | null>(null);

  // Feature 1 AI State
  const [isGeneratingAiDeal, setIsGeneratingAiDeal] = useState(false);
  const [groundingSources, setGroundingSources] = useState<{ title: string; uri: string }[]>([]);
  const [dynamicAiDealTip, setDynamicAiDealTip] = useState<string>(
    lang === 'vi'
      ? 'Váy linen suông dệt mộc tự nhiên 100% kết hợp túi cói đan tay là lựa chọn tối ưu cho thời tiết Hà Nội chiều nay: thoáng khí, không bết dính và giữ phom chuẩn khi dạo hồ.'
      : 'A 100% raw linen shift dress paired with a woven straw tote provides the ideal breathability and silhouette for Hanoi lakeside weather today.'
  );

  const categories = [
    { id: 'all', labelVi: 'Tất Cả', labelEn: 'All Items' },
    { id: 'Váy Linen Thơ Thẩn', labelVi: 'Váy Linen Mộc', labelEn: 'Raw Linen' },
    { id: 'Sổ Tay & Art Supplies', labelVi: 'Sổ Tay & Giấy Vẽ 300gsm', labelEn: 'Art Supplies' },
    { id: 'Skincare Lành Tính', labelVi: 'Dưỡng Ẩm Chiều Thu', labelEn: 'Skincare' },
    { id: 'Phụ Kiện Ghibli', labelVi: 'Phụ Kiện Ghibli', labelEn: 'Ghibli Goods' },
    { id: 'Mũ Cói & Phụ Kiện', labelVi: 'Mũ Cói & Túi Vải', labelEn: 'Straw & Canvas' },
    { id: 'Máy Ảnh Film', labelVi: 'Máy Ảnh Film & Lens', labelEn: 'Film Cameras' },
  ];

  const filteredDeals = useMemo(() => {
    return DEAL_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery = 
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aestheticTag.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategory && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  const savedDealItems = useMemo(() => {
    return DEAL_ITEMS.filter(d => savedDeals.includes(d.id));
  }, [savedDeals]);

  const totalSavedPrice = useMemo(() => {
    return savedDealItems.reduce((acc, item) => acc + item.salePrice, 0);
  }, [savedDealItems]);

  const totalOriginalPrice = useMemo(() => {
    return savedDealItems.reduce((acc, item) => acc + item.originalPrice, 0);
  }, [savedDealItems]);

  const toggleSaveDeal = (id: string) => {
    if (savedDeals.includes(id)) {
      setSavedDeals(savedDeals.filter(d => d !== id));
    } else {
      setSavedDeals([...savedDeals, id]);
    }
  };

  const getPlatformUrl = (platform: string, keyword: string) => {
    const encoded = encodeURIComponent(keyword);
    if (platform === 'TikTok Shop') {
      return `https://www.tiktok.com/search?q=${encoded}`;
    }
    return `https://www.lazada.vn/catalog/?q=${encoded}`;
  };

  const copySavedList = () => {
    if (savedDealItems.length === 0) return;
    const text = savedDealItems.map((item, idx) => 
      `${idx + 1}. ${item.title} - ${item.salePrice.toLocaleString('vi-VN')}đ`
    ).join('\n') + `\nTổng cộng: ${totalSavedPrice.toLocaleString('vi-VN')}đ (Tiết kiệm ${(totalOriginalPrice - totalSavedPrice).toLocaleString('vi-VN')}đ)`;
    
    navigator.clipboard.writeText(text);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2200);
  };

  const handleAiQuickSuggest = async () => {
    setIsGeneratingAiDeal(true);
    try {
      const res = await fetch('/api/ai/deal-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          mood: 'practical-elegant',
          lang,
          seed: Date.now()
        })
      });
      const data = await res.json();
      if (data.text) {
        setDynamicAiDealTip(data.text);
      }
      if (data.sources && Array.isArray(data.sources)) {
        setGroundingSources(data.sources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiDeal(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* FEATURE 1: Real-Time Grounded AI Deal & Material Advisor */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-6 border-2 border-[#d49b48]/35 bg-gradient-to-br from-[#fbf8f2] via-[#faf4ea] to-[#f4ebe0] relative shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a66d1f]">
            <span className="w-6 h-6 rounded-[8px] bg-[#d49b48]/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#a66d1f]" />
            </span>
            <span className="font-serif-title font-bold text-sm text-[#3a2e28]">
              {lang === 'vi' ? 'Trợ Lý AI Thẩm Định Chất Liệu & Deal Thực Tế' : 'Real-Time AI Material & Deal Advisor'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="ai-quick-deal-suggest-btn"
              onClick={handleAiQuickSuggest}
              disabled={isGeneratingAiDeal}
              className="px-4 py-2 rounded-[14px] bg-[#d49b48] hover:bg-[#be8737] active:scale-95 text-[#fdfbf7] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 fill-white ${isGeneratingAiDeal ? 'animate-spin' : ''}`} />
              <span>{lang === 'vi' ? 'Thẩm Định Deal Mới' : 'Find Live Deals'}</span>
            </button>

            <button
              onClick={() => setShowSavedDrawer(!showSavedDrawer)}
              className="px-3 py-2 rounded-[14px] bg-[#f0e6d5] hover:bg-[#e4d8c3] border border-[#d8caa6] text-[#3a2e28] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-[#99472e]" />
              <span>{lang === 'vi' ? `Giỏ Hàng (${savedDeals.length})` : `Cart (${savedDeals.length})`}</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-[16px] bg-[#fdfbf7] border border-[#e2d5be] space-y-2">
          <p className="text-xs sm:text-sm text-[#3d2f26] font-medium leading-relaxed">
            {dynamicAiDealTip}
          </p>

          {groundingSources.length > 0 && (
            <div className="pt-2 border-t border-[#e2d5be] flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#786558] font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#a66d1f]" />
                {lang === 'vi' ? 'Tìm kiếm thời gian thực:' : 'Live Grounding:'}
              </span>
              {groundingSources.slice(0, 3).map((src, idx) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#8a532a] hover:underline flex items-center gap-1 bg-[#ede1cb] px-2 py-0.5 rounded-md truncate max-w-[200px]"
                >
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{src.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <div className="relative">
            <div className="w-6 h-6 rounded-[8px] bg-[#d8caa6]/50 flex items-center justify-center absolute left-3.5 top-1/2 -translate-y-1/2">
              <Search className="w-3.5 h-3.5 text-[#5c4a3e]" />
            </div>
            <input
              type="text"
              id="deal-keyword-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  saveRecentSearch(searchQuery.trim(), 'deals');
                }
              }}
              onBlur={() => {
                if (searchQuery.trim()) {
                  saveRecentSearch(searchQuery.trim(), 'deals');
                }
              }}
              placeholder={lang === 'vi' ? 'Tìm váy linen mộc, sổ phác thảo 300gsm, máy ảnh film...' : 'Search raw linen dress, 300gsm watercolor journal, film camera...'}
              className="w-full pl-12 pr-4 py-2.5 rounded-[14px] bg-[#fdfbf7] border border-[#d8caa6] text-xs sm:text-sm text-[#3a2e28] placeholder-[#9c897b] focus:outline-none focus:ring-2 focus:ring-[#d49b48]/50 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-[8px] bg-[#ede3d1] text-[#6b584d] hover:bg-[#ded1bd] font-medium cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <RecentSearches
            category="deals"
            onSelectQuery={(query) => {
              setSearchQuery(query);
              saveRecentSearch(query, 'deals');
            }}
            lang={lang}
            theme={theme}
            currentQuery={searchQuery}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#3a2e28] text-[#fdfbf7] border-[#3a2e28] shadow-xs'
                  : 'bg-[#f5ece0] hover:bg-[#eae0d0] text-[#635348] border-[#dccea8]'
              }`}
            >
              {lang === 'vi' ? cat.labelVi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURE 2: AI Material & Outfit Visual Inspector */}
      <div className="space-y-2">
        <GhibliVisionAnalyzer lang={lang} />
      </div>

      {/* FEATURE 3: Discerning Curated Flash Deals Catalog with Focus Mode */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-serif-title font-bold text-[#3a2e28] flex items-center gap-2">
            <span className="w-6 h-6 rounded-[8px] bg-[#d49b48]/20 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-[#a66d1f]" />
            </span>
            <span>
              {lang === 'vi' 
                ? `Danh Mục Sản Phẩm Đã Thẩm Định (${filteredDeals.length})` 
                : `Verified Aesthetic Catalog (${filteredDeals.length})`}
            </span>
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((item, index) => {
            const isSaved = savedDeals.includes(item.id);
            return (
              <div 
                key={item.id}
                className="parchment-card rounded-[20px] overflow-hidden border border-[#ded4c3] bg-[#fdfbf7] flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
              >
                <div className={`p-4 bg-gradient-to-br ${item.gradientTheme} border-b border-[#ded4c3]/70 relative`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl p-2 rounded-xl bg-white/40 shadow-xs backdrop-blur-xs">
                      {item.iconEmoji}
                    </span>
                    <button
                      onClick={() => toggleSaveDeal(item.id)}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        isSaved 
                          ? 'bg-[#99472e] text-white shadow-xs' 
                          : 'bg-white/60 hover:bg-white text-[#52443a]'
                      }`}
                      title={isSaved ? (lang === 'vi' ? 'Bỏ lưu' : 'Unsave') : (lang === 'vi' ? 'Lưu sản phẩm' : 'Save deal')}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#52443a] px-2 py-0.5 rounded-full bg-white/60">
                      {lang === 'vi' ? item.category : item.categoryEn}
                    </span>
                    <span className="text-[10px] font-bold text-[#99472e] px-2 py-0.5 rounded-full bg-red-100 border border-red-200">
                      -{item.discountPercent}%
                    </span>
                  </div>

                  <h5 className="font-serif-title font-bold text-sm sm:text-base text-[#3a2e28] mt-1.5 line-clamp-2">
                    {lang === 'vi' ? item.title : item.titleEn}
                  </h5>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-bold text-[#99472e]">
                        {item.salePrice.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-xs text-[#9c897b] line-through">
                        {item.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#786558]">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {item.rating}
                      </span>
                      <span>•</span>
                      <span>{item.soldCount.toLocaleString('vi-VN')} {lang === 'vi' ? 'đã bán' : 'sold'}</span>
                    </div>

                    <p className="text-xs text-[#635348] italic pt-1 line-clamp-2">
                      "{lang === 'vi' ? item.aestheticTag : item.aestheticTagEn}"
                    </p>
                  </div>

                  {/* Actions: Focus Mode & Platform Buy */}
                  <div className="space-y-2 pt-2 border-t border-[#ded4c3]/60">
                    <button
                      onClick={() => setFocusCardIndex(index)}
                      className="w-full py-2 px-3 rounded-[12px] bg-[#ece2d0] hover:bg-[#dfd3bf] text-[#4a392e] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#d4caa6]"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#8a532a]" />
                      <span>{lang === 'vi' ? 'Xem Chi Tiết Focus Mode' : 'Focus Mode'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={getPlatformUrl('Lazada', lang === 'vi' ? item.title : item.titleEn)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-[12px] bg-[#000080]/10 hover:bg-[#000080]/20 text-[#000080] text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <span>Lazada</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={getPlatformUrl('TikTok Shop', lang === 'vi' ? item.title : item.titleEn)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-[12px] bg-black/10 hover:bg-black/20 text-[#222] text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <span>TikTok</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 4: Sketchbook Wishlist & Budget Manager */}
      <div className="parchment-card rounded-[22px] p-5 sm:p-6 border-2 border-[#99472e]/30 bg-[#faf6ee] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#e2d5be] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#99472e]/15 flex items-center justify-center">
              <BookmarkCheck className="w-4.5 h-4.5 text-[#99472e]" />
            </div>
            <div>
              <h4 className="font-serif-title font-bold text-base sm:text-lg text-[#3a2e28]">
                {lang === 'vi' ? `Giỏ Hàng & Ngân Sách Họa Cụ (${savedDealItems.length})` : `Wishlist & Budget Planner (${savedDealItems.length})`}
              </h4>
              <p className="text-xs text-[#736357]">
                {lang === 'vi' ? 'Quản lý danh sách sản phẩm đã lưu, tự động tính tổng tiền và mức tiết kiệm' : 'Manage saved items with automatic budget calculation and 1-click clipboard export'}
              </p>
            </div>
          </div>

          <button
            onClick={copySavedList}
            disabled={savedDealItems.length === 0}
            className="px-3.5 py-2 rounded-[12px] bg-[#3a2e28] hover:bg-[#4d3d35] text-[#fdfbf7] text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {copiedList ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedList ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép danh sách' : 'Copy Wishlist')}</span>
          </button>
        </div>

        {savedDealItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#736357] italic">
            {lang === 'vi' ? 'Chưa có sản phẩm nào trong giỏ. Nhấp biểu tượng trái tim để lưu lại món đồ yêu thích!' : 'Wishlist is empty. Click the heart icon on any card above to add items!'}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedDealItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-[16px] bg-[#fdfbf7] border border-[#e2d5be] flex items-center gap-3 shadow-2xs justify-between"
                >
                  <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${item.gradientTheme} flex items-center justify-center text-xl shrink-0 border border-[#e2d5be]`}>
                    <span>{item.iconEmoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-xs text-[#3a2e28] truncate">
                      {lang === 'vi' ? item.title : item.titleEn}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#99472e]">
                        {item.salePrice.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-[10px] text-[#9c897b] line-through">
                        {item.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSaveDeal(item.id)}
                    className="p-1.5 rounded-[8px] text-[#9c897b] hover:text-[#99472e] hover:bg-[#f5ede0] cursor-pointer shrink-0"
                    title={lang === 'vi' ? 'Xóa khỏi giỏ' : 'Remove item'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Budget Row */}
            <div className="p-3.5 rounded-[16px] bg-[#f0e7d6] border border-[#d8caa6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[#52443a]">
                  {lang === 'vi' ? 'Tổng thanh toán:' : 'Total checkout:'}{' '}
                  <strong className="text-sm font-bold text-[#99472e]">{totalSavedPrice.toLocaleString('vi-VN')}đ</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#5d6e58]/20 text-[#2e3b2b] font-bold text-[11px]">
                  {lang === 'vi' 
                    ? `Tiết kiệm ${(totalOriginalPrice - totalSavedPrice).toLocaleString('vi-VN')}đ (-${Math.round(((totalOriginalPrice - totalSavedPrice) / (totalOriginalPrice || 1)) * 100)}%)` 
                    : `Save ${(totalOriginalPrice - totalSavedPrice).toLocaleString('vi-VN')}đ`}
                </span>
              </div>

              <button
                onClick={copySavedList}
                className="w-full sm:w-auto px-4 py-2 rounded-[12px] bg-[#3a2e28] hover:bg-[#4d3d35] text-[#fdfbf7] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Xuất Danh Sách' : 'Export List'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Focus Mode Modal */}
      {focusCardIndex !== null && (
        <CardFocusModal
          items={filteredDeals}
          initialIndex={focusCardIndex}
          onClose={() => setFocusCardIndex(null)}
          lang={lang}
          type="deal"
        />
      )}
    </div>
  );
};
