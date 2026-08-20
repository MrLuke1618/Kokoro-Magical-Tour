import React, { useState } from 'react';
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
  Maximize2
} from 'lucide-react';
import { Language, FoodSpot, TasteMatchResult, ThemePalette } from '../types';
import { FOOD_SPOTS, TASTE_MATCHES } from '../data/mockData';
import { GhibliGroundedSearch } from './GhibliGroundedSearch';
import { LocationInspectorModal, SelectedLocationData } from './LocationInspectorModal';
import { LocationRecommendationCard } from './LocationRecommendationCard';
import { CardFocusModal } from './CardFocusModal';
import { SketchbookQuickNote } from './SketchbookQuickNote';

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
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const currentMatch: TasteMatchResult = TASTE_MATCHES[selectedMood] || TASTE_MATCHES['sunset'];

  const moodButtons = [
    { id: 'sunset', icon: '🌅', labelVi: 'Lãng mạn, chiều tà', labelEn: 'Romantic Sunset' },
    { id: 'rain', icon: '🌧️', labelVi: 'Thơ thẩn, ngắm mưa', labelEn: 'Dreamy Rain Watching' },
    { id: 'reading', icon: '📖', labelVi: 'Bình yên, đọc sách', labelEn: 'Peaceful Reading' },
    { id: 'friends', icon: '👭', labelVi: 'Chill cùng bạn thân', labelEn: 'Chill with Bestie' },
    { id: 'healing', icon: '🌿', labelVi: 'Chữa lành tâm hồn', labelEn: 'Soul Healing' },
  ];

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

  // Dynamic 1-Click AI Food & Cafe Suggestion
  const [isGeneratingAiTaste, setIsGeneratingAiTaste] = useState(false);
  const [dynamicAiTasteTip, setDynamicAiTasteTip] = useState<string>(
    lang === 'vi'
      ? 'Gợi ý chuẩn vị chiều nay: Cà phê cốt dừa ít ngọt tại ban công tầng 2 đường Trích Sài. Vị béo bùi cân bằng hoàn hảo với làn gió hồ mát lạnh.'
      : 'Top taste pairing today: Lightly sweetened coconut coffee on a second-floor balcony along Trich Sai. Rich, silky, and balanced against the cool lake breeze.'
  );

  const handleAiFoodSuggest = async () => {
    setIsGeneratingAiTaste(true);
    const keys = Object.keys(TASTE_MATCHES);
    const randomMood = keys[Math.floor(Math.random() * keys.length)];
    setSelectedMood(randomMood);

    // Pick random matching food spot
    const randomSpot = FOOD_SPOTS[Math.floor(Math.random() * FOOD_SPOTS.length)];
    setActiveCardId(randomSpot.id);

    try {
      const res = await fetch('/api/ai/taste-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: randomMood,
          timeOfDay: 'sunset',
          lang,
          seed: Date.now() + Math.floor(Math.random() * 1000)
        })
      });
      const data = await res.json();
      if (data.text) {
        setDynamicAiTasteTip(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiTaste(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Location-Based Cafe & Treat Recommendation */}
      <LocationRecommendationCard
        category="food"
        lang={lang}
        theme={theme}
      />

      {/* 1. AI Taste Matcher Widget */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-6 border-2 border-[#d49b48]/30 bg-gradient-to-br from-[#fefcf8] via-[#faf4ea] to-[#f4ebe0] shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#d49b48]/20 border border-[#d49b48]/30 text-[#a66d1f] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4.5 h-4.5 stroke-[1.85]" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#3a2e28]">
                {lang === 'vi' ? 'AI Taste Matcher • Ghép Vị Theo Tâm Trạng' : 'AI Taste Matcher • Mood-Based Palate'}
              </h3>
              <p className="text-xs sm:text-sm text-[#736357] leading-relaxed">
                {lang === 'vi' 
                  ? 'Chọn cảm xúc chiều nay, AI sẽ gợi ý thức uống, món ăn kèm và góc ngồi lý tưởng'
                  : 'Select your mood; AI pairs the perfect beverage, comfort snack, and sunset seat'}
              </p>
            </div>
          </div>

          <button
            id="ai-quick-taste-suggest-btn"
            onClick={handleAiFoodSuggest}
            className="px-4 py-2.5 rounded-[14px] bg-[#d49b48] hover:bg-[#be8737] active:scale-95 text-[#fdfbf7] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title={lang === 'vi' ? 'Bấm để AI chọn ngẫu nhiên quán cà phê & thức uống cho bạn' : '1-Click AI Taste Pairing'}
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{lang === 'vi' ? '✨ AI Gợi Ý Món Ăn 1 Chạm' : '✨ 1-Click AI Taste Match'}</span>
          </button>
        </div>

        {/* AI Notification Banner */}
        {aiNotice && (
          <div className="mb-4 p-3 rounded-[14px] bg-[#5d6e58]/15 border border-[#5d6e58]/30 text-xs text-[#2e3b2b] font-medium flex items-center justify-between gap-2 animate-in fade-in">
            <span>{aiNotice}</span>
            <button 
              onClick={() => {
                const sp = FOOD_SPOTS.find(f => f.id === activeCardId);
                if (sp) handleSelectSpot(sp, true);
              }}
              className="text-[11px] font-bold text-[#8a532a] underline cursor-pointer shrink-0"
            >
              {lang === 'vi' ? 'Xem chi tiết quán →' : 'View details →'}
            </button>
          </div>
        )}

        {/* Dynamic AI Taste Advice Box */}
        <div className="mt-3.5 p-4 rounded-[18px] bg-[#fbf5eb] border border-[#e2d5be] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#d49b48]/20 flex items-center justify-center shrink-0 mt-0.5 text-xs">
              ☕
            </span>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#8a532a] uppercase tracking-wider block">
                {lang === 'vi' ? 'Ghép Vị AI Đề Xuất Chiều Nay:' : 'AI Taste Pairing Recommendation:'}
              </span>
              <p className="text-xs sm:text-sm text-[#3d2f26] font-medium leading-relaxed">
                {dynamicAiTasteTip}
              </p>
            </div>
          </div>
          <button
            onClick={handleAiFoodSuggest}
            disabled={isGeneratingAiTaste}
            className="text-[11px] px-3 py-1.5 rounded-full bg-[#efe4d1] hover:bg-[#e4d6be] border border-[#d8caa6] text-[#52443a] font-semibold shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAiTaste ? '...' : (lang === 'vi' ? 'Đổi món' : 'Refresh')}
          </button>
        </div>

        {/* Dynamic Match Output Card */}
        <div className="mt-4 p-4 sm:p-5 rounded-[20px] bg-[#fdfbf7] border border-[#e2d6c1] space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drink & Food */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#d49b48]/15 border border-[#d49b48]/25 text-[#a66d1f] flex items-center justify-center shrink-0 mt-0.5">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a532a]">
                    {lang === 'vi' ? 'Thức uống chuẩn vị' : 'Paired Beverage'}
                  </div>
                  <div className="text-sm font-semibold text-[#3a2e28]">
                    {lang === 'vi' ? currentMatch.beverage : currentMatch.beverageEn}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#5d6e58]/15 border border-[#5d6e58]/25 text-[#42523d] flex items-center justify-center shrink-0 mt-0.5">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5d6e58]">
                    {lang === 'vi' ? 'Món ăn kèm ấm áp' : 'Comfort Snack Pairing'}
                  </div>
                  <div className="text-sm font-semibold text-[#3a2e28]">
                    {lang === 'vi' ? currentMatch.comfortSnack : currentMatch.comfortSnackEn}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Seat & Music */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#7a9aab]/20 border border-[#7a9aab]/30 text-[#3b5969] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#3b5969]">
                    {lang === 'vi' ? 'Góc ngồi gợi ý' : 'Ideal Sunset Seating Spot'}
                  </div>
                  <div className="text-xs sm:text-sm text-[#4d3e35] leading-relaxed">
                    {lang === 'vi' ? currentMatch.recommendedSpot : currentMatch.recommendedSpotEn}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#99472e]/15 border border-[#99472e]/25 text-[#99472e] flex items-center justify-center shrink-0 mt-0.5">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#99472e]">
                    {lang === 'vi' ? 'Giai điệu đồng điệu' : 'Soundtrack Companion'}
                  </div>
                  <div className="text-xs sm:text-sm text-[#4d3e35] font-medium">
                    🎵 {currentMatch.soundtrack}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ghibli Quote Bar */}
          <div className="pt-3 border-t border-[#ede4d2] flex items-center gap-2 text-xs font-serif italic text-[#635144]">
            <HeartHandshake className="w-4 h-4 text-[#d49b48] shrink-0" />
            <span>{lang === 'vi' ? currentMatch.ghibliQuote : currentMatch.ghibliQuoteEn}</span>
          </div>
        </div>
      </div>

      {/* 2. Google Maps Grounded Hanoi Cafe Explorer */}
      <GhibliGroundedSearch lang={lang} defaultMode="maps" />

      {/* 3. Curated Comfort Spots Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28] flex items-center gap-2">
            <span className="w-7 h-7 rounded-[9px] bg-[#99472e]/20 border border-[#99472e]/30 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-[#99472e]" />
            </span>
            <span>
              {lang === 'vi' ? 'Quán Cà Phê & Ẩm Thực Hà Nội Đặc Trưng' : 'Iconic Hanoi Comfort Cafes & Delicacies'}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-[#736357] mt-1">
            {lang === 'vi' 
              ? 'Thưởng thức cà phê cốt dừa, bánh tôm giòn rụm và trà sen bên ráng chiều Hồ Tây'
              : 'Taste rich coconut coffee, hot crispy shrimp cakes, and lotus tea by the water'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {FOOD_SPOTS.map((spot: FoodSpot, idx: number) => {
            const isCopied = copiedId === spot.id;
            const isSelected = activeCardId === spot.id;
            return (
              <div
                key={spot.id}
                id={`food-spot-${spot.id}`}
                onClick={() => handleSelectSpot(spot, true)}
                className={`parchment-card rounded-[22px] overflow-hidden border-2 flex flex-col justify-between group transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md ${
                  isSelected 
                    ? 'border-[#d49b48] shadow-md ring-2 ring-[#d49b48]/30 bg-[#fefcf8] -translate-y-0.5' 
                    : 'border-[#ded4c3] hover:border-[#d49b48]/70'
                }`}
              >
                <div>
                  {/* Atmospheric Cafe Vignette Banner (No Web Placeholders) */}
                  <div className={`relative h-48 w-full overflow-hidden bg-gradient-to-br ${spot.gradientTheme || 'from-[#ecd6b7] via-[#d4a36b] to-[#7f4e24]'} flex flex-col justify-between p-4`}>
                    <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Row: Price Tag & Rating / Selected & Focus Mode Trigger */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <div className="px-3 py-1 rounded-full bg-[#fdfbf7]/92 backdrop-blur-md text-[#8a532a] text-xs font-bold border border-[#d49b48]/40 shadow-xs">
                          {spot.priceRange}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Focus Mode Icon Button on Card Banner */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocusCardIndex(idx);
                          }}
                          className="px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 text-[#fdfbf7] text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          title={lang === 'vi' ? 'Mở chế độ đọc tập trung (Focus Mode)' : 'Open Focus Reading Mode'}
                        >
                          <BookOpen className="w-3 h-3 text-[#fcd34d]" />
                          <span className="text-[11px]">{lang === 'vi' ? 'Focus Mode' : 'Focus'}</span>
                        </button>

                        {isSelected ? (
                          <div className="px-3 py-1 rounded-full bg-[#d49b48] text-[#fdfbf7] text-xs font-bold shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{lang === 'vi' ? 'Đang chọn' : 'Selected'}</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full bg-[#3a2e28]/75 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1 shadow-2xs">
                            <Star className="w-3 h-3 fill-[#d49b48] text-[#d49b48]" />
                            <span>{spot.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Center Icon Emoji */}
                    <div className="relative z-10 text-center my-auto text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                      {spot.iconEmoji || '☕'}
                    </div>

                    {/* Title on bottom */}
                    <div className="relative z-10 text-white">
                      <div className="text-[11px] font-medium text-[#faedd8] uppercase tracking-wider">
                        {lang === 'vi' ? spot.category : spot.categoryEn}
                      </div>
                      <h4 className="font-serif-title font-bold text-lg leading-snug drop-shadow-md">
                        {lang === 'vi' ? spot.name : spot.nameEn}
                      </h4>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <p className="text-xs sm:text-sm text-[#5d4f45] leading-relaxed line-clamp-3">
                      {lang === 'vi' ? spot.description : spot.descriptionEn}
                    </p>

                    {/* Interactive Address Bar */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSpot(spot, true);
                      }}
                      className="p-2.5 rounded-[14px] bg-[#f5ede0] border border-[#e0d3bc] text-xs text-[#52443a] flex items-center justify-between gap-2 hover:bg-[#ede1ce] transition-all cursor-pointer active:scale-98"
                      title={lang === 'vi' ? 'Nhấp để chọn và xem chỉ đường' : 'Click to select and view route'}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-[#99472e]/15 flex items-center justify-center shrink-0">
                          <MapPin className="w-3 h-3 text-[#99472e]" />
                        </span>
                        <span className="truncate font-medium">{spot.address}</span>
                      </div>
                      <span className="text-[11px] text-[#8a532a] font-bold shrink-0 bg-[#ebdcc2] px-2 py-0.5 rounded-full">
                        {lang === 'vi' ? 'Xem vị trí →' : 'View Spot →'}
                      </span>
                    </div>

                    {/* Signature Dish */}
                    <div className="p-3 rounded-[14px] bg-[#d49b48]/10 border border-[#d49b48]/25 text-xs text-[#6e4618] flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-[6px] bg-[#d49b48]/25 flex items-center justify-center shrink-0 mt-0.5 text-xs">✨</span>
                      <div className="leading-snug">
                        <span className="font-semibold">
                          {lang === 'vi' ? 'Món đặc sắc: ' : 'Signature: '}
                        </span>
                        <span>{lang === 'vi' ? spot.signatureDish : spot.signatureDishEn}</span>
                      </div>
                    </div>

                    {/* Best seat tip */}
                    <div className="p-3 rounded-[14px] bg-[#5d6e58]/10 border border-[#5d6e58]/20 text-xs text-[#3b4737] flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-[6px] bg-[#5d6e58]/20 flex items-center justify-center shrink-0 mt-0.5 text-xs">🪑</span>
                      <div className="leading-snug">
                        <span className="font-semibold">
                          {lang === 'vi' ? 'Góc ngồi đẹp: ' : 'Best Seat: '}
                        </span>
                        <span>{lang === 'vi' ? spot.bestSeat : spot.bestSeatEn}</span>
                      </div>
                    </div>

                    {/* Handwritten Sketchbook Quick Note */}
                    <div className="pt-1">
                      <SketchbookQuickNote
                        itemId={`cafe_${spot.id}`}
                        itemTitle={lang === 'vi' ? spot.name : spot.nameEn}
                        lang={lang}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSpot(spot, true);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-[14px] bg-[#3a2e28] hover:bg-[#4d3d35] active:scale-[0.98] text-[#fdfbf7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#d49b48]" />
                      <span>{lang === 'vi' ? 'Chọn & Mở Maps' : 'Select & Maps'}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusCardIndex(idx);
                      }}
                      className="py-2.5 px-3.5 rounded-[14px] bg-[#d49b48]/15 hover:bg-[#d49b48]/25 active:scale-95 text-[#8a532a] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#d49b48]/35 shadow-2xs"
                      title={lang === 'vi' ? 'Mở rộng đọc chi tiết (Focus Mode)' : 'Focus Reading Mode'}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#d49b48]" />
                      <span>{lang === 'vi' ? 'Đọc Chi Tiết' : 'Focus Read'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAddress(spot.id, spot.address);
                      }}
                      className="py-2.5 px-3 rounded-[14px] bg-[#ebe3d3] hover:bg-[#ded4c1] active:scale-95 text-[#4d3e35] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#d8caa6] shadow-2xs"
                      title={lang === 'vi' ? 'Sao chép địa chỉ' : 'Copy address'}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-700" />
                          <span className="text-green-800 font-semibold">{lang === 'vi' ? 'Đã chép' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Inspector Modal */}
      <LocationInspectorModal
        location={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        lang={lang}
        theme={theme}
      />

      {/* Full-Screen Distraction-Free Card Focus Mode Modal */}
      <CardFocusModal
        isOpen={focusCardIndex !== null}
        onClose={() => setFocusCardIndex(null)}
        type="cafe"
        items={FOOD_SPOTS}
        currentIndex={focusCardIndex ?? 0}
        onIndexChange={setFocusCardIndex}
        lang={lang}
        theme={theme}
      />
    </div>
  );
};
