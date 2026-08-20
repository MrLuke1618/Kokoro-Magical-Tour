import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Sparkles, 
  Clock, 
  Tag, 
  X, 
  ChevronDown, 
  LocateFixed, 
  ExternalLink,
  ChevronRight,
  Compass,
  Check
} from 'lucide-react';
import { Language, ThemePalette } from '../types';
import { useLocationRecommendations } from '../hooks/useLocationRecommendations';
import { formatDistance } from '../services/recommendationService';

interface LocationRecommendationCardProps {
  category: 'sunset' | 'deals' | 'food' | 'photomap';
  lang: Language;
  theme?: ThemePalette;
  onInspectSpot?: (mapsQuery: string, title: string) => void;
  className?: string;
}

export const LocationRecommendationCard: React.FC<LocationRecommendationCardProps> = ({
  category,
  lang,
  theme = 'golden',
  onInspectSpot,
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { 
    coords, 
    recommendation, 
    setDistrict, 
    requestGpsLocation, 
    isLocating, 
    presets 
  } = useLocationRecommendations(category, lang);

  const isTwilight = theme === 'twilight';
  const { item, districtName, reasonVi, reasonEn } = recommendation;
  const distFormatted = formatDistance(item.distanceMeters, lang);

  if (isDismissed) {
    return (
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setIsDismissed(false)}
          className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
            isTwilight
              ? 'bg-[#131f37] text-[#94a3b8] hover:text-[#38bdf8] border-[#24375b]'
              : 'bg-[#faf6ee] text-[#7a685c] hover:text-[#99472e] border-[#ded4c3]'
          }`}
        >
          <Sparkles className="w-3 h-3 text-[#d49b48]" />
          <span>{lang === 'vi' ? 'Xem gợi ý gần bạn' : 'Show nearby recommendation'}</span>
        </button>
      </div>
    );
  }

  const badgeStyles = {
    sunset: isTwilight 
      ? 'bg-[#fb923c]/15 text-[#fb923c] border-[#fb923c]/30' 
      : 'bg-[#ffeedd] text-[#b85d19] border-[#f5cb9f]',
    deal: isTwilight 
      ? 'bg-[#34d399]/15 text-[#34d399] border-[#34d399]/30' 
      : 'bg-[#e8f5ec] text-[#2c7a4d] border-[#bfe2ce]',
    cafe: isTwilight 
      ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30' 
      : 'bg-[#f4efe4] text-[#825c28] border-[#dfd2be]',
    photo: isTwilight 
      ? 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/30' 
      : 'bg-[#f4eef9] text-[#7a489c] border-[#dfccee]'
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(item.mapsQuery || item.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl border p-3.5 sm:p-4 shadow-sm transition-all ${
        isTwilight
          ? 'bg-gradient-to-r from-[#131f37] via-[#162544] to-[#131f37] border-[#24375b] text-[#f8fafc]'
          : 'bg-gradient-to-r from-[#fcf9f2] via-[#faf5eb] to-[#f7f2e4] border-[#ded4c3] text-[#3a2e28]'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left info area */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border shadow-2xs ${
            isTwilight
              ? 'bg-[#1e2f50] border-[#2a4370]'
              : 'bg-[#f3ebd9] border-[#ded0b8]'
          }`}>
            {item.iconEmoji}
          </div>

          <div className="min-w-0 flex-1">
            {/* Top pill badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyles[item.badgeType]}`}>
                <MapPin className="w-2.5 h-2.5" />
                <span>{lang === 'vi' ? `Cách bạn ${distFormatted}` : `${distFormatted} away`}</span>
                <span className="opacity-60">•</span>
                <span>{lang === 'vi' ? `${item.walkingMinutes}p đi bộ` : `${item.walkingMinutes}m walk`}</span>
              </span>

              {item.discountPercent && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30">
                  <Tag className="w-2.5 h-2.5" />
                  <span>-{item.discountPercent}%</span>
                </span>
              )}

              {item.bestTime && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  isTwilight ? 'bg-[#1e2f50] text-[#94a3b8]' : 'bg-[#ede3d1] text-[#6b584d]'
                }`}>
                  <Clock className="w-2.5 h-2.5" />
                  <span>{item.bestTime}</span>
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="flex items-baseline gap-2">
              <h4 className="font-serif font-bold text-sm sm:text-base leading-snug truncate">
                {lang === 'vi' ? item.title : item.titleEn}
              </h4>
            </div>

            {/* Personalized reasoning description */}
            <p className={`text-xs mt-0.5 line-clamp-1 ${
              isTwilight ? 'text-[#94a3b8]' : 'text-[#6e5d50]'
            }`}>
              {lang === 'vi' ? item.highlight : item.highlightEn}
            </p>
          </div>
        </div>

        {/* Right action area */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          
          {/* Location / District Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isTwilight
                  ? 'bg-[#182744] hover:bg-[#20345b] text-[#cbd5e1] border-[#2a3f68]'
                  : 'bg-[#ede4d3] hover:bg-[#e2d5bf] text-[#55463b] border-[#d8c9b2]'
              }`}
              title={lang === 'vi' ? 'Đổi khu vực định vị' : 'Change location'}
            >
              <Compass className="w-3 h-3 text-[#d49b48]" />
              <span className="max-w-[80px] sm:max-w-[100px] truncate">{districtName}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  transition={{ duration: 0.12 }}
                  className={`absolute right-0 top-full mt-1.5 w-52 rounded-xl shadow-xl border p-1.5 z-40 ${
                    isTwilight
                      ? 'bg-[#0f1a30] border-[#24375b] text-[#f8fafc]'
                      : 'bg-[#fdfbf7] border-[#dcd1be] text-[#3a2e28]'
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#88786c]">
                    {lang === 'vi' ? 'Chọn vị trí của bạn' : 'Select your location'}
                  </div>

                  <button
                    onClick={() => {
                      requestGpsLocation();
                      setIsDropdownOpen(false);
                    }}
                    disabled={isLocating}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer mb-1 ${
                      coords.isCustom
                        ? (isTwilight ? 'bg-[#38bdf8]/15 text-[#38bdf8]' : 'bg-[#e9ded0] text-[#99472e] font-semibold')
                        : (isTwilight ? 'hover:bg-[#182744] text-[#cbd5e1]' : 'hover:bg-[#f4ecdf] text-[#55463b]')
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <LocateFixed className={`w-3 h-3 ${isLocating ? 'animate-spin text-[#38bdf8]' : 'text-[#d49b48]'}`} />
                      <span>{isLocating ? (lang === 'vi' ? 'Đang định vị...' : 'Locating...') : (lang === 'vi' ? 'Vị trí GPS hiện tại' : 'Current GPS Location')}</span>
                    </span>
                    {coords.isCustom && <Check className="w-3 h-3" />}
                  </button>

                  <div className={`h-px my-1 ${isTwilight ? 'bg-[#1e2f50]' : 'bg-[#ede4d3]'}`} />

                  {presets.map((preset) => {
                    const isSelected = !coords.isCustom && districtName.toLowerCase().includes(preset.id.split('-')[0]);
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setDistrict(preset.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? (isTwilight ? 'bg-[#38bdf8]/15 text-[#38bdf8] font-bold' : 'bg-[#ecdcc5] text-[#99472e] font-bold')
                            : (isTwilight ? 'hover:bg-[#182744] text-[#cbd5e1]' : 'hover:bg-[#f4ecdf] text-[#55463b]')
                        }`}
                      >
                        <span>{lang === 'vi' ? preset.nameVi : preset.nameEn}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary Action Button (Navigate / View on Maps) */}
          <button
            onClick={handleOpenMaps}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
              isTwilight
                ? 'bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0b1324] font-semibold'
                : 'bg-[#99472e] hover:bg-[#833a23] text-[#fdfbf7]'
            }`}
            title={lang === 'vi' ? 'Mở Google Maps chỉ đường' : 'Open Google Maps directions'}
          >
            <Navigation className="w-3 h-3" />
            <span>{lang === 'vi' ? 'Chỉ đường' : 'Directions'}</span>
          </button>

          {/* Close/Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer opacity-70 hover:opacity-100 ${
              isTwilight ? 'hover:bg-[#1e2f50] text-[#94a3b8]' : 'hover:bg-[#ede3d1] text-[#7a685c]'
            }`}
            title={lang === 'vi' ? 'Ẩn gợi ý' : 'Dismiss'}
            aria-label="Dismiss recommendation"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};
