import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  Dice5, 
  Shirt, 
  Sun, 
  Bookmark, 
  BookmarkCheck, 
  Navigation,
  Globe,
  Maximize2,
  LocateFixed
} from 'lucide-react';
import { Language, PhotoSpot, ThemePalette } from '../types';
import { PHOTO_SPOTS } from '../data/mockData';
import { GhibliVisionAnalyzer } from './GhibliVisionAnalyzer';
import { LocationInspectorModal, SelectedLocationData } from './LocationInspectorModal';
import { CardFocusModal } from './CardFocusModal';
import { SketchbookQuickNote } from './SketchbookQuickNote';
import { useLocationWeather } from '../hooks/useLocationWeather';
import { sortSpotsByProximityAndPopularity, formatDistanceKm, estimateTravelMinutes } from '../utils/geoDistance';

interface TabPhotoMapProps {
  lang: Language;
  theme?: ThemePalette;
}

export const TabPhotoMap: React.FC<TabPhotoMapProps> = ({ lang, theme = 'golden' }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSpot, setSelectedSpot] = useState<SelectedLocationData | null>(null);
  const [focusCardIndex, setFocusCardIndex] = useState<number | null>(null);
  const [activeCardId, setActiveCardId] = useState<string>(PHOTO_SPOTS[0].id);
  const [favoriteSpots, setFavoriteSpots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hanoi_fav_spots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live Location & Weather
  const { weather, requestUserLocation } = useLocationWeather(lang);

  // Feature 1: AI Photo Strategy State
  const [isRolling, setIsRolling] = useState(false);
  const [groundingSources, setGroundingSources] = useState<{ title: string; uri: string }[]>([]);
  const [dynamicAiPhotoTip, setDynamicAiPhotoTip] = useState<string>(
    lang === 'vi'
      ? 'Toạ độ vàng chiều nay: Bậc thềm rêu phong Chùa Trấn Quốc lúc 17:35 hoặc lan can bến thuyền hồ Trúc Bạch. Ánh sáng vàng xiên 45 độ, phối đầm linen be hoặc áo dài mộc để khung hình trong trẻo và thanh lịch.'
      : 'Optimal coordinate today: The mossy brick steps at Tran Quốc Pagoda around 5:35 PM or Truc Bach boat pier. 45-degree golden light, paired with an ivory linen dress for a timeless look.'
  );

  const districts = [
    { id: 'all', labelVi: 'Tất Cả Hà Nội', labelEn: 'All Hanoi' },
    { id: 'Tây Hồ', labelVi: 'Tây Hồ', labelEn: 'Tay Ho' },
    { id: 'Hoàn Kiếm', labelVi: 'Hoàn Kiếm', labelEn: 'Hoan Kiem' },
    { id: 'Ba Đình', labelVi: 'Ba Đình', labelEn: 'Ba Dinh' },
  ];

  // Feature 3: Distance & Popularity Sort
  const sortedPhotoSpots = useMemo(() => {
    const filtered = PHOTO_SPOTS.filter(
      spot => selectedDistrict === 'all' || spot.district.includes(selectedDistrict)
    );
    return sortSpotsByProximityAndPopularity(
      filtered,
      weather.latitude,
      weather.longitude,
      0.65
    );
  }, [selectedDistrict, weather.latitude, weather.longitude]);

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

  const toggleFavorite = (id: string) => {
    const next = favoriteSpots.includes(id) 
      ? favoriteSpots.filter(s => s !== id) 
      : [...favoriteSpots, id];
    setFavoriteSpots(next);
    try {
      localStorage.setItem('hanoi_fav_spots', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleAiPhotoSuggest = async () => {
    setIsRolling(true);
    try {
      const res = await fetch('/api/ai/photo-coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: selectedDistrict,
          lang,
          latitude: weather.latitude,
          longitude: weather.longitude,
          seed: Date.now()
        })
      });
      const data = await res.json();
      if (data.text) {
        setDynamicAiPhotoTip(data.text);
      }
      if (data.sources && Array.isArray(data.sources)) {
        setGroundingSources(data.sources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* FEATURE 1: Real-Time Grounded AI Photo Strategy & Lighting Advisor */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-7 border-2 border-[#d49b48]/40 bg-gradient-to-br from-[#fbf8f2] via-[#faf4ea] to-[#f4ebe0] relative shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a66d1f] mb-1">
              <span className="w-5 h-5 rounded-[6px] bg-[#d49b48]/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#a66d1f]" />
              </span>
              <span>{lang === 'vi' ? 'Chiến Lược Góc Chụp & Ánh Sáng AI Thời Gian Thực' : 'Real-Time AI Photography Advisor'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-[#3a2e28]">
              {lang === 'vi' ? 'Toạ Độ Sống Ảo & Công Thức Ánh Sáng' : 'Photo Coordinates & Lighting Strategy'}
            </h3>
            <p className="text-xs sm:text-sm text-[#736357] mt-0.5">
              {lang === 'vi' 
                ? 'Tìm kiếm toạ độ check-in đẹp như tranh vẽ cùng công thức ánh sáng và trang phục tối ưu theo thời tiết thực tế'
                : 'Picks an enchanting photo location paired with lighting notes and clean aesthetic outfit recipes'}
            </p>
          </div>

          <button
            id="ai-random-spot-trigger-btn"
            onClick={handleAiPhotoSuggest}
            disabled={isRolling}
            className="w-full md:w-auto px-5 py-3 rounded-[16px] bg-[#d49b48] hover:bg-[#be8737] active:scale-95 text-[#fdfbf7] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Dice5 className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{lang === 'vi' ? 'Đề Xuất Toạ Độ Mới' : 'Find Fresh Spot'}</span>
          </button>
        </div>

        {/* Dynamic AI Advice Box */}
        <div className="p-4 rounded-[18px] bg-[#fbf5eb] border border-[#e2d5be] space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#d49b48]/20 flex items-center justify-center shrink-0 mt-0.5 text-xs">📸</span>
            <p className="text-xs sm:text-sm text-[#3d2f26] font-medium leading-relaxed">
              {dynamicAiPhotoTip}
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

        {/* District Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {districts.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDistrict(d.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedDistrict === d.id
                  ? 'bg-[#3a2e28] text-[#fdfbf7] border-[#3a2e28] shadow-xs'
                  : 'bg-[#f4ebe0] hover:bg-[#ebdcc8] text-[#55463b] border-[#d8caa6]'
              }`}
            >
              {lang === 'vi' ? d.labelVi : d.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURE 2: AI Composition & Color Palette Inspector */}
      <div className="space-y-2">
        <GhibliVisionAnalyzer lang={lang} />
      </div>

      {/* FEATURE 3: Distance-Ranked & Popularity-Sorted Photo Coordinates Directory with Focus Mode */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28] flex items-center gap-2">
              <span className="w-7 h-7 rounded-[9px] bg-[#d49b48]/20 border border-[#d49b48]/30 flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#a66d1f]" />
              </span>
              <span>{lang === 'vi' ? 'Toạ Độ Nhiếp Ảnh (Xếp Theo Khoảng Cách)' : 'Photo Coordinates (Ranked by Distance)'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#736357] mt-0.5">
              {lang === 'vi' 
                ? 'Góc chụp đậm chất thơ, kèm công thức bảng màu trang phục và khung giờ hoàng hôn' 
                : 'Curated photo points with outfit palette notes and golden hour timing'}
            </p>
          </div>

          {!weather.isUserLocation && (
            <button
              onClick={requestUserLocation}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#eaddc7] hover:bg-[#decbb0] text-[#554336] font-semibold border border-[#cdbba0] flex items-center gap-1.5 self-start cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5 text-[#8a532a]" />
              <span>{lang === 'vi' ? 'Đo khoảng cách GPS' : 'Live GPS Distance'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPhotoSpots.map((spot: PhotoSpot & { distanceKm?: number }, idx: number) => {
            const isFav = favoriteSpots.includes(spot.id);
            const walkMins = spot.distanceKm ? estimateTravelMinutes(spot.distanceKm, 'walk') : null;
            const bikeMins = spot.distanceKm ? estimateTravelMinutes(spot.distanceKm, 'bike') : null;

            return (
              <div
                key={spot.id}
                id={`photo-spot-${spot.id}`}
                onClick={() => handleSelectSpot(spot, true)}
                className="parchment-card rounded-[22px] overflow-hidden border border-[#ded4c3] bg-[#fdfbf7] flex flex-col justify-between group transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${spot.gradientTheme} flex flex-col justify-between p-4`}>
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="px-2.5 py-1 rounded-full bg-[#3a2e28]/75 text-white text-xs font-semibold backdrop-blur-md">
                        {lang === 'vi' ? spot.district : spot.districtEn}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {spot.distanceKm !== undefined && (
                          <span className="px-2.5 py-1 rounded-full bg-white/85 text-[#3a2e28] text-xs font-bold flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-[#99472e]" />
                            <span>{formatDistanceKm(spot.distanceKm, lang)}</span>
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(spot.id);
                          }}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            isFav ? 'bg-[#99472e] text-white shadow-xs' : 'bg-white/60 hover:bg-white text-[#52443a]'
                          }`}
                        >
                          {isFav ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="relative z-10 text-center my-auto text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                      {spot.iconEmoji || '📸'}
                    </div>

                    <div className="relative z-10 text-white">
                      <h4 className="font-serif-title font-bold text-base leading-snug drop-shadow-md">
                        {lang === 'vi' ? spot.name : spot.nameEn}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <p className="text-xs text-[#5d4f45] leading-relaxed line-clamp-2">
                      {lang === 'vi' ? spot.concept : spot.conceptEn}
                    </p>

                    {spot.distanceKm !== undefined && (
                      <div className="flex items-center gap-2 text-[11px] text-[#6e5849] bg-[#f2e9dc] px-2 py-0.5 rounded-lg border border-[#e2d5be]">
                        <span>🚶 {walkMins} {lang === 'vi' ? 'phút' : 'min'}</span>
                        <span>•</span>
                        <span>🛵 {bikeMins} {lang === 'vi' ? 'phút' : 'min'}</span>
                      </div>
                    )}

                    {/* Lighting & Palette */}
                    <div className="p-2 rounded-[10px] bg-[#d49b48]/10 border border-[#d49b48]/25 text-xs text-[#6e4618] flex items-center gap-2">
                      <Sun className="w-3.5 h-3.5 text-[#a66d1f] shrink-0" />
                      <span className="truncate">
                        <strong>{lang === 'vi' ? 'Giờ đẹp: ' : 'Light: '}</strong>
                        {lang === 'vi' ? spot.bestLighting : spot.bestLightingEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-[#736357]">{lang === 'vi' ? 'Bảng màu:' : 'Palette:'}</span>
                      {spot.outfitSuggestion.colorPalette.slice(0, 4).map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-[#d8caa6]"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons: Focus Mode & Google Maps */}
                <div className="px-4 pb-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusCardIndex(idx);
                    }}
                    className="py-2 px-2.5 rounded-[12px] bg-[#ece2d0] hover:bg-[#dfd3bf] text-[#4a392e] text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border border-[#d4caa6]"
                  >
                    <Maximize2 className="w-3 h-3 text-[#8a532a]" />
                    <span>{lang === 'vi' ? 'Focus Mode' : 'Focus'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.mapsQuery)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="py-2 px-2.5 rounded-[12px] bg-[#3a2e28] hover:bg-[#4d3d35] text-[#fdfbf7] text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3 h-3 text-[#d49b48]" />
                    <span>Maps</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 4: Photography Journal & Field Reflection Notes */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28]">
            {lang === 'vi' ? 'Sổ Tay Góc Chụp & Kỷ Niệm Thực Địa' : 'Photo Locations & Field Journal'}
          </h3>
          <p className="text-xs sm:text-sm text-[#736357]">
            {lang === 'vi' 
              ? 'Lưu lại các ghi chú về góc chụp yêu thích, thông số máy ảnh và cảm xúc buổi chiều'
              : 'Save personal notes on favorite angles, film simulations, and lighting moments'}
          </p>
        </div>

        <SketchbookQuickNote
          targetId="photo-map-general-notes"
          targetTitle={lang === 'vi' ? 'Nhật Ký Góc Ảnh Hà Nội' : 'Hanoi Photography Journal'}
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
          items={sortedPhotoSpots}
          initialIndex={focusCardIndex}
          onClose={() => setFocusCardIndex(null)}
          lang={lang}
          type="photo"
        />
      )}
    </div>
  );
};
