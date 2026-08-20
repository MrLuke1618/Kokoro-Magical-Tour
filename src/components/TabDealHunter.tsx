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
  Layers, 
  Shirt, 
  Palette,
  Check,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Copy,
  ChevronRight,
  Zap,
  DollarSign,
  BookOpen,
  Maximize2
} from 'lucide-react';
import { Language, DealItem, ThemePalette } from '../types';
import { DEAL_ITEMS } from '../data/mockData';
import { GhibliVisionAnalyzer } from './GhibliVisionAnalyzer';
import { GhibliGroundedSearch } from './GhibliGroundedSearch';
import { RecentSearches } from './RecentSearches';
import { LocationRecommendationCard } from './LocationRecommendationCard';
import { CardFocusModal } from './CardFocusModal';
import { saveRecentSearch } from '../utils/recentSearches';

interface TabDealHunterProps {
  lang: Language;
  theme?: ThemePalette;
}

export const TabDealHunter: React.FC<TabDealHunterProps> = ({ lang, theme = 'golden' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [savedDeals, setSavedDeals] = useState<string[]>(['deal-1', 'deal-2']); // default saved items to demonstrate feature
  const [showSavedDrawer, setShowSavedDrawer] = useState<boolean>(false);
  const [copiedList, setCopiedList] = useState<boolean>(false);
  const [activeOutfitMood, setActiveOutfitMood] = useState<'autumn' | 'summer' | 'rain'>('autumn');
  const [aiBundleNotice, setAiBundleNotice] = useState<string | null>(null);
  const [focusCardIndex, setFocusCardIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', labelVi: 'Tất Cả Deal Hot', labelEn: 'All Hot Deals' },
    { id: 'Váy Linen Thơ Thẩn', labelVi: 'Váy Linen Thơ Thẩn', labelEn: 'Dreamy Linen Dresses' },
    { id: 'Sổ Tay & Art Supplies', labelVi: 'Sổ Tay & Art Supplies', labelEn: 'Sketchbooks & Art' },
    { id: 'Skincare Lành Tính', labelVi: 'Skincare Lành Tính', labelEn: 'Gentle Skincare' },
    { id: 'Phụ Kiện Ghibli', labelVi: 'Phụ Kiện Ghibli', labelEn: 'Ghibli Accessories' },
    { id: 'Mũ Cói & Phụ Kiện', labelVi: 'Mũ Cói & Phụ Kiện', labelEn: 'Straw Hats & Bags' },
    { id: 'Máy Ảnh Film', labelVi: 'Máy Ảnh Film', labelEn: 'Vintage Film Cameras' },
  ];

  const filteredDeals = useMemo(() => {
    return DEAL_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
      const matchQuery = 
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aestheticTag.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategory && matchPlatform && matchQuery;
    });
  }, [searchQuery, selectedCategory, selectedPlatform]);

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

  const getPlatformUrl = (platform: 'Lazada' | 'TikTok Shop' | string, keyword: string) => {
    const encoded = encodeURIComponent(keyword);
    if (platform === 'TikTok Shop') {
      return `https://www.tiktok.com/search?q=${encoded}`;
    }
    return `https://www.lazada.vn/catalog/?q=${encoded}`;
  };

  const copySavedList = () => {
    if (savedDealItems.length === 0) return;
    const text = savedDealItems.map((item, idx) => 
      `${idx + 1}. ${item.title} - ${item.salePrice.toLocaleString('vi-VN')}đ (Lazada / TikTok Shop)`
    ).join('\n') + `\nTổng cộng: ${totalSavedPrice.toLocaleString('vi-VN')}đ (Tiết kiệm ${(totalOriginalPrice - totalSavedPrice).toLocaleString('vi-VN')}đ)`;
    
    navigator.clipboard.writeText(text);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2200);
  };

  // 1-Click AI Bundle & Style Recommendation (Generates fresh unique advice)
  const [isGeneratingAiDeal, setIsGeneratingAiDeal] = useState(false);
  const [dynamicAiDealTip, setDynamicAiDealTip] = useState<string>(
    lang === 'vi'
      ? 'Váy linen suông màu kem nhạt kết hợp túi cói đan tay là lựa chọn tối ưu cho thời tiết Hà Nội chiều nay. Chất vải thoáng khí không nhăn gắt khi ngồi ngắm hoàng hôn.'
      : 'A breathable cream linen shift dress paired with a woven straw tote is the most sensible choice for Hanoi today. Breathable, relaxed, and photogenic.'
  );

  const handleAiQuickSuggest = async () => {
    setIsGeneratingAiDeal(true);
    const moods: ('autumn' | 'summer' | 'rain')[] = ['autumn', 'summer', 'rain'];
    const nextMood = moods[Math.floor(Math.random() * moods.length)];
    setActiveOutfitMood(nextMood);

    // Pick top 2-3 matching deals
    const randomPick = DEAL_ITEMS.slice(0, 3).map(d => d.id);
    setSavedDeals(randomPick);

    try {
      const res = await fetch('/api/ai/deal-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          mood: nextMood,
          lang,
          seed: Date.now() + Math.floor(Math.random() * 1000)
        })
      });
      const data = await res.json();
      if (data.text) {
        setDynamicAiDealTip(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiDeal(false);
    }
  };

  const outfitCoordinates = {
    autumn: {
      titleVi: 'Nữ Sinh Nghệ Thuật Thu Hà Nội (Shizuku Style)',
      titleEn: 'Hanoi Autumn Art Student (Shizuku Style)',
      topVi: 'Áo sơ mi cổ sen be sữa + Cardigan len mỏng màu quả hồng chín',
      topEn: 'Milk-beige Peter Pan blouse + Persimmon lightweight knit cardigan',
      bottomVi: 'Chân váy linen midi nâu đất xếp ly nhẹ',
      bottomEn: 'Earth-brown pleated midi linen skirt',
      accessoriesVi: 'Túi tote canvas Totoro + Giày Mary Jane + Sổ vẽ bìa da',
      accessoriesEn: 'Totoro canvas tote + Brown Mary Janes + Leather watercolor journal',
      keywordVi: 'váy midi linen nâu nữ cardigan vintage',
      keywordEn: 'brown linen midi skirt vintage cardigan'
    },
    summer: {
      titleVi: 'Thiếu Nữ Thơ Thẩn Hồ Tây Mùa Sen (Sophie Style)',
      titleEn: 'West Lake Lotus Bloom Sanctuary (Sophie Style)',
      topVi: 'Đầm xòe linen 2 dây màu trắng ngà mộc mạc',
      topEn: 'Ivory white airy linen slip dress',
      bottomVi: 'Khăn voan choàng vai họa tiết hoa nhí dại',
      bottomEn: 'Wildflower printed soft chiffon shawl',
      accessoriesVi: 'Mũ cói thắt nơ ruy băng nâu + Túi đan lục bình + Máy film Kodak',
      accessoriesEn: 'Ribbon straw cloche hat + Woven basket bag + Kodak film camera',
      keywordVi: 'đầm linen trắng vintage mũ cói',
      keywordEn: 'white linen dress vintage straw hat'
    },
    rain: {
      titleVi: 'Góc Ban Công Cà Phê Ngắm Mưa (Kiki Style)',
      titleEn: 'Rainy Cafe Porch Dreamer (Kiki Style)',
      topVi: 'Áo thun kẻ sọc xanh navy Pháp + Yếm váy kaki xanh rêu',
      topEn: 'French navy striped tee + Moss green utility pinafore',
      bottomVi: 'Tất len cổ ngắn trắng ngà',
      bottomEn: 'Cozy ivory ribbed ankle socks',
      accessoriesVi: 'Nơ nhung cài tóc đỏ burgundy + Ô trong suốt Ghibli',
      accessoriesEn: 'Burgundy velvet hair bow + Clear Ghibli umbrella',
      keywordVi: 'váy yếm kaki xanh rêu nữ vintage',
      keywordEn: 'moss green corduroy pinafore dress'
    }
  };

  const currentOutfit = outfitCoordinates[activeOutfitMood];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Location-Based Deals & Boutique Recommendations */}
      <LocationRecommendationCard
        category="deals"
        lang={lang}
        theme={theme}
      />

      {/* 1. Header & AI Deal Finder Banner with 1-Click AI Suggestion */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-7 border border-[#ded4c3] bg-gradient-to-br from-[#fbf8f2] via-[#faf4ea] to-[#f4ebe0] relative shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a66d1f] mb-1.5">
              <span className="w-5 h-5 rounded-[7px] bg-[#d49b48]/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#a66d1f]" />
              </span>
              <span>{lang === 'vi' ? 'AI Săn Sale & Deal Thời Trang' : 'AI Smart Style & Deal Finder'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-[#3a2e28]">
              {lang === 'vi' ? 'Săn Deal Thơ Thẩn & Phụ Kiện Nghệ Thuật' : 'Curated Deals & Aesthetic Lifestyle'}
            </h3>
            <p className="text-xs sm:text-sm text-[#736357] mt-1 max-w-xl leading-relaxed">
              {lang === 'vi'
                ? 'Tổng hợp flash sale từ Lazada & TikTok Shop không cần đăng nhập tài khoản phức tạp, dành riêng cho bạn yêu phong cách Ghibli.'
                : 'Aggregated flash sales across Lazada & TikTok Shop accessible seamlessly, specially curated for Ghibli aesthetic lovers.'}
            </p>
          </div>

          {/* Quick Action Badges: 1-Click AI & Saved Deals Counter */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
            {/* 1-Click AI Recommender Button */}
            <button
              id="ai-quick-deal-suggest-btn"
              onClick={handleAiQuickSuggest}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-[16px] bg-[#d49b48] hover:bg-[#be8737] active:scale-95 text-[#fdfbf7] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              title={lang === 'vi' ? 'AI tự động chọn combo phong cách & deal hời' : '1-Click AI Style & Bundle Match'}
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{lang === 'vi' ? '✨ AI Gợi Ý Set Đồ 1 Chạm' : '✨ 1-Click AI Bundle'}</span>
            </button>

            {/* Saved list toggle button */}
            <button
              id="toggle-saved-deals-btn"
              onClick={() => setShowSavedDrawer(!showSavedDrawer)}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-[16px] bg-[#f0e6d5] hover:bg-[#e4d8c3] active:scale-95 border border-[#d8caa6] text-[#3a2e28] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <BookmarkCheck className="w-4 h-4 text-[#99472e]" />
              <span>
                {lang === 'vi' ? `Đã Lưu (${savedDeals.length})` : `Saved (${savedDeals.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic AI Styling & Practical Advice Box */}
        <div className="mt-4 p-4 rounded-[18px] bg-[#fbf5eb] border border-[#e2d5be] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#d49b48]/20 flex items-center justify-center shrink-0 mt-0.5 text-xs">
              ✨
            </span>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#8a532a] uppercase tracking-wider block">
                {lang === 'vi' ? 'Lời Khuyên Phối Đồ AI Chiều Nay:' : 'AI Styling & Deal Tip for Today:'}
              </span>
              <p className="text-xs sm:text-sm text-[#3d2f26] font-medium leading-relaxed">
                {dynamicAiDealTip}
              </p>
            </div>
          </div>
          <button
            onClick={handleAiQuickSuggest}
            disabled={isGeneratingAiDeal}
            className="text-[11px] px-3 py-1.5 rounded-full bg-[#efe4d1] hover:bg-[#e4d6be] border border-[#d8caa6] text-[#52443a] font-semibold shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAiDeal ? '...' : (lang === 'vi' ? 'Đổi gợi ý' : 'Refresh')}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-5 space-y-2">
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
              placeholder={lang === 'vi' ? 'Tìm sổ tay giấy kraft vẽ màu nước 300 gam, váy linen, túi canvas Totoro, máy ảnh film...' : 'Search kraft watercolor sketchbook 300gsm, linen dresses, Totoro totes, film cameras...'}
              className="w-full pl-12 pr-4 py-3 rounded-[16px] bg-[#fdfbf7] border border-[#d8caa6] text-xs sm:text-sm text-[#3a2e28] placeholder-[#9c897b] focus:outline-none focus:ring-2 focus:ring-[#d49b48]/50 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2.5 py-1 rounded-[8px] bg-[#ede3d1] text-[#6b584d] hover:bg-[#ded1bd] font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Minimal Recent Searches Strip */}
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
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-all cursor-pointer border active:scale-97 ${
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

      {/* 2. Dedicated Saved Deals Drawer / Section */}
      {showSavedDrawer && (
        <div className="parchment-card rounded-[22px] p-5 sm:p-6 border-2 border-[#99472e]/30 bg-[#faf6ee] shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#e2d5be] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#99472e]/15 flex items-center justify-center">
                <BookmarkCheck className="w-4.5 h-4.5 text-[#99472e]" />
              </div>
              <div>
                <h4 className="font-serif-title font-bold text-base sm:text-lg text-[#3a2e28]">
                  {lang === 'vi' ? `Danh Sách Sản Phẩm Đã Lưu (${savedDealItems.length})` : `Saved Wishlist Items (${savedDealItems.length})`}
                </h4>
                <p className="text-xs text-[#736357]">
                  {lang === 'vi' ? 'Các món đồ thời trang & họa cụ bạn đã đánh dấu để mua sắm' : 'Items bookmarked for your Ghibli wardrobe & art collection'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copySavedList}
                disabled={savedDealItems.length === 0}
                className="px-3 py-1.5 rounded-[10px] bg-[#ede3cf] hover:bg-[#ded1bd] text-[#52443a] text-xs font-semibold flex items-center gap-1.5 border border-[#d8caa6] cursor-pointer disabled:opacity-50"
              >
                {copiedList ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedList ? (lang === 'vi' ? 'Đã chép danh sách' : 'Copied') : (lang === 'vi' ? 'Sao chép danh sách' : 'Copy list')}</span>
              </button>

              <button
                onClick={() => setShowSavedDrawer(false)}
                className="text-xs px-2.5 py-1.5 rounded-[10px] bg-[#ebe0cb] hover:bg-[#ded1bd] text-[#52443a] font-semibold cursor-pointer"
              >
                {lang === 'vi' ? 'Thu gọn ✕' : 'Close ✕'}
              </button>
            </div>
          </div>

          {savedDealItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#736357] italic">
              {lang === 'vi' ? 'Chưa có sản phẩm nào được lưu. Hãy bấm nút hình trái tim ở các sản phẩm bên dưới để thêm vào đây!' : 'No saved items yet. Click the heart icon on any deal card below to bookmark!'}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedDealItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-[16px] bg-[#fdfbf7] border border-[#e2d5be] flex items-center gap-3 shadow-2xs justify-between"
                  >
                    <div className={`w-14 h-14 rounded-[14px] bg-gradient-to-br ${item.gradientTheme || 'from-[#ecd6b7] to-[#b38550]'} flex items-center justify-center text-2xl shrink-0 border border-[#e2d5be] shadow-2xs`}>
                      <span>{item.iconEmoji || '🛍️'}</span>
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
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <a
                          href={getPlatformUrl('Lazada', lang === 'vi' ? item.title : item.titleEn)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-[6px] bg-[#000080]/10 hover:bg-[#000080]/20 text-[#000080] text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <span>Lazada</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href={getPlatformUrl('TikTok Shop', lang === 'vi' ? item.title : item.titleEn)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-[6px] bg-black/10 hover:bg-black/20 text-[#222] text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <span>TikTok</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveDeal(item.id)}
                      className="p-2 rounded-[10px] text-[#9c897b] hover:text-[#99472e] hover:bg-[#f5ede0] transition-colors cursor-pointer shrink-0"
                      title={lang === 'vi' ? 'Xoá khỏi danh sách lưu' : 'Remove from saved'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total & Summary bar */}
              <div className="p-3.5 rounded-[16px] bg-[#f0e7d6] border border-[#d8caa6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[#52443a]">
                    {lang === 'vi' ? 'Tổng giá trị combo:' : 'Total saved bundle:'}{' '}
                    <strong className="text-sm font-bold text-[#99472e]">{totalSavedPrice.toLocaleString('vi-VN')}đ</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#5d6e58]/20 text-[#2e3b2b] font-bold text-[11px]">
                    {lang === 'vi' 
                      ? `Tiết kiệm ${(totalOriginalPrice - totalSavedPrice).toLocaleString('vi-VN')}đ` 
                      : `Save ${(totalOriginalPrice - totalSavedPrice).toLocaleString('vi-VN')}đ`}
                  </span>
                </div>

                <button
                  onClick={copySavedList}
                  className="w-full sm:w-auto px-4 py-2 rounded-[12px] bg-[#3a2e28] hover:bg-[#4d3d35] text-[#fdfbf7] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Xuất / Sao Chép Toàn Bộ Danh Sách' : 'Export / Copy Full List'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Ghibli Vision Image & Outfit Analyzer */}
      <GhibliVisionAnalyzer lang={lang} />

      {/* 4. Live Deal & Style Grounding Engine */}
      <GhibliGroundedSearch lang={lang} defaultMode="search" theme={theme} />

      {/* 5. AI Style Coordinator Assistant: 3-Piece Ghibli Outfit Matcher */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-6 border-2 border-[#5d6e58]/30 bg-[#f9faf7] relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#5d6e58]/20 border border-[#5d6e58]/30 text-[#3e4c3a] flex items-center justify-center shadow-2xs">
              <Shirt className="w-4.5 h-4.5 stroke-[1.85]" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-base sm:text-lg text-[#3a2e28]">
                {lang === 'vi' ? 'AI Gợi Ý Set Đồ Nữ Chính Ghibli' : 'AI Ghibli Heroine Outfit Coordinator'}
              </h3>
              <p className="text-xs text-[#736357]">
                {lang === 'vi' ? 'Phối đồ hoàn hảo cho buổi chiều tà dạo bước Hồ Tây' : 'Perfect 3-piece coordination for evening lakeside walks'}
              </p>
            </div>
          </div>

          {/* Mood Tabs */}
          <div className="flex items-center gap-1 bg-[#ede6d8] p-1 rounded-[14px] border border-[#d8caa6]">
            <button
              onClick={() => setActiveOutfitMood('autumn')}
              className={`px-3 py-1 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer ${
                activeOutfitMood === 'autumn' ? 'bg-[#5d6e58] text-white shadow-xs' : 'text-[#5d4e44] hover:text-[#3a2e28]'
              }`}
            >
              {lang === 'vi' ? 'Thu Nhẹ' : 'Autumn'}
            </button>
            <button
              onClick={() => setActiveOutfitMood('summer')}
              className={`px-3 py-1 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer ${
                activeOutfitMood === 'summer' ? 'bg-[#5d6e58] text-white shadow-xs' : 'text-[#5d4e44] hover:text-[#3a2e28]'
              }`}
            >
              {lang === 'vi' ? 'Mùa Sen' : 'Lotus Vibe'}
            </button>
            <button
              onClick={() => setActiveOutfitMood('rain')}
              className={`px-3 py-1 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer ${
                activeOutfitMood === 'rain' ? 'bg-[#5d6e58] text-white shadow-xs' : 'text-[#5d4e44] hover:text-[#3a2e28]'
              }`}
            >
              {lang === 'vi' ? 'Mưa Êm' : 'Rainy Day'}
            </button>
          </div>
        </div>

        {/* Outfit breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-[18px] bg-[#fdfbf7] border border-[#e2d8c3]">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#8a532a] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#8a532a]/15 flex items-center justify-center">
                <Shirt className="w-2.5 h-2.5 text-[#8a532a]" />
              </span>
              <span>{lang === 'vi' ? '1. Áo / Đầm chính' : '1. Top / Main Dress'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3a2e28] font-medium leading-snug">
              {lang === 'vi' ? currentOutfit.topVi : currentOutfit.topEn}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#5d6e58] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#5d6e58]/15 flex items-center justify-center">
                <Layers className="w-2.5 h-2.5 text-[#5d6e58]" />
              </span>
              <span>{lang === 'vi' ? '2. Chân váy / Khăn khoác' : '2. Bottom / Shawl'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3a2e28] font-medium leading-snug">
              {lang === 'vi' ? currentOutfit.bottomVi : currentOutfit.bottomEn}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#7a9aab] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#7a9aab]/20 flex items-center justify-center">
                <Palette className="w-2.5 h-2.5 text-[#376178]" />
              </span>
              <span>{lang === 'vi' ? '3. Phụ kiện Ghibli' : '3. Ghibli Accessories'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3a2e28] font-medium leading-snug">
              {lang === 'vi' ? currentOutfit.accessoriesVi : currentOutfit.accessoriesEn}
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between flex-wrap gap-2 pt-1">
          <span className="text-xs text-[#736357] italic">
            ✨ {lang === 'vi' ? currentOutfit.titleVi : currentOutfit.titleEn}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={getPlatformUrl('Lazada', lang === 'vi' ? currentOutfit.keywordVi : currentOutfit.keywordEn)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-[14px] bg-[#5d6e58] hover:bg-[#4a5a46] text-[#fdfbf7] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>{lang === 'vi' ? 'Tìm trên Lazada' : 'Find on Lazada'}</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>

            <a
              href={getPlatformUrl('TikTok Shop', lang === 'vi' ? currentOutfit.keywordVi : currentOutfit.keywordEn)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-[14px] bg-[#3a2e28] hover:bg-[#4a3c35] text-[#fdfbf7] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-97"
            >
              <span>TikTok Shop</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>
          </div>
        </div>
      </div>

      {/* 6. Deal Product Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-serif-title font-bold text-[#3a2e28] flex items-center gap-2">
            <span className="w-6 h-6 rounded-[8px] bg-[#d49b48]/20 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-[#a66d1f]" />
            </span>
            <span>
              {lang === 'vi' 
                ? `Danh Sách Deal Nổi Bật (${filteredDeals.length})` 
                : `Active Flash Sale Items (${filteredDeals.length})`}
            </span>
          </h4>

          {savedDeals.length > 0 && (
            <button
              onClick={() => setShowSavedDrawer(true)}
              className="text-xs text-[#99472e] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? `Xem ${savedDeals.length} món đã lưu` : `View ${savedDeals.length} saved`}</span>
            </button>
          )}
        </div>

        {filteredDeals.length === 0 ? (
          <div className="parchment-card rounded-2xl p-8 text-center text-[#736357]">
            <p className="text-sm">{lang === 'vi' ? 'Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác nhé!' : 'No matching items found. Try another keyword!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map((deal: DealItem, idx: number) => {
              const isSaved = savedDeals.includes(deal.id);
              const targetSearchKeyword = lang === 'vi' ? deal.title : deal.titleEn;
              const lazadaUrl = getPlatformUrl('Lazada', targetSearchKeyword);
              const tiktokUrl = getPlatformUrl('TikTok Shop', targetSearchKeyword);

              return (
                <div
                  key={deal.id}
                  id={`deal-card-${deal.id}`}
                  className="parchment-card rounded-[20px] overflow-hidden border border-[#ded4c3] flex flex-col justify-between group hover:border-[#d49b48] transition-all duration-300 shadow-2xs hover:shadow-md"
                >
                  <div>
                    {/* Tactile Swatch Banner & Badges (No Web Placeholders) */}
                    <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${deal.gradientTheme || 'from-[#ecd6b7] to-[#b38550]'} flex flex-col items-center justify-center`}>
                      {/* Decorative pattern rings */}
                      <div className="absolute inset-0 bg-radial from-white/20 to-transparent pointer-events-none" />
                      <div className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                        {deal.iconEmoji || '✨'}
                      </div>

                      {/* Color swatches preview */}
                      {deal.colorSwatches && deal.colorSwatches.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                          {deal.colorSwatches.map((hex, sIdx) => (
                            <span 
                              key={sIdx} 
                              className="w-3 h-3 rounded-full border border-white/40 shadow-2xs" 
                              style={{ backgroundColor: hex }} 
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Flash sale tag */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-[10px] bg-[#99472e] text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5 backdrop-blur-xs">
                        <Flame className="w-3 h-3 text-[#f4d06f]" />
                        <span>-{deal.discountPercent}%</span>
                      </div>

                      {/* Top right: Platform Tag & Focus Mode Pill */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocusCardIndex(idx);
                          }}
                          className="px-2 py-1 rounded-[10px] bg-black/35 hover:bg-black/60 text-white text-[10px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          title={lang === 'vi' ? 'Mở chế độ đọc tập trung (Focus Mode)' : 'Open Focus Reading Mode'}
                        >
                          <BookOpen className="w-3 h-3 text-[#fcd34d]" />
                          <span>Focus</span>
                        </button>

                        <div className="px-2.5 py-1 rounded-[10px] bg-[#3a2e28]/85 text-white text-[10px] font-semibold backdrop-blur-xs shadow-xs">
                          {deal.platform}
                        </div>
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={() => toggleSaveDeal(deal.id)}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-full bg-[#fdfbf7]/90 text-[#3a2e28] hover:text-[#99472e] transition-all shadow-xs cursor-pointer active:scale-90"
                        title={lang === 'vi' ? 'Lưu vào danh sách thích' : 'Save to Wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#99472e] text-[#99472e]' : ''}`} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#736357]">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#ebe2d0] text-[#5c4a3e] font-semibold">
                          {lang === 'vi' ? deal.category : deal.categoryEn}
                        </span>
                        <div className="flex items-center gap-1 text-[#a66d1f] font-semibold px-2 py-0.5 rounded-full bg-[#faedd8]">
                          <Star className="w-3 h-3 fill-[#d49b48] text-[#d49b48]" />
                          <span>{deal.rating}</span>
                        </div>
                      </div>

                      <h5 className="font-semibold text-xs sm:text-sm text-[#3a2e28] line-clamp-2 leading-snug">
                        {lang === 'vi' ? deal.title : deal.titleEn}
                      </h5>

                      <div className="p-2.5 rounded-[12px] bg-[#f5ede0] border border-[#e5d8be] text-[11px] text-[#695140] italic flex items-center gap-1.5">
                        <span>🌸</span>
                        <span>{lang === 'vi' ? deal.aestheticTag : deal.aestheticTagEn}</span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base sm:text-lg font-bold text-[#99472e] font-serif-title">
                          {deal.salePrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-xs text-[#9c897b] line-through">
                          {deal.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Outbound Link Buttons & Focus Button */}
                  <div className="p-4 pt-0 space-y-2">
                    <button
                      onClick={() => setFocusCardIndex(idx)}
                      className="w-full py-2 px-3 rounded-[12px] bg-[#d49b48]/15 hover:bg-[#d49b48]/25 active:scale-[0.98] text-[#8a532a] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border border-[#d49b48]/35 shadow-2xs cursor-pointer"
                      title={lang === 'vi' ? 'Xem chi tiết trong Chế độ Focus' : 'Read full details in Focus Mode'}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#d49b48]" />
                      <span>{lang === 'vi' ? 'Đọc Chi Tiết (Focus Mode)' : 'Focus Mode Reading'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={lazadaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-[12px] bg-[#d49b48] hover:bg-[#be8737] active:scale-[0.98] text-[#fdfbf7] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        title={lang === 'vi' ? `Xem "${deal.title}" trên Lazada` : `View on Lazada`}
                      >
                        <ShoppingBag className="w-3 h-3 text-white" />
                        <span>Lazada</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                      </a>

                      <a
                        href={tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-[12px] bg-[#3a2e28] hover:bg-[#4d3d35] active:scale-[0.98] text-[#fdfbf7] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        title={lang === 'vi' ? `Xem "${deal.title}" trên TikTok Shop` : `View on TikTok Shop`}
                      >
                        <span>TikTok</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Distraction-Free Card Focus Mode Modal */}
      <CardFocusModal
        isOpen={focusCardIndex !== null}
        onClose={() => setFocusCardIndex(null)}
        type="deal"
        items={filteredDeals}
        currentIndex={focusCardIndex ?? 0}
        onIndexChange={setFocusCardIndex}
        lang={lang}
        theme={theme}
        isSaved={focusCardIndex !== null && filteredDeals[focusCardIndex] ? savedDeals.includes(filteredDeals[focusCardIndex].id) : false}
        onToggleSave={toggleSaveDeal}
      />
    </div>
  );
};
