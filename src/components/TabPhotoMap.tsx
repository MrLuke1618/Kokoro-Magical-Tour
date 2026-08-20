import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  Dice5, 
  Shirt, 
  Sun, 
  Palette, 
  Bookmark, 
  BookmarkCheck, 
  Filter, 
  Heart,
  Share2,
  Navigation
} from 'lucide-react';
import { Language, PhotoSpot, ThemePalette } from '../types';
import { PHOTO_SPOTS } from '../data/mockData';
import { GhibliVisionAnalyzer } from './GhibliVisionAnalyzer';
import { GhibliGroundedSearch } from './GhibliGroundedSearch';
import { LocationInspectorModal, SelectedLocationData } from './LocationInspectorModal';
import { LocationRecommendationCard } from './LocationRecommendationCard';
import { SketchbookQuickNote } from './SketchbookQuickNote';

interface TabPhotoMapProps {
  lang: Language;
  theme?: ThemePalette;
}

export const TabPhotoMap: React.FC<TabPhotoMapProps> = ({ lang, theme = 'golden' }) => {
  const [randomSpot, setRandomSpot] = useState<PhotoSpot>(PHOTO_SPOTS[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSpot, setSelectedSpot] = useState<SelectedLocationData | null>(null);
  const [activeCardId, setActiveCardId] = useState<string>(PHOTO_SPOTS[0].id);
  const [favoriteSpots, setFavoriteSpots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hanoi_fav_spots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hanoi_fav_spots', JSON.stringify(favoriteSpots));
    } catch {
      // ignore
    }
  }, [favoriteSpots]);

  const handleSelectSpot = (spot: PhotoSpot, openModal = true) => {
    setActiveCardId(spot.id);
    const locData: SelectedLocationData = {
      id: spot.id,
      name: spot.name,
      nameEn: spot.nameEn,
      district: spot.district,
      address: spot.address,
      mapsQuery: spot.mapsQuery,
      image: spot.image,
      iconEmoji: spot.iconEmoji,
      gradientTheme: spot.gradientTheme,
      description: spot.concept,
      descriptionEn: spot.conceptEn,
      bestTime: spot.bestLighting,
      ghibliVibe: `Nhân vật cảm hứng: ${spot.outfitSuggestion.ghibliCharacter} • Bảng màu: ${spot.outfitSuggestion.colorPalette.join(', ')}`,
      ghibliVibeEn: `Character Inspiration: ${spot.outfitSuggestionEn.ghibliCharacter} • Palette: ${spot.outfitSuggestionEn.colorPalette.join(', ')}`,
      photoTip: `Trang phục: ${spot.outfitSuggestion.top}, ${spot.outfitSuggestion.bottom}, ${spot.outfitSuggestion.accessories}`,
      photoTipEn: `Outfit: ${spot.outfitSuggestionEn.top}, ${spot.outfitSuggestionEn.bottom}, ${spot.outfitSuggestionEn.accessories}`
    };
    if (openModal) {
      setSelectedSpot(locData);
    }
  };

  const [isRolling, setIsRolling] = useState(false);
  const [dynamicAiPhotoTip, setDynamicAiPhotoTip] = useState<string>(
    lang === 'vi'
      ? 'Toạ độ vàng: Bậc thềm gạch rêu phong Chùa Trấn Quốc lúc 17:35. Trang phục khuyên dùng: Áo dài linen hoặc sơ mi màu be trơn, tránh hoạ tiết cầu kỳ để khung hình luôn thanh thoát.'
      : 'Optimal coordinate: The mossy brick courtyard of Tran Quoc Pagoda at 5:35 PM. Outfit formula: Plain linen tunic or crisp beige shirt for clean minimalist balance.'
  );

  const handleRandomize = async () => {
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PHOTO_SPOTS.length);
      const chosen = PHOTO_SPOTS[randomIndex];
      setRandomSpot(chosen);
      setActiveCardId(chosen.id);
      count++;
      if (count > 5) {
        clearInterval(interval);
      }
    }, 80);

    try {
      const res = await fetch('/api/ai/photo-coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: selectedDistrict,
          lang,
          seed: Date.now() + Math.floor(Math.random() * 1000)
        })
      });
      const data = await res.json();
      if (data.text) {
        setDynamicAiPhotoTip(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRolling(false);
    }
  };

  const toggleFavorite = (id: string) => {
    if (favoriteSpots.includes(id)) {
      setFavoriteSpots(favoriteSpots.filter(s => s !== id));
    } else {
      setFavoriteSpots([...favoriteSpots, id]);
    }
  };

  const districts = [
    { id: 'all', labelVi: 'Tất Cả Hà Nội', labelEn: 'All Hanoi' },
    { id: 'Tây Hồ', labelVi: 'Tây Hồ', labelEn: 'Tay Ho' },
    { id: 'Hoàn Kiếm', labelVi: 'Hoàn Kiếm', labelEn: 'Hoan Kiem' },
    { id: 'Ba Đình', labelVi: 'Ba Đình', labelEn: 'Ba Dinh' },
  ];

  const filteredSpots = PHOTO_SPOTS.filter(
    spot => selectedDistrict === 'all' || spot.district.includes(selectedDistrict)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Location-Based Photo Spot Recommendation */}
      <LocationRecommendationCard
        category="photomap"
        lang={lang}
        theme={theme}
      />

      {/* 1. Hero AI Randomizer Card: "Random Góc Chụp Cuối Tuần" */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-7 border-2 border-[#d49b48]/40 bg-gradient-to-br from-[#fbf8f2] via-[#faf4ea] to-[#f4ebe0] relative overflow-hidden shadow-sm">
        {/* Tape decorative accent */}
        <div className="tape-top hidden sm:block" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a66d1f] mb-1">
              <span className="w-5 h-5 rounded-[6px] bg-[#d49b48]/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#a66d1f]" />
              </span>
              <span>{lang === 'vi' ? 'AI Random Spot & Outfit Matcher' : 'AI Random Spot & Outfit Matcher'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-[#3a2e28]">
              {lang === 'vi' ? 'Random Góc Chụp Cuối Tuần & Phối Đồ Ghibli' : 'Weekend Photo Spot & Ghibli Outfit Picker'}
            </h3>
            <p className="text-xs sm:text-sm text-[#736357] mt-0.5 leading-relaxed">
              {lang === 'vi' 
                ? 'Nhấn nút để AI chọn ngẫu nhiên một toạ độ check-in đẹp như tranh vẽ cùng công thức phối đồ tương ứng'
                : 'Click to randomly pick an enchanting photo location paired with a tailored Ghibli heroine outfit recipe'}
            </p>
          </div>

          <button
            id="ai-random-spot-trigger-btn"
            onClick={handleRandomize}
            disabled={isRolling}
            className="w-full md:w-auto px-6 py-3.5 rounded-[16px] bg-[#d49b48] hover:bg-[#be8737] active:scale-95 text-[#fdfbf7] font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Dice5 className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>
              {lang === 'vi' ? '✨ AI Random Địa Điểm & Gợi Ý Outfit' : '✨ AI Random Spot & Match Outfit'}
            </span>
          </button>
        </div>

        {/* Dynamic AI Photo Coordinate Strategy Box */}
        <div className="mb-4 p-4 rounded-[18px] bg-[#fbf5eb] border border-[#e2d5be] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#d49b48]/20 flex items-center justify-center shrink-0 mt-0.5 text-xs">
              📸
            </span>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#8a532a] uppercase tracking-wider block">
                {lang === 'vi' ? 'Chiến Lược Chụp Ảnh AI Khuyên Dùng:' : 'AI Photo Strategy & Coordinate Tip:'}
              </span>
              <p className="text-xs sm:text-sm text-[#3d2f26] font-medium leading-relaxed">
                {dynamicAiPhotoTip}
              </p>
            </div>
          </div>
          <button
            onClick={handleRandomize}
            disabled={isRolling}
            className="text-[11px] px-3 py-1.5 rounded-full bg-[#efe4d1] hover:bg-[#e4d6be] border border-[#d8caa6] text-[#52443a] font-semibold shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isRolling ? '...' : (lang === 'vi' ? 'Đổi toạ độ' : 'Refresh')}
          </button>
        </div>

        {/* Selected Random Spot Spotlight Box */}
        <div className={`p-4 sm:p-6 rounded-[20px] bg-[#fdfbf7] border border-[#d8caa6] space-y-4 transition-all duration-300 shadow-2xs ${isRolling ? 'scale-[0.99] opacity-70' : 'scale-100 opacity-100'}`}>
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Spot vector banner (No Web Placeholders) */}
            <div className={`w-full lg:w-72 h-48 sm:h-56 rounded-[20px] overflow-hidden relative shrink-0 shadow-xs bg-gradient-to-br ${randomSpot.gradientTheme || 'from-[#e0b27b] via-[#c9804b] to-[#6d3e23]'} flex flex-col justify-between p-4`}>
              <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/25 pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="px-3 py-1 rounded-full bg-[#d49b48] text-white text-xs font-bold shadow-xs">
                  ⭐ {lang === 'vi' ? 'Gợi ý tuần này' : 'Featured Pick'}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#3a2e28]/75 text-white text-xs font-semibold backdrop-blur-md shadow-2xs">
                  {lang === 'vi' ? randomSpot.district : randomSpot.districtEn}
                </span>
              </div>

              <div className="relative z-10 text-center my-auto text-6xl drop-shadow-md">
                {randomSpot.iconEmoji || '📸'}
              </div>

              <div className="relative z-10 flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full w-fit">
                <span className="text-[10px] text-white/90 font-medium mr-1">Palette:</span>
                {randomSpot.outfitSuggestion?.colorPalette?.slice(0, 3).map((col, idx) => (
                  <span key={idx} className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-md font-mono">
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Spot details & Outfit */}
            <div className="flex-1 space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28]">
                    {lang === 'vi' ? randomSpot.name : randomSpot.nameEn}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#615147] mt-0.5 leading-relaxed">
                    {lang === 'vi' ? randomSpot.concept : randomSpot.conceptEn}
                  </p>
                </div>

                <button
                  onClick={() => toggleFavorite(randomSpot.id)}
                  className="p-2 rounded-[12px] bg-[#f5ede0] hover:bg-[#eae0d0] text-[#736357] hover:text-[#99472e] transition-colors cursor-pointer shrink-0 border border-[#e2d5bf]"
                  title={lang === 'vi' ? 'Lưu địa điểm' : 'Bookmark Spot'}
                >
                  {favoriteSpots.includes(randomSpot.id) ? (
                    <BookmarkCheck className="w-5 h-5 text-[#99472e]" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Ghibli Outfit Formula Card */}
              <div className="p-3.5 rounded-[16px] bg-[#5d6e58]/10 border border-[#5d6e58]/25 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-[#3b4737] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-[6px] bg-[#5d6e58]/20 flex items-center justify-center">
                      <Shirt className="w-3.5 h-3.5 text-[#3b4737]" />
                    </span>
                    <span>{lang === 'vi' ? 'Set Đồ Gợi Ý (Ghibli Aesthetic)' : 'Suggested Ghibli Outfit Recipe'}</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#5d6e58]/20 text-[#2e3b2b] font-semibold">
                    {lang === 'vi' 
                      ? `Cảm hứng: ${randomSpot.outfitSuggestion.ghibliCharacter}`
                      : `Inspo: ${randomSpot.outfitSuggestionEn.ghibliCharacter}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#3a2e28]">
                  <div>
                    <span className="font-semibold text-[#8a532a]">{lang === 'vi' ? 'Áo / Đầm: ' : 'Top / Dress: '}</span>
                    <span>{lang === 'vi' ? randomSpot.outfitSuggestion.top : randomSpot.outfitSuggestionEn.top}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#5d6e58]">{lang === 'vi' ? 'Phối cùng: ' : 'Bottom / Shawl: '}</span>
                    <span>{lang === 'vi' ? randomSpot.outfitSuggestion.bottom : randomSpot.outfitSuggestionEn.bottom}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-[#7a9aab]">{lang === 'vi' ? 'Phụ kiện: ' : 'Accessories: '}</span>
                    <span>{lang === 'vi' ? randomSpot.outfitSuggestion.accessories : randomSpot.outfitSuggestionEn.accessories}</span>
                  </div>
                </div>

                {/* Color Palette Dots */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-medium text-[#736357]">
                    {lang === 'vi' ? 'Tone màu:' : 'Palette:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {randomSpot.outfitSuggestion.colorPalette.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full border border-[#d8caa6] shadow-2xs"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Lighting & Camera Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[12px] bg-[#d49b48]/10 border border-[#d49b48]/25 text-[#6e4618] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[6px] bg-[#d49b48]/25 flex items-center justify-center shrink-0">
                    <Sun className="w-3.5 h-3.5 text-[#a66d1f]" />
                  </span>
                  <span className="truncate">
                    <strong>{lang === 'vi' ? 'Giờ chụp đẹp: ' : 'Best Light: '}</strong>
                    {lang === 'vi' ? randomSpot.bestLighting : randomSpot.bestLightingEn}
                  </span>
                </div>
                <div className="p-2.5 rounded-[12px] bg-[#7a9aab]/15 border border-[#7a9aab]/30 text-[#3b5969] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[6px] bg-[#7a9aab]/25 flex items-center justify-center shrink-0">
                    <Camera className="w-3.5 h-3.5 text-[#3b5969]" />
                  </span>
                  <span className="truncate">
                    <strong>{lang === 'vi' ? 'Mẹo góc chụp: ' : 'Angle Tip: '}</strong>
                    {lang === 'vi' ? randomSpot.cameraSettingsTip : randomSpot.cameraSettingsTipEn}
                  </span>
                </div>
              </div>

              {/* Action: Open in Google Maps & Find Outfit on Lazada/TikTok */}
              <div className="pt-1 flex items-center gap-2.5">
                <button
                  onClick={() => handleSelectSpot(randomSpot, true)}
                  className="flex-1 py-2.5 px-4 rounded-[14px] bg-[#3a2e28] hover:bg-[#4d3d35] active:scale-98 text-[#fdfbf7] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <MapPin className="w-4 h-4 text-[#d49b48]" />
                  <span>{lang === 'vi' ? 'Chọn & Mở Google Maps Đến Đây' : 'Select & Open in Maps'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>

                <a
                  href={
                    lang === 'vi'
                      ? `https://www.lazada.vn/catalog/?q=${encodeURIComponent(`váy đầm vintage ${randomSpot.outfitSuggestion.ghibliCharacter} ${randomSpot.outfitSuggestion.top}`)}`
                      : `https://www.lazada.vn/catalog/?q=${encodeURIComponent(`${randomSpot.outfitSuggestionEn.ghibliCharacter} vintage dress`)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 rounded-[14px] bg-[#000080] hover:bg-[#000066] active:scale-95 text-[#fdfbf7] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title={lang === 'vi' ? 'Tìm đầm vintage trên Lazada' : 'Search outfit on Lazada'}
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'vi' ? 'Tìm Outfit Trên Lazada' : 'Find Outfit on Lazada'}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* Handwritten Sketchbook Quick Note for Spotlight Pick */}
              <div className="pt-1">
                <SketchbookQuickNote
                  itemId={`photo_${randomSpot.id}`}
                  itemTitle={lang === 'vi' ? randomSpot.name : randomSpot.nameEn}
                  lang={lang}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ghibli Vision Spot & Lighting Analyzer */}
      <GhibliVisionAnalyzer lang={lang} />

      {/* 3. Google Maps Spot & Photo Route Grounding */}
      <GhibliGroundedSearch lang={lang} defaultMode="maps" theme={theme} />

      {/* 4. Filterable Spot Directory & Map Index */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28] flex items-center gap-2">
              <span className="w-7 h-7 rounded-[9px] bg-[#d49b48]/20 border border-[#d49b48]/30 flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#a66d1f]" />
              </span>
              <span>{lang === 'vi' ? 'Danh Mục Toạ Độ Sống Ảo Hà Nội' : 'Hanoi Photo Spot Directory'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#736357] mt-0.5">
              {lang === 'vi' 
                ? 'Khám phá tất cả các góc chụp đậm chất thơ khắp thủ đô' 
                : 'Browse all romantic, vintage photography destinations in Hanoi'}
            </p>
          </div>

          {/* District Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {districts.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border active:scale-95 ${
                  selectedDistrict === d.id
                    ? 'bg-[#3a2e28] text-[#fdfbf7] border-[#3a2e28] shadow-xs'
                    : 'bg-[#f2e9dc] hover:bg-[#e6dcce] text-[#635348] border-[#d8caa6]'
                }`}
              >
                {lang === 'vi' ? d.labelVi : d.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpots.map((spot: PhotoSpot) => {
            const isFav = favoriteSpots.includes(spot.id);
            const isSelected = activeCardId === spot.id;
            return (
              <div
                key={spot.id}
                id={`photo-spot-card-${spot.id}`}
                onClick={() => handleSelectSpot(spot, true)}
                className={`parchment-card rounded-[22px] overflow-hidden border-2 flex flex-col justify-between group transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md ${
                  isSelected 
                    ? 'border-[#d49b48] shadow-md ring-2 ring-[#d49b48]/30 bg-[#fefcf8] -translate-y-0.5' 
                    : 'border-[#ded4c3] hover:border-[#d49b48]/70'
                }`}
              >
                <div>
                  {/* Photo coordinate vector banner (No Web Placeholders) */}
                  <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${spot.gradientTheme || 'from-[#e0b27b] via-[#c9804b] to-[#6d3e23]'} flex flex-col justify-between p-3.5`}>
                    <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/25 pointer-events-none" />

                    {/* Active Selected Pill or District Badge */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      {isSelected ? (
                        <div className="px-3 py-0.5 rounded-full bg-[#d49b48] text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{lang === 'vi' ? 'Đang chọn' : 'Selected'}</span>
                        </div>
                      ) : (
                        <div className="px-2.5 py-0.5 rounded-full bg-[#3a2e28]/75 text-white text-[11px] font-medium backdrop-blur-md shadow-2xs">
                          {spot.district}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(spot.id);
                        }}
                        className="p-1.5 rounded-full bg-[#fdfbf7]/90 text-[#3a2e28] hover:text-[#99472e] transition-colors shadow-2xs cursor-pointer active:scale-90"
                        title={lang === 'vi' ? 'Lưu địa điểm' : 'Bookmark'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-[#99472e] text-[#99472e]' : ''}`} />
                      </button>
                    </div>

                    {/* Center Icon Emoji */}
                    <div className="relative z-10 text-center my-auto text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                      {spot.iconEmoji || '📷'}
                    </div>

                    {/* Title on bottom */}
                    <div className="relative z-10 text-white">
                      <h5 className="font-serif-title font-bold text-sm sm:text-base leading-snug drop-shadow-md">
                        {lang === 'vi' ? spot.name : spot.nameEn}
                      </h5>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <p className="text-xs text-[#5d4f45] line-clamp-2 leading-relaxed">
                      {lang === 'vi' ? spot.concept : spot.conceptEn}
                    </p>

                    {/* Address pill */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSpot(spot, true);
                      }}
                      className="p-2 rounded-[12px] bg-[#f5ede0] border border-[#e0d3bc] text-[11px] text-[#52443a] flex items-center justify-between gap-1.5 hover:bg-[#ede1ce] transition-colors active:scale-98"
                      title={lang === 'vi' ? 'Nhấp để chọn vị trí' : 'Click to select'}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-4.5 h-4.5 rounded-full bg-[#99472e]/15 flex items-center justify-center shrink-0">
                          <MapPin className="w-3 h-3 text-[#99472e]" />
                        </span>
                        <span className="truncate font-medium">{spot.address}</span>
                      </div>
                      <span className="text-[10px] text-[#8a532a] font-bold shrink-0 bg-[#ebdcc2] px-1.5 py-0.5 rounded-full">
                        {lang === 'vi' ? 'Xem →' : 'View →'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[12px] bg-[#5d6e58]/10 border border-[#5d6e58]/20 text-[11px] text-[#3b4737] flex items-start gap-2">
                      <span className="w-4.5 h-4.5 rounded-[5px] bg-[#5d6e58]/20 flex items-center justify-center shrink-0 mt-0.5 text-xs">👗</span>
                      <div className="leading-tight">
                        <span className="font-semibold">
                          {lang === 'vi' ? 'Outfit: ' : 'Outfit: '}
                        </span>
                        <span>{lang === 'vi' ? spot.outfitSuggestion.top : spot.outfitSuggestionEn.top}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8a532a] flex items-center gap-1.5 font-medium">
                      <Sun className="w-3.5 h-3.5 text-[#d49b48]" />
                      <span>{lang === 'vi' ? spot.bestLighting : spot.bestLightingEn}</span>
                    </div>

                    {/* Handwritten Sketchbook Quick Note */}
                    <div className="pt-1">
                      <SketchbookQuickNote
                        itemId={`photo_${spot.id}`}
                        itemTitle={lang === 'vi' ? spot.name : spot.nameEn}
                        lang={lang}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSpot(spot, true);
                    }}
                    className="w-full py-2.5 px-3 rounded-[14px] bg-[#3a2e28] hover:bg-[#4d3d35] active:scale-98 text-[#fdfbf7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#d49b48]" />
                    <span>{lang === 'vi' ? 'Chọn & Mở Google Maps' : 'Select & Open Maps'}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
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
    </div>
  );
};
