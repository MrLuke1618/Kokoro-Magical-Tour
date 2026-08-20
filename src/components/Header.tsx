import React from 'react';
import { motion } from 'motion/react';
import { Globe, Sun, Moon, HelpCircle, Sparkles, MapPin } from 'lucide-react';
import { Language, ThemePalette } from '../types';
import { SketchbookWeatherIcon } from './SketchbookWeatherIcon';
import { useLocationWeather } from '../hooks/useLocationWeather';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenHelp: () => void;
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang, onOpenHelp, theme, setTheme }) => {
  const isGolden = theme === 'golden';
  const { weather } = useLocationWeather(lang);

  const toggleTheme = () => {
    setTheme(isGolden ? 'twilight' : 'golden');
  };

  return (
    <header className={`relative w-full border-b backdrop-blur-md sticky top-0 z-40 transition-colors duration-300 ${
      isGolden 
        ? 'border-[#ded4c3] bg-[#fbf9f4]/95 text-[#3a2e28]' 
        : 'border-[#1e2f50] bg-[#0d162b]/95 text-[#f1f5f9]'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand & Personalized User Welcome */}
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center shadow-xs font-serif font-bold text-xl sm:text-2xl select-none transition-colors cursor-default ${
              isGolden 
                ? 'bg-[#d49b48]/15 border border-[#d49b48]/35 text-[#a66d1f]' 
                : 'bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#7dd3fc]'
            }`}
          >
            夕
          </motion.div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`text-lg sm:text-xl font-serif-title font-semibold tracking-tight ${
                isGolden ? 'text-[#3a2e28]' : 'text-[#f8fafc]'
              }`}>
                Hanoi Sunset Sanctuary
              </h1>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                isGolden 
                  ? 'bg-[#5d6e58]/15 text-[#42523d] border-[#5d6e58]/30' 
                  : 'bg-[#0284c7]/20 text-[#bae6fd] border-[#0284c7]/40'
              }`}>
                Studio Ghibli Edition
              </span>
            </div>
            <p className={`text-xs font-medium flex items-center gap-1.5 mt-0.5 ${
              isGolden ? 'text-[#736357]' : 'text-[#94a3b8]'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                isGolden ? 'bg-[#d49b48]/20' : 'bg-[#38bdf8]/20'
              }`}>
                {isGolden ? (
                  <Sun className="w-3 h-3 text-[#b07421]" />
                ) : (
                  <Moon className="w-3 h-3 text-[#38bdf8]" />
                )}
              </span>
              <span className={isGolden ? 'text-[#8a532a] font-semibold' : 'text-[#38bdf8] font-semibold'}>
                {lang === 'vi' 
                  ? (isGolden ? 'Chào Kokoro • Chúc bạn buổi chiều an yên' : 'Chào Kokoro • Chúc bạn đêm ngắm sao thanh bình') 
                  : (isGolden ? 'Welcome Kokoro • Wishing you a peaceful sunset' : 'Welcome Kokoro • Wishing you a starry tranquil night')}
              </span>
            </p>
          </div>
        </div>

        {/* Right actions: Live Weather Pill, Theme Palette Toggle, Help Button & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Live Sketchbook Weather Pill */}
          <div 
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-2xs ${
              isGolden
                ? 'bg-[#f5ecdc]/80 border-[#ded0b8] text-[#5a4a3e]'
                : 'bg-[#15233d]/80 border-[#24375b] text-[#cbd5e1]'
            }`}
            title={lang === 'vi' ? `${weather.locationName}: ${weather.temperature}°C • ${weather.weatherDescriptionVi}` : `${weather.locationName}: ${weather.temperature}°C • ${weather.weatherDescriptionEn}`}
          >
            <SketchbookWeatherIcon 
              weatherCode={weather.weatherCode}
              isDay={weather.isDay}
              size="xs"
              theme={theme}
            />
            <span className="font-semibold text-xs">{weather.temperature}°C</span>
            <span className="opacity-60 text-[11px] max-w-[100px] truncate">
              {weather.isUserLocation ? (lang === 'vi' ? 'Vị trí bạn' : 'Your GPS') : 'Hà Nội'}
            </span>
          </div>

          {/* Apple-style Color Palette Toggle Button */}
          <motion.button
            id="theme-palette-toggle-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer shadow-xs ${
              isGolden
                ? 'bg-[#f5ecdc] hover:bg-[#ebdcc4] text-[#4d3e33] border-[#d8caa6]'
                : 'bg-[#1a2846] hover:bg-[#23355c] text-[#e2e8f0] border-[#2e4370]'
            }`}
            title={lang === 'vi' ? 'Chuyển đổi bảng màu Nắng Vàng Chiều / Hoàng Hôn Xanh Thẫm' : 'Switch between Warm Golden Hour and Deep Blue Twilight'}
            aria-label="Toggle color palette theme"
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
              isGolden ? 'bg-[#d49b48]/30 rotate-0' : 'bg-[#38bdf8]/30 rotate-180'
            }`}>
              {isGolden ? (
                <Sun className="w-3 h-3 text-[#b07421]" />
              ) : (
                <Moon className="w-3 h-3 text-[#38bdf8]" />
              )}
            </span>
            <span className="hidden md:inline font-medium">
              {isGolden 
                ? (lang === 'vi' ? 'Nắng Vàng' : 'Golden Hour') 
                : (lang === 'vi' ? 'Xanh Thẫm' : 'Deep Twilight')}
            </span>
          </motion.button>

          {/* Global Help Button (Apple SF style) */}
          <motion.button 
            id="global-help-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenHelp}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer shadow-xs ${
              isGolden
                ? 'bg-[#efe5d2] hover:bg-[#e4d6bf] text-[#4d3e33] border-[#d8caa6]'
                : 'bg-[#152442] hover:bg-[#1e325a] text-[#e2e8f0] border-[#293d69]'
            }`}
            title={lang === 'vi' ? 'Hướng dẫn sử dụng chi tiết' : 'App Guide & Features'}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
              isGolden ? 'bg-[#d49b48]/25 text-[#8a532a]' : 'bg-[#38bdf8]/25 text-[#38bdf8]'
            }`}>
              <HelpCircle className="w-3 h-3" />
            </span>
            <span className="hidden sm:inline">{lang === 'vi' ? 'Hướng Dẫn' : 'Guide'}</span>
          </motion.button>

          {/* Prominent Language Switcher */}
          <motion.button
            id="language-toggle-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full transition-colors text-xs font-semibold shadow-xs cursor-pointer ${
              isGolden
                ? 'bg-[#3a2e28] text-[#fdfbf7] hover:bg-[#4f3f37]'
                : 'bg-[#2563eb] text-[#ffffff] hover:bg-[#1d4ed8]'
            }`}
            aria-label="Toggle language between Vietnamese and English"
          >
            <span className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center">
              <Globe className="w-3 h-3 text-[#fef08a]" />
            </span>
            <span>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
