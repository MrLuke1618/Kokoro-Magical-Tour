import React from 'react';
import { motion } from 'motion/react';
import { Sunset, ShoppingBag, Utensils, Camera } from 'lucide-react';
import { Language, ThemePalette } from '../types';

export type TabId = 'sunset' | 'deals' | 'food' | 'photomap';

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  lang: Language;
  theme?: ThemePalette;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  lang,
  theme = 'golden'
}) => {
  const isTwilight = theme === 'twilight';

  const tabs = [
    {
      id: 'sunset' as TabId,
      icon: Sunset,
      badgeColorGolden: 'bg-[#d49b48]/18 text-[#995c1a] border-[#d49b48]/30',
      badgeColorTwilight: 'bg-[#38bdf8]/20 text-[#7dd3fc] border-[#38bdf8]/35',
      activeGradientGolden: 'from-[#fffdf9] to-[#fbf5eb] border-[#d49b48] text-[#3a2e28]',
      activeGradientTwilight: 'from-[#1a2948] to-[#121f37] border-[#38bdf8] text-[#f8fafc]',
      labelVi: 'Hồ Tây & AI Gợi Ý Hoàng Hôn',
      labelEn: 'West Lake & AI Sunset Planner',
      subVi: 'Thời tiết • Giờ vàng • Lời khuyên AI',
      subEn: 'Weather • Golden Hour • AI Advice',
    },
    {
      id: 'deals' as TabId,
      icon: ShoppingBag,
      badgeColorGolden: 'bg-[#5d6e58]/18 text-[#3d5038] border-[#5d6e58]/30',
      badgeColorTwilight: 'bg-[#34d399]/20 text-[#6ee7b7] border-[#34d399]/35',
      activeGradientGolden: 'from-[#fffdf9] to-[#f5f8f3] border-[#5d6e58] text-[#3a2e28]',
      activeGradientTwilight: 'from-[#152a3e] to-[#121f37] border-[#34d399] text-[#f8fafc]',
      labelVi: 'AI Săn Sale & Phối Đồ',
      labelEn: 'AI Deal & Style Hunter',
      subVi: 'Váy linen • Sổ vẽ • Phụ kiện Ghibli',
      subEn: 'Linen Dress • Sketchbook • Ghibli Fits',
    },
    {
      id: 'food' as TabId,
      icon: Utensils,
      badgeColorGolden: 'bg-[#99472e]/18 text-[#78301c] border-[#99472e]/30',
      badgeColorTwilight: 'bg-[#fb923c]/20 text-[#fdba74] border-[#fb923c]/35',
      activeGradientGolden: 'from-[#fffdf9] to-[#faf3f0] border-[#99472e] text-[#3a2e28]',
      activeGradientTwilight: 'from-[#2a243d] to-[#121f37] border-[#fb923c] text-[#f8fafc]',
      labelVi: 'Cà Phê & AI Gợi Ý Món Ngon',
      labelEn: 'Hanoi Cafes & AI Foodie',
      subVi: 'Cốt dừa • Bánh tôm • AI Taste Matcher',
      subEn: 'Coconut Coffee • Shrimp Cakes • Taste Matcher',
    },
    {
      id: 'photomap' as TabId,
      icon: Camera,
      badgeColorGolden: 'bg-[#7a9aab]/22 text-[#2c5469] border-[#7a9aab]/35',
      badgeColorTwilight: 'bg-[#818cf8]/22 text-[#c7d2fe] border-[#818cf8]/35',
      activeGradientGolden: 'from-[#fffdf9] to-[#f2f7fa] border-[#7a9aab] text-[#3a2e28]',
      activeGradientTwilight: 'from-[#1d2247] to-[#121f37] border-[#818cf8] text-[#f8fafc]',
      labelVi: 'Bản Đồ AI & Random Góc Sống Ảo',
      labelEn: 'AI Photo Map & Random Check-in',
      subVi: 'Random góc chụp • Gợi ý Outfit • Maps',
      subEn: 'Random Spot • Outfit Matcher • Maps',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const activeClasses = isTwilight 
            ? `bg-gradient-to-b ${tab.activeGradientTwilight} shadow-lg ring-1 ring-[#38bdf8]/40`
            : `bg-gradient-to-b ${tab.activeGradientGolden} shadow-md ring-1 ring-[#d49b48]/30`;

          const inactiveClasses = isTwilight
            ? 'bg-[#131f37]/85 hover:bg-[#182642] border-[#223658] text-[#cbd5e1] hover:border-[#38bdf8]/50'
            : 'bg-[#f4eee2]/80 hover:bg-[#faf7f0] border-[#ded4c3] text-[#5d4f45] hover:border-[#c7b9a5]';

          const badgeClasses = isActive
            ? (isTwilight ? tab.badgeColorTwilight : tab.badgeColorGolden)
            : (isTwilight 
                ? 'bg-[#1a2846] border-[#223658] text-[#94a3b8] group-hover:text-[#f1f5f9]' 
                : 'bg-[#ebe3d3] border-[#ded4c3] text-[#736357] group-hover:text-[#3a2e28]');

          return (
            <motion.button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`relative text-left p-3.5 sm:p-4 rounded-[20px] transition-all duration-200 border cursor-pointer group flex flex-col justify-between ${
                isActive ? activeClasses : inactiveClasses
              }`}
            >
              {/* Corner status pill with layout animation */}
              {isActive && (
                <motion.div 
                  layoutId="activeTabPill"
                  className={`absolute top-0 right-3 -translate-y-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs z-10 ${
                    isTwilight 
                      ? 'bg-[#0284c7] text-[#ffffff] ring-1 ring-white/20' 
                      : 'bg-[#d49b48] text-[#fdfbf7]'
                  }`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {lang === 'vi' ? 'Đang mở' : 'Active'}
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-2.5">
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={`w-9 h-9 rounded-[14px] flex items-center justify-center border shadow-2xs ${badgeClasses}`}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[1.85]" />
                </motion.div>
                <div className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                  isTwilight ? 'text-[#94a3b8] bg-[#1a2846]' : 'text-[#8c786a] bg-[#eee5d5]/60'
                }`}>
                  0{tabs.indexOf(tab) + 1}
                </div>
              </div>

              <div>
                <h2
                  className={`text-xs sm:text-sm font-semibold tracking-tight leading-snug line-clamp-1 ${
                    isActive 
                      ? (isTwilight ? 'text-[#f8fafc] font-serif-title font-bold' : 'text-[#3a2e28] font-serif-title font-bold')
                      : (isTwilight ? 'text-[#cbd5e1]' : 'text-[#5d4f45]')
                  }`}
                >
                  {lang === 'vi' ? tab.labelVi : tab.labelEn}
                </h2>
                <p className={`text-[11px] line-clamp-1 mt-0.5 hidden sm:block ${
                  isTwilight ? 'text-[#94a3b8]' : 'text-[#857467]'
                }`}>
                  {lang === 'vi' ? tab.subVi : tab.subEn}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
