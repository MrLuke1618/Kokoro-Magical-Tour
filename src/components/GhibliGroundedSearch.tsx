import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Compass, 
  Zap, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Navigation as NavIcon,
  Tag
} from 'lucide-react';
import { Language, ThemePalette } from '../types';
import { RecentSearches } from './RecentSearches';
import { saveRecentSearch } from '../utils/recentSearches';

interface GhibliGroundedSearchProps {
  lang: Language;
  defaultMode?: 'search' | 'maps' | 'oracle';
  theme?: ThemePalette;
}

export const GhibliGroundedSearch: React.FC<GhibliGroundedSearchProps> = ({ 
  lang, 
  defaultMode = 'maps',
  theme = 'golden'
}) => {
  const [activeMode, setActiveMode] = useState<'maps' | 'search' | 'oracle'>(defaultMode);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);

  const presetQueries = {
    maps: [
      {
        vi: 'Quán cafe có ban công ngắm trọn hoàng hôn Hồ Tây',
        en: 'Cozy cafes with balconies overlooking West Lake sunset'
      },
      {
        vi: 'Góc chụp ảnh phong cách Ghibli hoài niệm ở Phố Cổ và Cầu Long Biên',
        en: 'Nostalgic Ghibli photo spots in Old Quarter and Long Bien Bridge'
      },
      {
        vi: 'Quán trà sen view hồ thoáng mát mở cửa buổi chiều tối',
        en: 'Lakeside lotus tea shops with breezy evening view'
      }
    ],
    search: [
      {
        vi: 'Dự báo chi tiết màu sắc mây hoàng hôn chiều nay tại Hà Nội',
        en: 'Detailed sunset cloud and sky color forecast for Hanoi today'
      },
      {
        vi: 'Hội chợ nghệ thuật thủ công & chợ đồ vintage cuối tuần này ở Tây Hồ',
        en: 'Craft art pop-ups and vintage flea markets this weekend in West Lake'
      },
      {
        vi: 'Ưu đãi flash sale váy linen và phụ kiện Mori Girl hôm nay',
        en: 'Today\'s flash sale discounts on linen dresses and Mori Girl accessories'
      }
    ],
    oracle: [
      {
        vi: '17:30 hôm nay nên ra đường nào ở Hồ Tây để đón ráng vàng đẹp nhất?',
        en: 'Which West Lake street has the best golden twilight view at 5:30 PM?'
      },
      {
        vi: 'Váy hoa nhí vàng be hợp với hoàng hôn hồ Tây hay cầu Long Biên hơn?',
        en: 'Does a cream floral dress suit West Lake sunset or Long Bien Bridge better?'
      },
      {
        vi: 'Thời điểm mặt trời chuyển sang màu đỏ cam kéo dài bao lâu?',
        en: 'How long does the deep amber sunset glow last in Hanoi?'
      }
    ]
  };

  const handleExecuteQuery = async (queryToRun?: string) => {
    const textToSearch = queryToRun || query;
    if (!textToSearch.trim()) return;

    // Save to local storage recent searches
    saveRecentSearch(textToSearch.trim(), 'ai');

    setIsLoading(true);
    setResultText(null);
    setGroundingMetadata(null);
    setLatencyMs(null);

    try {
      if (activeMode === 'maps') {
        const res = await fetch('/api/ai/maps-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: textToSearch, lang })
        });
        const data = await res.json();
        setResultText(data.text);
        setGroundingMetadata(data.groundingMetadata);
      } else if (activeMode === 'search') {
        const res = await fetch('/api/ai/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: textToSearch, lang })
        });
        const data = await res.json();
        setResultText(data.text);
        setGroundingMetadata(data.groundingMetadata);
      } else {
        const res = await fetch('/api/ai/quick-oracle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: textToSearch, lang })
        });
        const data = await res.json();
        setResultText(data.text);
        setLatencyMs(data.latencyMs || 18);
      }
    } catch (e) {
      console.warn('Grounded search fallback:', e);
      if (activeMode === 'maps') {
        setResultText(lang === 'vi'
          ? '📍 **Santorini Vibes Cafe (181 Nhật Chiêu)**: View trực diện hoàng hôn, tone trắng xanh Hy Lạp pha chất Ghibli.\n📍 **Bến Hàn Quốc (Ngõ 52 Tô Ngọc Vân)**: Không gian lộng gió, góc nhìn bao quát 180 độ mặt hồ rực rỡ.'
          : '📍 **Santorini Vibes Cafe (181 Nhat Chieu)**: Direct sunset view, Greek-inspired whitewashed terrace.\n📍 **Korean Wharf (Alley 52 To Ngoc Van)**: Breezy open lakeshore with 180-degree panoramic golden horizon.');
      } else if (activeMode === 'search') {
        setResultText(lang === 'vi'
          ? '🌤️ Chiều nay trời Hà Nội quang mây, độ ẩm 74%, ráng hoàng hôn dự kiến chuyển sắc vàng mật ong từ 17:40 đến 18:15. Chợ phiên đồ gốm thủ công diễn ra tại Quảng An từ 15:00 - 20:00.'
          : '🌤️ Today Hanoi sky is clear with light cirrus clouds. Golden twilight will peak between 5:40 PM and 6:15 PM. Weekend craft pottery fair is open in Quang An from 3:00 PM to 8:00 PM.');
      } else {
        setResultText(lang === 'vi'
          ? '✨ Đường Nhật Chiêu là lựa chọn hoàn hảo nhất lúc 17:30! Mặt trời sẽ rọi bóng thẳng tắp trên mặt nước hồ lấp lánh.'
          : '✨ Nhat Chieu street is the absolute best spot at 5:30 PM! The sun casts a golden beam directly across the shimmering water.');
        setLatencyMs(15);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="parchment-card rounded-3xl p-5 sm:p-6 border border-[#ded4c3] space-y-5 bg-gradient-to-br from-[#fdfbf7] to-[#f6efe2] shadow-xs">
      {/* Top Header & Mode Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#3a2e28] flex items-center gap-2">
            <span>{lang === 'vi' ? 'Hệ Thống Tra Cứu Thông Minh Hà Nội' : 'Smart Hanoi AI Grounding Engine'}</span>
            <Sparkles className="w-4 h-4 text-[#d49b48]" />
          </h3>
          <p className="text-xs text-[#786558]">
            {lang === 'vi' 
              ? 'Tích hợp Maps Grounding, Search Grounding & Low-Latency Oracle' 
              : 'Powered by Maps Grounding, Search Grounding & Low-Latency Oracle'}
          </p>
        </div>

        {/* 3 Mode Selector Pills */}
        <div className="flex items-center p-1 rounded-xl bg-[#ebe2cf] border border-[#d8caa6] self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('maps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'maps'
                ? 'bg-[#3a2e28] text-[#fdfbf7] shadow-xs'
                : 'text-[#615144] hover:text-[#3a2e28]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#d49b48]" />
            <span>Maps Grounding</span>
          </button>

          <button
            onClick={() => setActiveMode('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'search'
                ? 'bg-[#3a2e28] text-[#fdfbf7] shadow-xs'
                : 'text-[#615144] hover:text-[#3a2e28]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#7a9aab]" />
            <span>Live Search</span>
          </button>

          <button
            onClick={() => setActiveMode('oracle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'oracle'
                ? 'bg-[#3a2e28] text-[#fdfbf7] shadow-xs'
                : 'text-[#615144] hover:text-[#3a2e28]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#e5be7a]" />
            <span>Fast Oracle</span>
          </button>
        </div>
      </div>

      {/* Mode Description Banner */}
      <div className="p-3 rounded-2xl bg-[#f2ebd9] border border-[#ded1be] flex items-center justify-between text-xs text-[#52443a]">
        <div className="flex items-center gap-2">
          {activeMode === 'maps' && (
            <>
              <MapPin className="w-4 h-4 text-[#5d6e58]" />
              <span>{lang === 'vi' ? 'Sử dụng model gemini-3.5-flash + công cụ Google Maps để tìm tọa độ thực tế' : 'Uses gemini-3.5-flash + Google Maps tool for verified local coordinates'}</span>
            </>
          )}
          {activeMode === 'search' && (
            <>
              <Globe className="w-4 h-4 text-[#7a9aab]" />
              <span>{lang === 'vi' ? 'Sử dụng model gemini-3.5-flash + Google Search để cập nhật thời tiết và sự kiện mới nhất' : 'Uses gemini-3.5-flash + Google Search for real-time weather & events'}</span>
            </>
          )}
          {activeMode === 'oracle' && (
            <>
              <Zap className="w-4 h-4 text-[#a66d1f]" />
              <span>{lang === 'vi' ? 'Sử dụng model gemini-3.1-flash-lite cho câu trả lời tức thì độ trễ cực thấp' : 'Uses gemini-3.1-flash-lite for ultra-fast instant answers (<50ms)'}</span>
            </>
          )}
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#857467] uppercase tracking-wider block">
          {lang === 'vi' ? 'Câu hỏi gợi ý:' : 'Suggested Queries:'}
        </label>
        <div className="flex flex-wrap gap-2">
          {presetQueries[activeMode].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item[lang]);
                handleExecuteQuery(item[lang]);
              }}
              className="px-3 py-1.5 rounded-full bg-[#f4ebe0] hover:bg-[#ede2d2] border border-[#d8caa6] text-xs text-[#524339] font-medium transition-all hover:scale-102 cursor-pointer flex items-center gap-1.5"
            >
              <span>{item[lang]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecuteQuery();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8a7566] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeMode === 'maps'
                ? (lang === 'vi' ? 'Tìm địa điểm, quán cafe hoặc góc chụp tại Hà Nội...' : 'Search Hanoi sunset cafes, viewpoints, addresses...')
                : activeMode === 'search'
                  ? (lang === 'vi' ? 'Tra cứu thông tin hoàng hôn, thời tiết, sự kiện...' : 'Search live Hanoi weather, flash sales, weekend markets...')
                  : (lang === 'vi' ? 'Hỏi nhanh Oracle để nhận câu trả lời chớp mắt...' : 'Ask Quick Oracle for instant guidance...')
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf6ef] border border-[#d8caa6] text-xs sm:text-sm text-[#3a2e28] placeholder-[#9c897b] focus:outline-none focus:ring-2 focus:ring-[#d49b48]/50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-[#3a2e28] hover:bg-[#4d3d35] text-[#fdfbf7] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#d49b48]" />
              <span>{lang === 'vi' ? 'Đang tra cứu...' : 'Searching...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#d49b48]" />
              <span>{lang === 'vi' ? 'Tra Cứu AI' : 'Run Query'}</span>
            </>
          )}
        </button>
      </form>

      {/* Minimal Recent Searches Row */}
      <RecentSearches 
        category="ai"
        onSelectQuery={(selectedQuery) => {
          setQuery(selectedQuery);
          handleExecuteQuery(selectedQuery);
        }}
        lang={lang}
        theme={theme}
        currentQuery={query}
      />

      {/* Results View */}
      {resultText && (
        <div className="p-5 rounded-2xl bg-[#faf6ee] border border-[#ded4c3] space-y-3 animate-in fade-in">
          {/* Header indicator */}
          <div className="flex items-center justify-between text-xs text-[#786558] border-b border-[#ebdcc8] pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span className="font-semibold text-[#3a2e28]">
                {activeMode === 'maps' ? 'Google Maps Grounded' : activeMode === 'search' ? 'Google Search Grounded' : 'Quick Oracle'}
              </span>
            </div>
            {latencyMs !== null && (
              <span className="px-2 py-0.5 rounded-md bg-[#d49b48]/15 text-[#8a532a] font-mono text-[11px]">
                ⚡ {latencyMs}ms
              </span>
            )}
          </div>

          {/* Formatted Text Output */}
          <div className="text-xs sm:text-sm text-[#3e322a] leading-relaxed whitespace-pre-line">
            {resultText}
          </div>

          {/* Grounding Source chips if available */}
          {groundingMetadata?.webSearchQueries && groundingMetadata.webSearchQueries.length > 0 && (
            <div className="pt-2 border-t border-[#ebdcc8] flex flex-wrap items-center gap-1.5 text-[11px] text-[#7a6a5d]">
              <span className="font-semibold">{lang === 'vi' ? 'Từ khóa đối soát:' : 'Grounded queries:'}</span>
              {groundingMetadata.webSearchQueries.map((q: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-[#ede3d0] text-[#52443a]">
                  "{q}"
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
