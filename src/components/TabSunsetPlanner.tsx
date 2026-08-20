import React, { useState } from 'react';
import { 
  Sunset, 
  CloudRain, 
  Wind, 
  Droplets, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Check, 
  Compass,
  Zap,
  LocateFixed
} from 'lucide-react';
import { Language, SunsetSpot, ThemePalette } from '../types';
import { SUNSET_SPOTS } from '../data/mockData';
import { GhibliLiveVoiceCompanion } from './GhibliLiveVoiceCompanion';
import { LocationInspectorModal, SelectedLocationData } from './LocationInspectorModal';
import { LocationRecommendationCard } from './LocationRecommendationCard';
import { SketchbookWeatherIcon, WeatherConditionType } from './SketchbookWeatherIcon';
import { useLocationWeather } from '../hooks/useLocationWeather';

interface TabSunsetPlannerProps {
  lang: Language;
  theme?: ThemePalette;
}

export const TabSunsetPlanner: React.FC<TabSunsetPlannerProps> = ({ lang, theme = 'golden' }) => {
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SelectedLocationData | null>(null);
  const [activeCardId, setActiveCardId] = useState<string>(SUNSET_SPOTS[0].id);

  // Live Location & Weather Hook
  const { weather, requestUserLocation, refreshWeather } = useLocationWeather(lang);
  const [selectedConditionPreview, setSelectedConditionPreview] = useState<WeatherConditionType | null>(null);
  
  const [dynamicAiPlan, setDynamicAiPlan] = useState<string>(
    lang === 'vi' 
      ? 'Hồ Tây chiều nay đón ráng vàng đẹp nhất từ 17:40 đến 18:05 tại ngã ba Quảng Bá. Hãy chọn ghế sát mép nước để tránh ánh nắng gắt trực diện vào ống kính.'
      : 'West Lake catches prime golden light between 5:40 PM and 6:05 PM near Quang Ba. Choose a shoreline seat to avoid direct lens glare.'
  );

  const handleSelectSpot = (spot: SunsetSpot, openModal = true) => {
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
      bestTime: spot.bestTime,
      ghibliVibe: spot.ghibliVibe,
      ghibliVibeEn: spot.ghibliVibeEn,
      photoTip: spot.photoTip,
      photoTipEn: spot.photoTipEn,
      description: spot.description,
      descriptionEn: spot.descriptionEn
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

  // Dynamic 1-Click AI Sunset Plan (Always generates a fresh unique response)
  const handleGenerateFreshPlan = async () => {
    setIsGeneratingPlan(true);
    const currentHour = new Date().getHours() || 17;
    const randomSpot = SUNSET_SPOTS[Math.floor(Math.random() * SUNSET_SPOTS.length)];
    setActiveCardId(randomSpot.id);

    try {
      const res = await fetch('/api/ai/sunset-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHour,
          weather: `${weather.weatherDescriptionEn}, ${weather.temperature}°C, Golden Hour ${weather.goldenHourStart}-${weather.goldenHourEnd}`,
          lang,
          seed: Date.now() + Math.floor(Math.random() * 1000)
        })
      });
      const data = await res.json();
      if (data.text) {
        setDynamicAiPlan(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Personalized Location Recommendation Card */}
      <LocationRecommendationCard 
        category="sunset" 
        lang={lang} 
        theme={theme} 
      />

      {/* Location Permission Request Banner */}
      {!weather.isUserLocation && (
        <div className="p-4 sm:p-5 rounded-[22px] bg-gradient-to-r from-[#f7eedf] via-[#fbf6ed] to-[#f5ebd8] border-2 border-[#d49b48]/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d49b48]/20 text-[#8a532a] border border-[#d49b48]/40 flex items-center justify-center shrink-0 mt-0.5">
              <LocateFixed className="w-5 h-5 text-[#995c1a]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-serif-title font-bold text-sm sm:text-base text-[#3a2e28] flex items-center gap-2">
                <span>{lang === 'vi' ? 'Cập Nhật Thời Tiết Theo Vị Trí Của Bạn' : 'Live Weather for Your Exact Location'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d49b48]/20 text-[#8a532a] font-bold">
                  GPS
                </span>
              </h4>
              <p className="text-xs text-[#635246] max-w-2xl leading-relaxed">
                {lang === 'vi' 
                  ? 'Cho phép ứng dụng truy cập vị trí hiện tại để tính toán chính xác nhiệt độ, độ ẩm và đếm ngược giờ hoàng hôn (Golden Hour) chuẩn từng phút tại nơi bạn đang đứng.'
                  : 'Allow location access to calculate exact live temperature, humidity, wind, and precise local Golden Hour sunset times for where you are right now.'}
              </p>
            </div>
          </div>

          <button
            id="request-user-gps-location-btn"
            onClick={requestUserLocation}
            disabled={weather.status === 'loading'}
            className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-[#3a2e28] hover:bg-[#524137] active:scale-97 text-[#fdfbf7] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <LocateFixed className={`w-4 h-4 text-[#d49b48] ${weather.status === 'loading' ? 'animate-spin' : ''}`} />
            <span>
              {weather.status === 'loading'
                ? (lang === 'vi' ? 'Đang Định Vị...' : 'Locating...')
                : (lang === 'vi' ? 'Đồng Ý Chia Sẻ Vị Trí' : 'Allow My Location')}
            </span>
          </button>
        </div>
      )}

      {/* 1. Live Weather & Golden Hour Countdown */}
      <div className="parchment-card rounded-[24px] p-5 sm:p-6 border border-[#ded4c3] relative overflow-hidden bg-[#fbf8f2]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Location & Real-time Weather */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-6 h-6 rounded-[8px] bg-[#d49b48]/20 border border-[#d49b48]/30 text-[#a66d1f] flex items-center justify-center shadow-2xs">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#736357]">
                {weather.locationName}
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                weather.isUserLocation 
                  ? 'bg-[#5d6e58]/20 text-[#33462e] border-[#5d6e58]/40' 
                  : 'bg-[#d49b48]/15 text-[#8a532a] border-[#d49b48]/30'
              }`}>
                {weather.isUserLocation && <Check className="w-3 h-3 text-[#5d6e58]" />}
                <span>
                  {weather.isUserLocation 
                    ? (lang === 'vi' ? 'Vị trí của bạn (Live GPS)' : 'Your GPS Location (Live)')
                    : (lang === 'vi' ? 'Thời tiết Hà Nội' : 'Hanoi Weather')}
                </span>
              </span>

              {/* Refresh weather button */}
              <button
                onClick={weather.isUserLocation ? refreshWeather : requestUserLocation}
                className="p-1 rounded-lg hover:bg-[#ebdcc4] text-[#736357] transition-colors cursor-pointer"
                title={lang === 'vi' ? 'Cập nhật lại thời tiết' : 'Refresh Weather'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${weather.status === 'loading' ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Hand-drawn Sketchbook Animated Weather Icon */}
              <div className="p-1.5 rounded-2xl bg-gradient-to-b from-[#f5ede0] to-[#ecdcc8] border border-[#d8caa6] shadow-2xs">
                <SketchbookWeatherIcon 
                  condition={selectedConditionPreview || undefined}
                  weatherCode={selectedConditionPreview ? undefined : weather.weatherCode} 
                  isDay={selectedConditionPreview ? (selectedConditionPreview !== 'clear-night') : weather.isDay} 
                  size="md" 
                  theme={theme}
                />
              </div>

              <div>
                <div className="flex items-baseline gap-2.5">
                  <h3 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#3a2e28]">
                    {weather.temperature}°C
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#d49b48]/15 text-[#8a532a] border border-[#d49b48]/25">
                    {weather.isDay ? (lang === 'vi' ? 'Ban ngày' : 'Daytime') : (lang === 'vi' ? 'Ban đêm' : 'Night')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#5c4d44] mt-0.5">
                  {selectedConditionPreview ? (
                    lang === 'vi' 
                      ? `Xem thử nét vẽ: ${selectedConditionPreview}` 
                      : `Art preview: ${selectedConditionPreview}`
                  ) : (
                    lang === 'vi' ? weather.weatherDescriptionVi : weather.weatherDescriptionEn
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#736357] pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eee5d5]/60 border border-[#ded4c3]">
                <Droplets className="w-3.5 h-3.5 text-[#7a9aab]" />
                <span>{lang === 'vi' ? `Độ ẩm: ${weather.humidity}%` : `Humidity: ${weather.humidity}%`}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eee5d5]/60 border border-[#ded4c3]">
                <Wind className="w-3.5 h-3.5 text-[#5d6e58]" />
                <span>{lang === 'vi' ? `Gió: ${weather.windSpeed} km/h` : `Wind: ${weather.windSpeed} km/h`}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eee5d5]/60 border border-[#ded4c3]">
                <Compass className="w-3.5 h-3.5 text-[#d49b48]" />
                <span>{lang === 'vi' ? `Hướng: ${weather.windDirection}` : `Dir: ${weather.windDirection}`}</span>
              </div>
            </div>

            {/* Interactive Sketchbook Weather Art Palette Preview */}
            <div className="pt-2 border-t border-[#ded4c3]/70">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-[#8a532a] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#d49b48]" />
                  <span>{lang === 'vi' ? 'Nét Vẽ Khí Hậu Sổ Tay Thủ Công (Ghibli Art)' : 'Hand-Drawn Sketchbook Climate Art'}</span>
                </span>
                {selectedConditionPreview && (
                  <button
                    onClick={() => setSelectedConditionPreview(null)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#3a2e28] text-[#fdfbf7] hover:bg-[#5a483e] cursor-pointer"
                  >
                    {lang === 'vi' ? 'Quay lại thời tiết live' : 'Reset to live'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { type: 'clear' as WeatherConditionType, labelVi: 'Nắng Trong', labelEn: 'Clear' },
                  { type: 'clear-night' as WeatherConditionType, labelVi: 'Trăng Đêm', labelEn: 'Moonlight' },
                  { type: 'partly-cloudy' as WeatherConditionType, labelVi: 'Mây Mỏng', labelEn: 'Partly Cloudy' },
                  { type: 'cloudy' as WeatherConditionType, labelVi: 'Nhiều Mây', labelEn: 'Overcast' },
                  { type: 'drizzle' as WeatherConditionType, labelVi: 'Mưa Phùn', labelEn: 'Drizzle' },
                  { type: 'rain' as WeatherConditionType, labelVi: 'Mưa Rào', labelEn: 'Rain' },
                  { type: 'thunderstorm' as WeatherConditionType, labelVi: 'Dông Chiều', labelEn: 'Thunder' },
                  { type: 'fog' as WeatherConditionType, labelVi: 'Sương Khói', labelEn: 'Misty Fog' },
                  { type: 'windy' as WeatherConditionType, labelVi: 'Gió Hồ', labelEn: 'Lake Breeze' }
                ].map(cond => {
                  const isSelected = selectedConditionPreview === cond.type;
                  return (
                    <button
                      key={cond.type}
                      onClick={() => setSelectedConditionPreview(isSelected ? null : cond.type)}
                      className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#d49b48]/25 text-[#733f10] border-[#d49b48] font-bold shadow-2xs' 
                          : 'bg-[#f4ecdf] hover:bg-[#ebdcc4] text-[#55463b] border-[#ded0b8]'
                      }`}
                      title={lang === 'vi' ? `Xem hoạt họa nét vẽ ${cond.labelVi}` : `Preview ${cond.labelEn} sketch`}
                    >
                      <SketchbookWeatherIcon 
                        condition={cond.type} 
                        size="xs" 
                        theme={theme}
                        interactive={false}
                      />
                      <span>{lang === 'vi' ? cond.labelVi : cond.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Golden Hour Countdown Box */}
          <div className="w-full lg:w-auto bg-[#f5ede0] border border-[#d8caa6] rounded-[20px] p-4 sm:p-5 flex flex-col justify-center min-w-[280px] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8a532a]">
                <span className="w-5 h-5 rounded-[6px] bg-[#d49b48]/25 flex items-center justify-center">
                  <Sunset className="w-3.5 h-3.5 text-[#a66d1f]" />
                </span>
                <span>{lang === 'vi' ? 'Khung Giờ Vàng (Golden Hour)' : 'Golden Hour Window'}</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#d49b48]/20 text-[#a66d1f] font-bold border border-[#d49b48]/30">
                {weather.goldenHourStart} — {weather.goldenHourEnd}
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-serif-title font-bold text-[#3a2e28] tracking-tight">
              {weather.goldenHourStart} — {weather.goldenHourEnd}
            </div>

            <p className="text-xs text-[#786558] leading-relaxed">
              {lang === 'vi' 
                ? `Mặt trời lặn lúc ${weather.sunsetTime} • Thời điểm ráng chiều nhuộm màu hổ phách đẹp nhất`
                : `Sunset at ${weather.sunsetTime} • Prime window when warm rays illuminate the sky`}
            </p>

            <button
              id="ai-quick-sunset-suggest-btn"
              onClick={handleGenerateFreshPlan}
              disabled={isGeneratingPlan}
              className="w-full py-2.5 px-3 rounded-[12px] bg-[#d49b48] hover:bg-[#be8737] active:scale-95 text-[#fdfbf7] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 fill-white ${isGeneratingPlan ? 'animate-spin' : ''}`} />
              <span>{lang === 'vi' ? '✨ Tạo Lịch Trình AI Mới (1 Chạm)' : '✨ Generate Fresh AI Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dynamic AI Sunset Observation Strategy Box */}
      <div className="parchment-card rounded-[22px] p-5 sm:p-6 border-2 border-[#d49b48]/35 bg-[#fefcf8] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#8a532a]">
            <div className="w-7 h-7 rounded-[10px] bg-[#d49b48]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#a66d1f]" />
            </div>
            <h3 className="font-serif-title font-bold text-sm sm:text-base text-[#3a2e28]">
              {lang === 'vi' ? 'Chiến Lược Quan Sát Hoàng Hôn Từ AI' : 'AI Sunset Observation Strategy'}
            </h3>
          </div>

          <button
            onClick={handleGenerateFreshPlan}
            disabled={isGeneratingPlan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#efe5d3] hover:bg-[#e4d6bf] text-[#5c4a3e] text-xs font-semibold border border-[#d8caa6] transition-all cursor-pointer disabled:opacity-50 active:scale-97"
            title={lang === 'vi' ? 'Tạo gợi ý mới' : 'Generate new advice'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#a66d1f] ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            <span>{lang === 'vi' ? 'Làm mới gợi ý' : 'Refresh Advice'}</span>
          </button>
        </div>

        <div className="p-4 rounded-[16px] bg-[#f8f2e7] border border-[#e2d5be]">
          <p className="text-xs sm:text-sm leading-relaxed text-[#3d2f26] font-medium">
            {dynamicAiPlan}
          </p>
        </div>
      </div>

      {/* 3. Live Voice Companion (English Voice with Vietnamese Subtitles) */}
      <GhibliLiveVoiceCompanion lang={lang} />

      {/* 4. Top Curated Sunset Coordinates */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-serif-title font-bold text-[#3a2e28]">
            {lang === 'vi' ? 'Toạ Độ Ngắm Hoàng Hôn Nổi Bật' : 'Curated Sunset Viewpoints'}
          </h3>
          <p className="text-xs sm:text-sm text-[#736357]">
            {lang === 'vi' 
              ? 'Các góc ngắm ráng chiều thoáng đãng quanh Hồ Tây & Cầu Long Biên'
              : 'Scenic, unobstructed sunset vantage points around West Lake & Long Bien'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {SUNSET_SPOTS.map((spot: SunsetSpot) => {
            const isCopied = copiedId === spot.id;
            const isSelected = activeCardId === spot.id;
            return (
              <div 
                key={spot.id}
                id={`sunset-spot-${spot.id}`}
                onClick={() => handleSelectSpot(spot, true)}
                className={`parchment-card rounded-[22px] overflow-hidden border-2 flex flex-col justify-between group transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${
                  isSelected 
                    ? 'border-[#d49b48] shadow-md ring-2 ring-[#d49b48]/30 bg-[#fefcf8]' 
                    : 'border-[#ded4c3] hover:border-[#d49b48]/70 bg-[#fdfbf7]'
                }`}
              >
                {/* Visual Banner Header */}
                <div className={`p-4 bg-gradient-to-r ${spot.gradientTheme} border-b border-[#ded4c3]/60 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-white/40 shadow-xs backdrop-blur-xs">
                      {spot.iconEmoji}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#635345] px-2 py-0.5 rounded-full bg-white/50">
                        {spot.district}
                      </span>
                      <h4 className="font-serif-title font-bold text-base sm:text-lg text-[#3a2e28] mt-0.5">
                        {lang === 'vi' ? spot.name : spot.nameEn}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#fdfbf7]/90 text-[#8a532a] border border-[#d8caa6] shadow-2xs">
                    {spot.bestTime}
                  </span>
                </div>

                {/* Spot Details */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-[#5d4f45] leading-relaxed line-clamp-2">
                    {lang === 'vi' ? spot.description : spot.descriptionEn}
                  </p>

                  <div className="space-y-2 pt-1">
                    {/* Address with 1-click copy */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAddress(spot.id, spot.address);
                      }}
                      className="p-2 rounded-[10px] bg-[#f0e8da]/70 hover:bg-[#e7decb] border border-[#ded1be] text-xs text-[#524339] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      title={lang === 'vi' ? 'Nhấp để sao chép địa chỉ' : 'Click to copy address'}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#99472e] shrink-0" />
                        <span className="truncate">{spot.address}</span>
                      </div>
                      <span className="text-[10px] text-[#8a532a] font-bold shrink-0 flex items-center gap-1">
                        {isCopied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                        {isCopied ? (lang === 'vi' ? 'Đã chép' : 'Copied') : (lang === 'vi' ? 'Chép' : 'Copy')}
                      </span>
                    </div>

                    {/* Practical Viewing Tip */}
                    <div className="p-2.5 rounded-[12px] bg-[#d49b48]/10 border border-[#d49b48]/20 text-xs text-[#784f1e]">
                      <span className="font-semibold">{lang === 'vi' ? 'Góc máy đẹp: ' : 'Photo Tip: '}</span>
                      <span>{lang === 'vi' ? spot.photoTip : spot.photoTipEn}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.mapsQuery)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full py-2.5 px-3 rounded-[12px] bg-[#3a2e28] hover:bg-[#4d3d35] active:scale-98 text-[#fdfbf7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#d49b48]" />
                    <span>{lang === 'vi' ? 'Chỉ Đường Google Maps' : 'Open in Google Maps'}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Inspection Modal */}
      <LocationInspectorModal
        location={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        lang={lang}
        theme={theme}
      />
    </div>
  );
};
