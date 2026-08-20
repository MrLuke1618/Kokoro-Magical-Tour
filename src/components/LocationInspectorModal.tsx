import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Sunset, 
  Sparkles, 
  Camera, 
  Navigation, 
  Bookmark, 
  BookmarkCheck 
} from 'lucide-react';
import { Language, ThemePalette } from '../types';
import { SketchbookQuickNote } from './SketchbookQuickNote';

export interface SelectedLocationData {
  id: string;
  name: string;
  nameEn: string;
  district?: string;
  address: string;
  mapsQuery: string;
  image?: string;
  iconEmoji?: string;
  gradientTheme?: string;
  bestTime?: string;
  ghibliVibe?: string;
  ghibliVibeEn?: string;
  photoTip?: string;
  photoTipEn?: string;
  description?: string;
  descriptionEn?: string;
  category?: string;
  categoryEn?: string;
}

interface LocationInspectorModalProps {
  location: SelectedLocationData | null;
  onClose: () => void;
  lang: Language;
  theme?: ThemePalette;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const LocationInspectorModal: React.FC<LocationInspectorModalProps> = ({
  location,
  onClose,
  lang,
  theme = 'golden',
  isSaved = false,
  onToggleSave
}) => {
  const [copied, setCopied] = React.useState(false);
  const isTwilight = theme === 'twilight';

  const handleCopy = () => {
    if (!location) return;
    navigator.clipboard.writeText(location.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGoogleMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapsQuery || location.address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {location && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className={`fixed inset-0 backdrop-blur-xs ${
              isTwilight ? 'bg-[#030712]/80' : 'bg-[#261d18]/65'
            }`}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto parchment-card rounded-3xl p-5 sm:p-7 border-2 shadow-2xl relative space-y-5 z-10 ${
              isTwilight 
                ? 'bg-[#131f37] border-[#38bdf8]/50 text-[#f1f5f9]' 
                : 'bg-[#faf5ec] border-[#d49b48]/60 text-[#3a2e28]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header */}
            <div className={`flex items-start justify-between gap-3 border-b pb-3.5 ${
              isTwilight ? 'border-[#223658]' : 'border-[#ded2bc]'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                    isTwilight 
                      ? 'bg-[#38bdf8]/18 text-[#7dd3fc] border-[#38bdf8]/35' 
                      : 'bg-[#d49b48]/20 text-[#8a532a] border-[#d49b48]/30'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'vi' ? 'Toạ Độ Đang Chọn' : 'Selected Location'}
                  </span>
                  {location.district && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isTwilight ? 'bg-[#1e2f50] text-[#cbd5e1]' : 'bg-[#3a2e28]/10 text-[#3a2e28]'
                    }`}>
                      {location.district}
                    </span>
                  )}
                </div>
                <h2 className={`font-serif-title font-bold text-xl sm:text-2xl ${
                  isTwilight ? 'text-[#f8fafc]' : 'text-[#3a2e28]'
                }`}>
                  {lang === 'vi' ? location.name : location.nameEn}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                {onToggleSave && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onToggleSave(location.id)}
                    className={`p-2.5 rounded-[14px] transition-colors cursor-pointer border ${
                      isTwilight 
                        ? 'bg-[#182744] hover:bg-[#223658] text-[#cbd5e1] border-[#24385d]' 
                        : 'bg-[#ebe2d0] hover:bg-[#ded1bc] text-[#52443a] border-[#d8caa6]'
                    }`}
                    title={lang === 'vi' ? 'Lưu toạ độ' : 'Save spot'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className={`w-5 h-5 ${isTwilight ? 'text-[#38bdf8]' : 'text-[#99472e]'}`} />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={`p-2.5 rounded-[14px] transition-colors cursor-pointer border ${
                    isTwilight 
                      ? 'bg-[#182744] hover:bg-[#223658] text-[#cbd5e1] border-[#24385d]' 
                      : 'bg-[#ebe2d0] hover:bg-[#ded1bc] text-[#52443a] border-[#d8caa6]'
                  }`}
                  title={lang === 'vi' ? 'Đóng' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Atmospheric Location Vignette Banner */}
            <div className={`h-48 sm:h-56 w-full rounded-[22px] overflow-hidden relative shadow-inner bg-gradient-to-br ${location.gradientTheme || 'from-[#dfa76a] via-[#c9783e] to-[#6a3c26]'} flex flex-col justify-between p-4`}>
              <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/35 pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="px-3 py-1 rounded-full bg-[#fdfbf7]/92 text-[#8a532a] text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-[#d49b48]/40 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#d49b48]" />
                  <span>{location.category || location.district || 'Hà Nội'}</span>
                </span>

                {location.bestTime && (
                  <div className="px-3 py-1 rounded-full bg-[#1e293b]/85 text-[#fdfbf7] text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-xs">
                    <Sunset className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>{location.bestTime}</span>
                  </div>
                )}
              </div>

              {/* Central Icon Emoji */}
              <div className="relative z-10 text-center my-auto text-6xl drop-shadow-md">
                {location.iconEmoji || '✨'}
              </div>

              <div className="relative z-10 text-white flex items-center justify-between">
                <div className="text-xs font-medium text-white/90 drop-shadow-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>{location.district || 'Hanoi, Vietnam'}</span>
                </div>
                <div className="text-[11px] text-white/80 italic font-serif">
                  West Lake Hanoi
                </div>
              </div>
            </div>

            {/* Address & Interactive Google Maps Bar */}
            <div className={`p-4 rounded-[20px] border space-y-3 shadow-2xs ${
              isTwilight 
                ? 'bg-[#182744] border-[#24385d]' 
                : 'bg-[#fdfbf7] border-[#ded1be]'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 border ${
                    isTwilight 
                      ? 'bg-[#fb923c]/20 border-[#fb923c]/35 text-[#fdba74]' 
                      : 'bg-[#99472e]/15 border-[#99472e]/25 text-[#99472e]'
                  }`}>
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isTwilight ? 'text-[#94a3b8]' : 'text-[#8a7566]'
                    }`}>
                      {lang === 'vi' ? 'Địa chỉ chính xác:' : 'Exact Address:'}
                    </span>
                    <p 
                      onClick={handleCopy}
                      className={`text-xs sm:text-sm font-medium mt-0.5 cursor-pointer transition-colors ${
                        isTwilight ? 'text-[#f8fafc] hover:text-[#38bdf8]' : 'text-[#3a2e28] hover:text-[#99472e]'
                      }`}
                      title={lang === 'vi' ? 'Nhấp để sao chép địa chỉ' : 'Click to copy address'}
                    >
                      {location.address}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-[12px] active:scale-95 transition-all cursor-pointer shrink-0 border ${
                    isTwilight 
                      ? 'bg-[#1e2f50] hover:bg-[#273d67] text-[#cbd5e1] border-[#2b4168]' 
                      : 'bg-[#ede2cf] hover:bg-[#ded1be] text-[#52443a] border-[#d8caa6]'
                  }`}
                  title={lang === 'vi' ? 'Sao chép địa chỉ' : 'Copy address'}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={handleOpenGoogleMaps}
                  className={`flex-1 py-3 px-4 rounded-[14px] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isTwilight 
                      ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white active:scale-98' 
                      : 'bg-[#3a2e28] hover:bg-[#4d3d35] text-[#fdfbf7] active:scale-98'
                  }`}
                >
                  <Navigation className={`w-4 h-4 ${isTwilight ? 'text-white' : 'text-[#d49b48]'}`} />
                  <span>{lang === 'vi' ? 'Mở Chỉ Đường Google Maps' : 'Open Google Maps Directions'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>

                <button
                  onClick={handleCopy}
                  className={`py-3 px-4 rounded-[14px] font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    isTwilight 
                      ? 'bg-[#1e2f50] hover:bg-[#273d67] text-[#f1f5f9] border-[#2b4168] active:scale-98' 
                      : 'bg-[#ede3cf] hover:bg-[#ded1bd] text-[#52443a] border-[#d8caa6] active:scale-98'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">{lang === 'vi' ? 'Đã Sao Chép' : 'Address Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'vi' ? 'Sao Chép Địa Chỉ' : 'Copy Address'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Atmosphere & Description */}
            {(location.description || location.descriptionEn) && (
              <div className={`space-y-1.5 text-xs sm:text-sm leading-relaxed ${
                isTwilight ? 'text-[#cbd5e1]' : 'text-[#5d4e44]'
              }`}>
                <p>{lang === 'vi' ? location.description : location.descriptionEn}</p>
              </div>
            )}

            {/* Ghibli Inspiration Note */}
            {(location.ghibliVibe || location.ghibliVibeEn) && (
              <div className={`p-3.5 rounded-[16px] text-xs flex items-start gap-2.5 border ${
                isTwilight 
                  ? 'bg-[#34d399]/15 border-[#34d399]/30 text-[#e2e8f0]' 
                  : 'bg-[#5d6e58]/10 border-[#5d6e58]/25 text-[#3b4737]'
              }`}>
                <span className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 ${
                  isTwilight ? 'bg-[#34d399]/25 text-[#6ee7b7]' : 'bg-[#5d6e58]/20 text-[#3b4737]'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className={`font-bold ${isTwilight ? 'text-[#6ee7b7]' : 'text-[#2e3a2b]'}`}>
                    {lang === 'vi' ? 'Cảm hứng nghệ thuật: ' : 'Artistic Inspiration: '}
                  </span>
                  <span>{lang === 'vi' ? location.ghibliVibe : location.ghibliVibeEn}</span>
                </div>
              </div>
            )}

            {/* Photo Tip */}
            {(location.photoTip || location.photoTipEn) && (
              <div className={`p-3.5 rounded-[16px] text-xs flex items-start gap-2.5 border ${
                isTwilight 
                  ? 'bg-[#38bdf8]/15 border-[#38bdf8]/30 text-[#e2e8f0]' 
                  : 'bg-[#d49b48]/10 border-[#d49b48]/25 text-[#6e4618]'
              }`}>
                <span className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 ${
                  isTwilight ? 'bg-[#38bdf8]/25 text-[#7dd3fc]' : 'bg-[#d49b48]/25 text-[#a66d1f]'
                }`}>
                  <Camera className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className={`font-bold ${isTwilight ? 'text-[#7dd3fc]' : 'text-[#6e4618]'}`}>
                    {lang === 'vi' ? 'Mẹo Chụp Ảnh Hoàng Hôn: ' : 'Sunset Photo Angle Tip: '}
                  </span>
                  <span>{lang === 'vi' ? location.photoTip : location.photoTipEn}</span>
                </div>
              </div>
            )}

            {/* Handwritten Sketchbook Quick Note */}
            <div className="pt-2">
              <SketchbookQuickNote
                itemId={`location_${location.id}`}
                itemTitle={lang === 'vi' ? location.name : location.nameEn}
                lang={lang}
                theme={theme}
                defaultOpen={true}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
