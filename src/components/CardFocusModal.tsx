import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Star, 
  ShoppingBag, 
  Heart, 
  Flame, 
  Compass, 
  Music, 
  Palette,
  Sun,
  Moon,
  Type
} from 'lucide-react';
import { Language, FoodSpot, DealItem, ThemePalette } from '../types';
import { SketchbookQuickNote } from './SketchbookQuickNote';

export type FocusCardType = 'cafe' | 'deal';

export interface CardFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: FocusCardType;
  items: (FoodSpot | DealItem)[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  lang: Language;
  theme?: ThemePalette;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const CardFocusModal: React.FC<CardFocusModalProps> = ({
  isOpen,
  onClose,
  type,
  items,
  currentIndex,
  onIndexChange,
  lang,
  theme = 'golden',
  isSaved = false,
  onToggleSave
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [readingTheme, setReadingTheme] = useState<'parchment' | 'night' | 'minimal'>(
    theme === 'twilight' ? 'night' : 'parchment'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const currentItem = items[currentIndex];

  // Stop speech when switching or unmounting
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    stopSpeech();
    setCopied(false);
  }, [currentIndex, stopSpeech, isOpen]);

  // Keyboard navigation (Esc to close, Left/Right arrows to browse)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          onIndexChange(currentIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < items.length - 1) {
          onIndexChange(currentIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onIndexChange]);

  if (!isOpen || !currentItem) return null;

  const isCafe = type === 'cafe';
  const cafeItem = isCafe ? (currentItem as FoodSpot) : null;
  const dealItem = !isCafe ? (currentItem as DealItem) : null;

  // Text to Speech narrative generator
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';
    if (isCafe && cafeItem) {
      speechText = lang === 'vi'
        ? `${cafeItem.name}. ${cafeItem.category}. ${cafeItem.description}. Món đặc sắc là ${cafeItem.signatureDish}. Góc ngồi đẹp nhất: ${cafeItem.bestSeat}. Địa chỉ tại ${cafeItem.address}.`
        : `${cafeItem.nameEn}. ${cafeItem.categoryEn}. ${cafeItem.descriptionEn}. Signature specialty: ${cafeItem.signatureDishEn}. Best seat recommendation: ${cafeItem.bestSeatEn}. Located at ${cafeItem.address}.`;
    } else if (dealItem) {
      speechText = lang === 'vi'
        ? `${dealItem.title}. Danh mục: ${dealItem.category}. Phong cách: ${dealItem.aestheticTag}. Giá ưu đãi ${dealItem.salePrice.toLocaleString('vi-VN')} đồng, giảm ${dealItem.discountPercent} phần trăm.`
        : `${dealItem.titleEn}. Category: ${dealItem.categoryEn}. Aesthetic: ${dealItem.aestheticTagEn}. Special offer price: ${dealItem.salePrice.toLocaleString('vi-VN')} Vietnamese Dong, discount of ${dealItem.discountPercent} percent.`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformUrl = (platform: 'Lazada' | 'TikTok Shop', query: string) => {
    const encoded = encodeURIComponent(query);
    if (platform === 'Lazada') {
      return `https://www.lazada.vn/catalog/?q=${encoded}`;
    }
    return `https://www.tiktok.com/search?q=${encoded}`;
  };

  // Font size classes
  const fontClass = {
    normal: 'text-sm leading-relaxed',
    large: 'text-base leading-loose sm:text-lg',
    xlarge: 'text-lg leading-loose sm:text-xl'
  }[fontSize];

  // Theme styling definitions
  const themeStyles = {
    parchment: {
      bg: 'bg-[#faf5ec]',
      cardBg: 'bg-[#f4ecdf]/70',
      border: 'border-[#d49b48]/50',
      text: 'text-[#3a2e28]',
      textMuted: 'text-[#6e5d50]',
      title: 'text-[#2a201a]',
      subcard: 'bg-[#fdfbf7] border-[#ded0b8]',
      accentBadge: 'bg-[#d49b48]/15 text-[#8a532a] border-[#d49b48]/30',
      tag: 'bg-[#ebdcc2] text-[#554336]'
    },
    night: {
      bg: 'bg-[#0f172a]',
      cardBg: 'bg-[#1e293b]/70',
      border: 'border-[#38bdf8]/40',
      text: 'text-[#e2e8f0]',
      textMuted: 'text-[#94a3b8]',
      title: 'text-[#f8fafc]',
      subcard: 'bg-[#1e293b] border-[#334155]',
      accentBadge: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
      tag: 'bg-[#334155] text-[#cbd5e1]'
    },
    minimal: {
      bg: 'bg-[#18181b]',
      cardBg: 'bg-[#27272a]/70',
      border: 'border-[#52525b]/50',
      text: 'text-[#f4f4f5]',
      textMuted: 'text-[#a1a1aa]',
      title: 'text-[#ffffff]',
      subcard: 'bg-[#27272a] border-[#3f3f46]',
      accentBadge: 'bg-white/10 text-white border-white/20',
      tag: 'bg-[#3f3f46] text-[#d4d4d8]'
    }
  }[readingTheme];

  return (
    <AnimatePresence>
      <div 
        id="card-focus-modal-root"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-text overflow-hidden"
      >
        {/* Full-Screen Deep Distraction-Free Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-[#0c0906]/85 backdrop-blur-md cursor-pointer"
          onClick={onClose}
          aria-label="Close focus modal"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`relative z-10 w-full flex flex-col rounded-3xl border-2 shadow-2xl transition-all duration-300 ${themeStyles.bg} ${themeStyles.border} ${themeStyles.text} ${
            isMaximized 
              ? 'fixed inset-2 sm:inset-4 max-w-none h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)]' 
              : 'max-w-4xl max-h-[92vh] h-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Focus Mode Top Toolbar */}
          <div className={`shrink-0 px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 sm:gap-4 ${
            readingTheme === 'night' ? 'border-[#334155]' : readingTheme === 'minimal' ? 'border-[#3f3f46]' : 'border-[#e4d6c0]'
          }`}>
            {/* Left: Focus Badge & Counter */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d49b48]/20 text-[#8a532a] border border-[#d49b48]/40 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-[#d49b48]" />
                <span className="hidden sm:inline">
                  {lang === 'vi' ? 'Chế Độ Đọc Tập Trung' : 'Focus Reading Mode'}
                </span>
                <span className="sm:hidden">Focus</span>
              </div>

              <div className="text-xs font-semibold opacity-70 truncate">
                {currentIndex + 1} / {items.length}{' '}
                <span className="hidden md:inline">
                  {isCafe 
                    ? (lang === 'vi' ? 'Quán Cà Phê Hồ Tây' : 'Hanoi Cafe Spots')
                    : (lang === 'vi' ? 'Món Đồ Ghibli' : 'Ghibli Deal Collection')}
                </span>
              </div>
            </div>

            {/* Right: Reading Controls (Audio, Font Size, Theme, Prev/Next, Expand, Close) */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Text to Speech Narration */}
              <button
                onClick={handleToggleSpeech}
                className={`p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-[#99472e] text-white border-[#99472e] shadow-xs animate-pulse'
                    : `${themeStyles.subcard} hover:opacity-80`
                }`}
                title={lang === 'vi' ? (isSpeaking ? 'Dừng đọc truyện' : 'Đọc diễn cảm') : (isSpeaking ? 'Stop narration' : 'Listen with Audio')}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Font Size Selector */}
              <div className="hidden sm:flex items-center rounded-xl p-0.5 border border-current/15">
                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      fontSize === size ? 'bg-[#d49b48] text-white shadow-xs' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                  </button>
                ))}
              </div>

              {/* Paper / Reading Mode Selector */}
              <div className="flex items-center rounded-xl p-0.5 border border-current/15">
                <button
                  onClick={() => setReadingTheme('parchment')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    readingTheme === 'parchment' ? 'bg-[#d49b48] text-white shadow-xs' : 'opacity-60 hover:opacity-100'
                  }`}
                  title="Giấy Cổ Điển (Parchment)"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReadingTheme('night')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    readingTheme === 'night' ? 'bg-[#38bdf8] text-black shadow-xs' : 'opacity-60 hover:opacity-100'
                  }`}
                  title="Đêm Hồ Tây (Indigo Night)"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Prev & Next in toolbar */}
              <div className="flex items-center gap-0.5 pl-1">
                <button
                  onClick={() => currentIndex > 0 && onIndexChange(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg border border-current/15 disabled:opacity-30 hover:bg-current/10 cursor-pointer disabled:cursor-not-allowed transition-all"
                  title="Item trước (Phím ←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => currentIndex < items.length - 1 && onIndexChange(currentIndex + 1)}
                  disabled={currentIndex === items.length - 1}
                  className="p-1.5 rounded-lg border border-current/15 disabled:opacity-30 hover:bg-current/10 cursor-pointer disabled:cursor-not-allowed transition-all"
                  title="Item kế tiếp (Phím →)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Full-Screen Toggle */}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="hidden md:flex p-2 rounded-xl border border-current/15 hover:bg-current/10 cursor-pointer transition-all"
                title={isMaximized ? 'Thu nhỏ lại' : 'Mở rộng toàn màn hình'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current transition-all cursor-pointer ml-1"
                title="Đóng chế độ Focus (Esc)"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* 2. Modal Body (Scrollable, High-Legibility Focus Layout) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
            {/* Cafe Focus Mode Content */}
            {isCafe && cafeItem && (
              <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
                {/* Hero Header Banner with Atmospheric Aura */}
                <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-br ${cafeItem.gradientTheme || 'from-[#ecd6b7] to-[#8a532a]'} text-white shadow-lg flex flex-col justify-between min-h-[220px]`}>
                  <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/40 pointer-events-none" />
                  
                  {/* Top info row */}
                  <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-black/35 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                        {lang === 'vi' ? cafeItem.category : cafeItem.categoryEn}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/90 text-[#3a2e28] text-xs font-bold shadow-xs">
                        {cafeItem.priceRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{cafeItem.rating} / 5.0</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="relative z-10 my-4 flex items-center gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl sm:text-5xl shadow-md shrink-0">
                      <span>{cafeItem.iconEmoji || '☕'}</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#faedd8] font-semibold">
                        {lang === 'vi' ? 'Điểm hẹn hoàng hôn trứ danh' : 'Iconic Sunset Cafe Spot'}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-white leading-tight drop-shadow-md">
                        {lang === 'vi' ? cafeItem.name : cafeItem.nameEn}
                      </h2>
                    </div>
                  </div>

                  {/* Bottom Address snippet */}
                  <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm text-white/90">
                    <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="truncate">{cafeItem.address}</span>
                  </div>
                </div>

                {/* Chapter I: The Story & Atmosphere (Long-form Reading Experience) */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 ${themeStyles.subcard}`}>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase opacity-75">
                    <Sparkles className="w-4 h-4 text-[#d49b48]" />
                    <span>{lang === 'vi' ? 'Chương I • Không Gian & Câu Chuyện Hoàng Hôn' : 'Chapter I • Atmosphere & Sunset Narrative'}</span>
                  </div>

                  <p className={`font-serif text-[#3a2e28] dark:text-[#f1f5f9] ${fontClass} leading-relaxed sm:leading-loose text-justify`}>
                    {lang === 'vi' ? cafeItem.description : cafeItem.descriptionEn}
                  </p>

                  <div className="pt-2 border-t border-current/10 flex items-center gap-2 text-xs italic opacity-75">
                    <Compass className="w-3.5 h-3.5 text-[#d49b48]" />
                    <span>
                      {lang === 'vi' 
                        ? 'Thời điểm lý tưởng nhất: 17:15 - 18:30 khi những ráng mây đỏ cam bao phủ mặt nước Hồ Tây.' 
                        : 'Optimal visiting window: 17:15 - 18:30 as fiery peach clouds glaze the ripples of West Lake.'}
                    </span>
                  </div>
                </div>

                {/* Chapter II & III: Signature Dish & Best Seating Guide */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Signature Dish */}
                  <div className={`p-5 sm:p-6 rounded-3xl border shadow-2xs space-y-3 ${themeStyles.subcard}`}>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#d49b48]">
                      <span className="text-base">✨</span>
                      <span>{lang === 'vi' ? 'Chương II • Món Đặc Sắc (Signature)' : 'Chapter II • Signature Taste'}</span>
                    </div>
                    <h4 className="font-serif-title font-bold text-lg">
                      {lang === 'vi' ? cafeItem.signatureDish : cafeItem.signatureDishEn}
                    </h4>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                      {lang === 'vi'
                        ? 'Được pha chế tinh tế, giữ trọn vị đậm đà nguyên bản hòa quyện cùng gió mát phương bắc chiều tà.'
                        : 'Delicately crafted to balance authentic rich flavors with the refreshing northern dusk breeze.'}
                    </p>
                  </div>

                  {/* Best Seat Tip */}
                  <div className={`p-5 sm:p-6 rounded-3xl border shadow-2xs space-y-3 ${themeStyles.subcard}`}>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#5d6e58] dark:text-[#86efac]">
                      <span className="text-base">🪑</span>
                      <span>{lang === 'vi' ? 'Chương III • Tọa Độ Ngắm Đẹp Nhất' : 'Chapter III • Best Viewing Seat'}</span>
                    </div>
                    <h4 className="font-serif-title font-bold text-lg">
                      {lang === 'vi' ? cafeItem.bestSeat : cafeItem.bestSeatEn}
                    </h4>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                      {lang === 'vi'
                        ? 'Góc nhìn thoáng đãng, đón trọn vẹn ánh sáng vàng dịu tự nhiên phù hợp đọc sách hoặc ghi chép ký họa.'
                        : 'Unobstructed scenic lake panorama capturing soft natural golden light, ideal for reading or journaling.'}
                    </p>
                  </div>
                </div>

                {/* Chapter IV: Sound & Action Guidance */}
                <div className={`p-5 sm:p-6 rounded-3xl border ${themeStyles.subcard} space-y-4`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold opacity-75">
                      <Music className="w-4 h-4 text-[#d49b48]" />
                      <span>{lang === 'vi' ? 'Giai Điệu Khuyên Nghe: Joe Hisaishi - One Summer’s Day' : 'Atmospheric Soundtrack: Joe Hisaishi - One Summer’s Day'}</span>
                    </div>
                    <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#d49b48]/20 text-[#8a532a] dark:text-[#fcd34d]">
                      {lang === 'vi' ? 'Chỉ đường & Tọa độ' : 'Coordinates & Map'}
                    </div>
                  </div>

                  {/* Interactive Map and Address Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-xl bg-[#99472e]/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#99472e]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium truncate">{cafeItem.address}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyText(cafeItem.address)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold border border-current/20 hover:bg-current/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? (lang === 'vi' ? 'Đã chép' : 'Copied') : (lang === 'vi' ? 'Sao chép địa chỉ' : 'Copy')}</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafeItem.mapsQuery || cafeItem.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#3a2e28] hover:bg-[#4d3d35] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>{lang === 'vi' ? 'Mở Google Maps' : 'Open in Maps'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Chapter V: Personal Sketchbook & Field Notes */}
                <div className={`p-5 sm:p-6 rounded-3xl border ${themeStyles.subcard} space-y-2`}>
                  <SketchbookQuickNote
                    itemId={`cafe_${cafeItem.id}`}
                    itemTitle={lang === 'vi' ? cafeItem.name : cafeItem.nameEn}
                    lang={lang}
                    theme={theme}
                    defaultOpen={true}
                  />
                </div>
              </div>
            )}

            {/* Deal Focus Mode Content */}
            {!isCafe && dealItem && (
              <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
                {/* Hero Header Banner */}
                <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-br ${dealItem.gradientTheme || 'from-[#f2e6d6] to-[#b39c84]'} text-[#3a2e28] shadow-lg flex flex-col justify-between min-h-[220px]`}>
                  <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-black/10 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#99472e] text-white text-xs font-bold shadow-xs flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-[#f4d06f]" />
                        <span>-{dealItem.discountPercent}% OFF</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/90 text-[#3a2e28] text-xs font-bold shadow-xs">
                        {lang === 'vi' ? dealItem.category : dealItem.categoryEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-[#3a2e28] text-xs font-bold shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-[#d49b48] text-[#d49b48]" />
                        <span>{dealItem.rating} ({dealItem.soldCount.toLocaleString()} {lang === 'vi' ? 'đã bán' : 'sold'})</span>
                      </div>
                      {onToggleSave && (
                        <button
                          onClick={() => onToggleSave(dealItem.id)}
                          className="p-2 rounded-full bg-white/90 text-[#3a2e28] hover:text-[#99472e] shadow-xs cursor-pointer active:scale-95"
                          title={lang === 'vi' ? 'Lưu sản phẩm' : 'Bookmark deal'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#99472e] text-[#99472e]' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="relative z-10 my-4 flex items-center gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 flex items-center justify-center text-4xl sm:text-5xl shadow-md shrink-0">
                      <span>{dealItem.iconEmoji || '✨'}</span>
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/10 mb-1">
                        <span>🌸</span>
                        <span>{lang === 'vi' ? dealItem.aestheticTag : dealItem.aestheticTagEn}</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2a1d17] leading-tight">
                        {lang === 'vi' ? dealItem.title : dealItem.titleEn}
                      </h2>
                    </div>
                  </div>

                  {/* Color Palette Preview */}
                  {dealItem.colorSwatches && dealItem.colorSwatches.length > 0 && (
                    <div className="relative z-10 flex items-center gap-2 text-xs font-medium bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                      <Palette className="w-3.5 h-3.5 text-[#635348]" />
                      <span>{lang === 'vi' ? 'Bảng màu mộc mạc:' : 'Tonal Swatches:'}</span>
                      <div className="flex items-center gap-1.5 ml-1">
                        {dealItem.colorSwatches.map((hex, idx) => (
                          <span 
                            key={idx} 
                            className="w-4 h-4 rounded-full border border-black/20 shadow-2xs" 
                            style={{ backgroundColor: hex }} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Chapter I: Product Narrative & Ghibli Aesthetic */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 ${themeStyles.subcard}`}>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase opacity-75">
                    <Sparkles className="w-4 h-4 text-[#d49b48]" />
                    <span>{lang === 'vi' ? 'Chương I • Cảm Hứng & Phong Cách Ghibli' : 'Chapter I • Design Narrative & Ghibli Style'}</span>
                  </div>

                  <p className={`font-serif text-[#3a2e28] dark:text-[#f1f5f9] ${fontClass} leading-relaxed sm:leading-loose text-justify`}>
                    {lang === 'vi' 
                      ? `Lấy cảm hứng từ những gam màu đất ấm, vải dệt tự nhiên và nhịp sống chậm rãi của các nhân vật nữ chính trong hoạt hình Ghibli. Món đồ được chế tác chú trọng sự thoáng khí, nhẹ nhàng và bền bỉ theo thời gian — hoàn hảo để bạn diện khi dạo bước đón hoàng hôn bên bờ Hồ Tây hoặc ngồi ký họa trong quán cà phê quen thuộc.`
                      : `Inspired by warm earth tones, raw natural textiles, and the peaceful slow-living aesthetic of Ghibli heroines. Carefully selected for breathability, softness, and timeless artisanal durability — ideal for lakeside dusk walks and quiet cafe watercolor sketching.`}
                  </p>
                </div>

                {/* Chapter II: Pricing, Value Breakdown & Buying Outlets */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xs space-y-6 ${themeStyles.subcard}`}>
                  <div className="flex items-center justify-between border-b border-current/10 pb-4">
                    <div>
                      <span className="text-xs opacity-70 block mb-1">
                        {lang === 'vi' ? 'Mức giá ưu đãi hiện hành' : 'Flash Sale Price'}
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-bold font-serif-title text-[#99472e]">
                          {dealItem.salePrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-base text-[#9c897b] line-through">
                          {dealItem.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#5d6e58]/20 text-[#2e3b2b] dark:text-[#86efac]">
                        {lang === 'vi' 
                          ? `Tiết kiệm ${(dealItem.originalPrice - dealItem.salePrice).toLocaleString('vi-VN')}đ` 
                          : `Save ${(dealItem.originalPrice - dealItem.salePrice).toLocaleString('vi-VN')}đ`}
                      </span>
                      <span className="block text-[11px] opacity-60 mt-1">
                        {lang === 'vi' ? 'Nền tảng chính hãng' : 'Authentic Platform Deals'}
                      </span>
                    </div>
                  </div>

                  {/* Platform Quick Buy Buttons */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold opacity-75 block">
                      {lang === 'vi' ? 'Xem trực tiếp & Nhận mã giảm giá tại sàn:' : 'Direct Merchant & Voucher Links:'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={getPlatformUrl('Lazada', lang === 'vi' ? dealItem.title : dealItem.titleEn)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 px-4 rounded-2xl bg-[#d49b48] hover:bg-[#be8737] active:scale-[0.98] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{lang === 'vi' ? 'Tìm & Mua Trên Lazada' : 'Shop on Lazada'}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>

                      <a
                        href={getPlatformUrl('TikTok Shop', lang === 'vi' ? dealItem.title : dealItem.titleEn)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 px-4 rounded-2xl bg-[#3a2e28] hover:bg-[#4d3d35] active:scale-[0.98] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                      >
                        <span>{lang === 'vi' ? 'Tìm & Mua Trên TikTok Shop' : 'Shop on TikTok'}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Footer Navigation Bar */}
          <div className={`shrink-0 px-4 sm:px-6 py-3 border-t flex items-center justify-between gap-3 text-xs ${
            readingTheme === 'night' ? 'border-[#334155]' : readingTheme === 'minimal' ? 'border-[#3f3f46]' : 'border-[#e4d6c0]'
          }`}>
            <button
              onClick={() => currentIndex > 0 && onIndexChange(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-current/15 disabled:opacity-30 hover:bg-current/10 cursor-pointer disabled:cursor-not-allowed transition-all font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'vi' ? 'Mục trước' : 'Previous'}</span>
            </button>

            <span className="opacity-60 text-[11px] text-center">
              {lang === 'vi' ? 'Mẹo: Dùng phím ← / → để chuyển mục, Esc để thoát' : 'Tip: Use ← / → keys to navigate, Esc to exit'}
            </span>

            <button
              onClick={() => currentIndex < items.length - 1 && onIndexChange(currentIndex + 1)}
              disabled={currentIndex === items.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-current/15 disabled:opacity-30 hover:bg-current/10 cursor-pointer disabled:cursor-not-allowed transition-all font-medium"
            >
              <span className="hidden sm:inline">{lang === 'vi' ? 'Mục kế tiếp' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
