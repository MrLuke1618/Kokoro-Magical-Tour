import React, { useState, useMemo } from 'react';
import { 
  Utensils, 
  Coffee, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  Music, 
  Copy, 
  Check, 
  Star, 
  HeartHandshake,
  Compass,
  Navigation,
  Zap,
  BookOpen,
  Maximize2,
  Globe,
  Flame,
  LocateFixed
} from 'lucide-react';
import { Language, FoodSpot, TasteMatchResult, ThemePalette } from '../types';
import { FOOD_SPOTS, TASTE_MATCHES } from '../data/mockData';
import { GhibliGroundedSearch } from './GhibliGroundedSearch';
import { LocationInspectorModal, SelectedLocationData } from './LocationInspectorModal';
import { CardFocusModal } from './CardFocusModal';
import { SketchbookQuickNote } from './SketchbookQuickNote';
import { useLocationWeather } from '../hooks/useLocationWeather';
import { sortSpotsByProximityAndPopularity, formatDistanceKm, estimateTravelMinutes } from '../utils/geoDistance';

interface TabHanoiCafesProps {
  lang: Language;
  theme?: ThemePalette;
}

export const TabHanoiCafes: React.FC<TabHanoiCafesProps> = ({ lang, theme = 'golden' }) => {
  const [selectedMood, setSelectedMood] = useState<string>('sunset');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SelectedLocationData | null>(null);
  const [focusCardIndex, setFocusCardIndex] = useState<number | null>(null);
  const [activeCardId, setActiveCardId] = useState<string>(FOOD_SPOTS[0].id);

  // Live Location Hook
  const { weather, requestUserLocation } = useLocationWeather(lang);

  // Feature 1: AI Taste Match State
  const [isGeneratingAiTaste, setIsGeneratingAiTaste] = useState(false);
  const [groundingSources, setGroundingSources] = useState<{ title: string; uri: string }[]>([]);
  const [dynamicAiTasteTip, setDynamicAiTasteTip] = useState<string>(
    lang === 'vi'
      ? 'Gợi ý thực tế chiều nay: Cà phê cốt dừa ít ngọt tại ban công tầng 2 đường Trích Sài hoặc Nguyễn Đình Thi. Vị béo bùi thanh tao cân bằng hoàn hảo với làn gió hồ mát lạnh lúc chạng vạng.'
      : 'Top taste pairing today: Lightly sweetened coconut coffee on a second-floor balcony along Trich Sai or Nguyen Dinh Thi. Rich, silky, and balanced against the cool lake breeze.'
  );

  const currentMatch: TasteMatchResult = TASTE_MATCHES[selectedMood] || TASTE_MATCHES['sunset'];

  const moodButtons = [
    { id: 'sunset', icon: '🌅', labelVi: 'Lãng mạn chiều tà', labelEn: 'Romantic Sunset' },
    { id: 'rain', icon: '🌧️', labelVi: 'Thơ thẩn ngắm mưa', labelEn: 'Dreamy Rain' },
    { id: 'reading', icon: '📖', labelVi: 'Bình yên đọc sách', labelEn: 'Quiet Reading' },
    { id: 'friends', icon: '👭', labelVi: 'Chill cùng bạn thân', labelEn: 'Chill with Bestie' },
    { id: 'healing', icon: '🌿', labelVi: 'Chữa lành tâm hồn', labelEn: 'Soul Healing' },
  ];

  // Feature 3: Sort spots by distance to user GPS coordinates & popularity
  const sortedFoodSpots = useMemo(() => {
    return sortSpotsByProximityAndPopularity(
      FOOD_SPOTS,
      weather.latitude,
      weather.longitude,
      0.65
    );
  }, [weather.latitude, weather.longitude]);

  const handleSelectSpot = (spot: FoodSpot, openModal = true) => {
    setActiveCardId(spot.id);
    const locData: SelectedLocationData = {
      id: spot.id,
      name: spot.name,
      nameEn: spot.nameEn,
      category: spot.category,
      categoryEn: spot.categoryEn,
      address: spot.address,
      mapsQuery: spot.mapsQuery,
      image: spot.image,
      iconEmoji: spot.iconEmoji,
      gradientTheme: spot.gradientTheme,
      description: spot.description,
      descriptionEn: spot.descriptionEn,
      ghibliVibe: `Món signature: ${spot.signatureDish} • ${spot.bestSeat}`,
      ghibliVibeEn: `Signature: ${spot.signatureDishEn} • ${spot.bestSeatEn}`
    };
    if (openModal) {
      setSelectedSpot(locData);
    }
  };

  const handleCopyAddress = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAiFoodSuggest = async () => {
    setIsGeneratingAiTaste(true);
    try {
      const res = await fetch('/api/ai/taste-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          timeOfDay: 'sunset',
          lang,
          latitude: weather.latitude,
          longitude: weather.longitude,
          seed: Date.now()
        })
      });
      const data = await res.json();
      if (data.text) {
        setDynamicAiTasteTip(data.text);
      }
      if (data.sources && Array.isArray(data.sources)) {
        setGroundingSources(data.sources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiTaste(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* FEATURE 1: Real-Time Grounded AI Taste & Mood Matcher */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-6 border-2 border-[#d49b48]/30 bg-gradient-to-br from-[#fefcf8] via-[#faf4ea] to-[#f4ebe0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#d49b48]/20 border border-[#d49b48]/30 text-[#a66d1f] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4.5 h-4.5 stroke-[1.85]" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#3a2e28] flex items-center gap-2">
                <span>{lang === 'vi' ? 'Ghép Vị Ẩm Thực & Quán Cà Phê AI Thời Gian Thực' : 'Real-Time AI Taste & Cafe Matcher'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#736357]">
                {lang === 'vi' 
                  ? 'Gợi ý thức uống, món ăn kèm và ban công lộng gió dựa trên tọa độ thực tế và thời tiết chiều nay'
                  : 'Tailors artisanal drinks, comfort dishes, and breezy seating based on live coordinates'}
              </p>
            </div>
          </div>

          <button
            id="ai-quick-taste-suggest-btn"
            onClick={handleAiFoodSuggest}
            disabled={isGeneratingAiTaste}
            className="px-4 py-2.5 rounded-[14px] bg-[#d49b48] hover:bg-[#be8737] active:scale-95 text-[#fdfbf7] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 fill-white ${isGeneratingAiTaste ? 'animate-spin' : ''}`} />
            <span>{lang === 'vi' ? 'Ghép Vị AI Mới' : 'Find Fresh Pairings'}</span>
          </button>
        </div>

        {/* Mood Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {moodButtons.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 whitespace-nowrap ${
                selectedMood === m.id
                  ? 'bg-[#3a2e28] text-[#fdfbf7] border-[#3a2e28] shadow-xs'
                  : 'bg-[#f4ebe0] hover:bg-[#ebdcc8] text-[#55463b] border-[#d8caa6]'
              }`}
            >
              <span>{m.icon}</span>
              <span>{lang === 'vi' ? m.labelVi : m.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Dynamic AI Advice Box */}
        <div className="p-4 rounded-[18px] bg-[#fbf5eb] border border-[#e2d5be] space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#d49b48]/20 flex items-center justify-center shrink-0 mt-0.5 text-xs">☕</span>
            <p className="text-xs sm:text-sm text-[#3d2f26] font-medium leading-relaxed">
              {dynamicAiTasteTip}
            </p>
          </div>

          {groundingSources.length > 0 && (
            <div className="pt-2 border-t border-[#e2d5be] flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#786558] font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#a66d1f]" />
                {lang === 'vi' ? 'Nguồn tìm kiếm thực tế:' : 'Live Grounding:'}
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

        {/* Current Mood Snapshot Details */}
        <div className="p-4 rounded-[20px] bg-[#fdfbf7] border border-[#e2d6c1] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#4a392e]">
            <Coffee className="w-4 h-4 text-[#8a532a] shrink-0" />
            <span><strong>{lang === 'vi' ? 'Thức uống: ' : 'Drink: '}</strong>{lang === 'vi' ? currentMatch.beverage : currentMatch.beverageEn}</span>
          </div>
          <div className="flex items-center gap-2 text-[#4a392e]">
            <Utensils className="w-4 h-4 text-[#5d6e58] shrink-0" />
            <span><strong>{lang === 'vi' ? 'Món kèm: ' : 'Snack: '}</strong>{lang === 'vi' ? currentMatch.comfortSnack : currentMatch.comfortSnackEn}</span>
          </div>
        </div>
      </div>

      {/* FEATURE 2: Live Real-Time Google Search Cafe Explorer */}
      <div className="space-y-2">
        <GhibliGroundedSearch lang={lang} defaultMode="maps" />
      </div>

      {/* FEATURE 3: Distance-Ranked & Popularity-Sorted Cafe & Culinary Spots */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28] flex items-center gap-2">
              <span className="w-7 h-7 rounded-[9px] bg-[#99472e]/20 border border-[#99472e]/30 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-[#99472e]" />
              </span>
              <span>
                {lang === 'vi' ? 'Quán Cà Phê & Ẩm Thực Đặc Trưng (Xếp Theo Khoảng Cách)' : 'Curated Cafes & Dining (Ranked by Distance)'}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-[#736357] mt-0.5">
              {lang === 'vi' 
                ? 'Thưởng thức cà phê cốt dừa, bánh tôm giòn rụm và trà sen bên ráng chiều'
                : 'Experience artisanal coffee, fresh shrimp cakes, and pure lotus tea by the water'}
            </p>
          </div>

          {!weather.isUserLocation && (
            <button
              onClick={requestUserLocation}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#eaddc7] hover:bg-[#decbb0] text-[#554336] font-semibold border border-[#cdbba0] flex items-center gap-1.5 self-start cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5 text-[#8a532a]" />
              <span>{lang === 'vi' ? 'Đo khoảng cách chính xác' : 'Live GPS Distance'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {sortedFoodSpots.map((spot: FoodSpot & { distanceKm?: number }, idx: number) => {
            const isCopied = copiedId === spot.id;
            const isSelected = activeCardId === spot.id;
            const walkMins = spot.distanceKm ? estimateTravelMinutes(spot.distanceKm, 'walk') : null;
            const bikeMins = spot.distanceKm ? estimateTravelMinutes(spot.distanceKm, 'bike') : null;

            return (
              <div
                key={spot.id}
                id={`food-spot-${spot.id}`}
                onClick={() => handleSelectSpot(spot, true)}
                className={`parchment-card rounded-[22px] overflow-hidden border-2 flex flex-col justify-between group transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md ${
                  isSelected 
                    ? 'border-[#d49b48] shadow-md ring-2 ring-[#d49b48]/30 bg-[#fefcf8]' 
                    : 'border-[#ded4c3] hover:border-[#d49b48]/70 bg-[#fdfbf7]'
                }`}
              >
                <div>
                  <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${spot.gradientTheme} flex flex-col justify-between p-4`}>
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="px-3 py-1 rounded-full bg-[#fdfbf7]/92 backdrop-blur-md text-[#8a532a] text-xs font-bold border border-[#d49b48]/40 shadow-xs">
                        {spot.priceRange}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {spot.distanceKm !== undefined && (
                          <span className="px-2.5 py-1 rounded-full bg-white/80 text-[#3a2e28] text-xs font-bold flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-[#99472e]" />
                            <span>{formatDistanceKm(spot.distanceKm, lang)}</span>
                          </span>
                        )}
                        <div className="px-2.5 py-1 rounded-full bg-[#3a2e28]/75 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1 shadow-2xs">
                          <Star className="w-3 h-3 fill-[#d49b48] text-[#d49b48]" />
                          <span>{spot.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 text-center my-auto text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                      {spot.iconEmoji || '☕'}
                    </div>

                    <div className="relative z-10 text-white">
                      <div className="text-[11px] font-medium text-[#faedd8] uppercase tracking-wider">
                        {lang === 'vi' ? spot.category : spot.categoryEn}
                      </div>
                      <h4 className="font-serif-title font-bold text-lg leading-snug drop-shadow-md">
                        {lang === 'vi' ? spot.name : spot.nameEn}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3">
                    <p className="text-xs sm:text-sm text-[#5d4f45] leading-relaxed line-clamp-2">
                      {lang === 'vi' ? spot.description : spot.descriptionEn}
                    </p>

                    {spot.distanceKm !== undefined && (
                      <div className="flex items-center gap-2 text-[11px] text-[#6e5849] bg-[#f2e9dc] px-2.5 py-1 rounded-lg border border-[#e2d5be]">
                        <span>🚶 {walkMins} {lang === 'vi' ? 'phút đi bộ' : 'min walk'}</span>
                        <span>•</span>
                        <span>🛵 {bikeMins} {lang === 'vi' ? 'phút xe máy' : 'min ride'}</span>
                      </div>
                    )}

                    {/* Address Bar */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAddress(spot.id, spot.address);
                      }}
                      className="p-2.5 rounded-[14px] bg-[#f5ede0] border border-[#e0d3bc] text-xs text-[#52443a] flex items-center justify-between gap-2 hover:bg-[#ede1ce] transition-all cursor-pointer"
                      title={lang === 'vi' ? 'Sao chép địa chỉ' : 'Copy address'}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#99472e] shrink-0" />
                        <span className="truncate font-medium">{spot.address}</span>
                      </div>
                      <span className="text-[10px] text-[#8a532a] font-bold shrink-0 flex items-center gap-1">
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {isCopied ? (lang === 'vi' ? 'Đã chép' : 'Copied') : (lang === 'vi' ? 'Chép' : 'Copy')}
                      </span>
                    </div>

                    {/* Signature Dish */}
                    <div className="p-2.5 rounded-[12px] bg-[#d49b48]/10 border border-[#d49b48]/25 text-xs text-[#6e4618]">
                      <span className="font-semibold">{lang === 'vi' ? 'Món signature: ' : 'Signature: '}</span>
                      <span>{lang === 'vi' ? spot.signatureDish : spot.signatureDishEn}</span>
                    </div>

                    {/* Best seat tip */}
                    <div className="p-2.5 rounded-[12px] bg-[#5d6e58]/10 border border-[#5d6e58]/20 text-xs text-[#3b4737]">
                      <span className="font-semibold">{lang === 'vi' ? 'Góc ban công đẹp: ' : 'Best Seat: '}</span>
                      <span>{lang === 'vi' ? spot.bestSeat : spot.bestSeatEn}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons: Focus Mode & Google Maps */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusCardIndex(idx);
                    }}
                    className="py-2.5 px-3 rounded-[12px] bg-[#ece2d0] hover:bg-[#dfd3bf] text-[#4a392e] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#d4caa6]"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#8a532a]" />
                    <span>{lang === 'vi' ? 'Xem Focus Mode' : 'Focus Mode'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.mapsQuery)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="py-2.5 px-3 rounded-[12px] bg-[#3a2e28] hover:bg-[#4d3d35] active:scale-[0.98] text-[#fdfbf7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#d49b48]" />
                    <span>{lang === 'vi' ? 'Google Maps' : 'Google Maps'}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 4: Cafe Sketchbook Notes & Field Journal */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28]">
            {lang === 'vi' ? 'Sổ Tay Quán Cà Phê & Hương Vị Riêng Tư' : 'Cafe Reflections & Sketchbook Notes'}
          </h3>
          <p className="text-xs sm:text-sm text-[#736357]">
            {lang === 'vi' 
              ? 'Lưu lại các ghi chú ngắn về món đồ uống ưng ý và góc ban công tĩnh lặng'
              : 'Save personal notes on standout roasts, balcony views, and quiet corners'}
          </p>
        </div>

        <SketchbookQuickNote
          targetId="hanoi-cafe-general-notes"
          targetTitle={lang === 'vi' ? 'Nhật Ký Cà Phê & Ẩm Thực Hà Nội' : 'Hanoi Cafe Journal'}
          lang={lang}
          theme={theme}
        />
      </div>

      {/* Location Modal */}
      <LocationInspectorModal
        location={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        lang={lang}
        theme={theme}
      />

      {/* Focus Mode Modal */}
      {focusCardIndex !== null && (
        <CardFocusModal
          items={sortedFoodSpots}
          initialIndex={focusCardIndex}
          onClose={() => setFocusCardIndex(null)}
          lang={lang}
          type="food"
        />
      )}
    </div>
  );
};
