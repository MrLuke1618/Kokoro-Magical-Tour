/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language, ThemePalette } from './types';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { TabSunsetPlanner } from './components/TabSunsetPlanner';
import { TabDealHunter } from './components/TabDealHunter';
import { TabHanoiCafes } from './components/TabHanoiCafes';
import { TabPhotoMap } from './components/TabPhotoMap';
import { Footer } from './components/Footer';
import { HelpModal } from './components/HelpModal';

// Sketchbook page-turn animation variants with tactile paper curl & depth
const pageVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    rotateY: direction > 0 ? 6 : -6,
    rotateZ: direction > 0 ? 0.5 : -0.5,
    scale: 0.98,
    y: 12,
    filter: 'blur(2px)',
    transformOrigin: direction > 0 ? 'left center' : 'right center',
  }),
  animate: {
    opacity: 1,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Natural, gentle page turn easing
    }
  },
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: direction > 0 ? -6 : 6,
    rotateZ: direction > 0 ? -0.5 : 0.5,
    scale: 0.98,
    y: -8,
    filter: 'blur(2px)',
    transformOrigin: direction > 0 ? 'right center' : 'left center',
    transition: {
      duration: 0.28,
      ease: [0.32, 0, 0.67, 0],
    }
  })
};

const TAB_ORDER: TabId[] = ['sunset', 'deals', 'food', 'photomap'];

const THEME_STORAGE_KEY = 'hanoi_sunset_theme_pref';
const LANG_STORAGE_KEY = 'hanoi_sunset_lang_pref';

export default function App() {
  // Persistent language preference: load from localStorage if set, default to 'vi'
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') return saved;
    } catch {
      // localStorage not accessible
    }
    return 'vi';
  });

  const [activeTab, setActiveTab] = useState<TabId>('sunset');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [tabDirection, setTabDirection] = useState<number>(1);

  // Persistent theme preference: load from localStorage if set;
  // fallback to time-of-day: Daytime (6-18) -> 'golden', Nighttime -> 'twilight'
  const [theme, setTheme] = useState<ThemePalette>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'golden' || saved === 'twilight') return saved;
    } catch {
      // localStorage not accessible
    }
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'golden' : 'twilight';
  });

  const handleTabChange = (newTab: TabId) => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setTabDirection(newIndex >= currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  // Sync language with HTML document and localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = lang;
  }, [lang]);

  // Sync theme with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  return (
    <div className={`theme-${theme} ${lang === 'vi' ? 'font-mode-vi' : 'font-mode-en'} min-h-screen flex flex-col selection:bg-[#d49b48]/30 selection:text-[#3a2e28] transition-colors duration-300`}>
      {/* Top Header & Language Toggle & Theme Palette Switcher & Help */}
      <Header 
        lang={lang} 
        setLang={setLang} 
        onOpenHelp={() => setIsHelpOpen(true)} 
        theme={theme} 
        setTheme={setTheme} 
      />

      {/* Main Tab Navigation */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        lang={lang} 
        theme={theme}
      />

      {/* Main Content Area with Sketchbook 3D Page Flip Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 pb-8 overflow-hidden [perspective:1200px]">
        <AnimatePresence mode="wait" custom={tabDirection}>
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full will-change-transform"
          >
            {activeTab === 'sunset' && <TabSunsetPlanner lang={lang} theme={theme} />}
            {activeTab === 'deals' && <TabDealHunter lang={lang} theme={theme} />}
            {activeTab === 'food' && <TabHanoiCafes lang={lang} theme={theme} />}
            {activeTab === 'photomap' && <TabPhotoMap lang={lang} theme={theme} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* App Footer */}
      <Footer lang={lang} theme={theme} />

      {/* Help Guide Modal with Smooth Entrance */}
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        lang={lang} 
        theme={theme}
      />
    </div>
  );
}

