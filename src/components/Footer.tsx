import React from 'react';
import { Feather } from 'lucide-react';
import { Language, ThemePalette } from '../types';

interface FooterProps {
  lang: Language;
  theme?: ThemePalette;
}

export const Footer: React.FC<FooterProps> = ({ lang, theme = 'golden' }) => {
  const isTwilight = theme === 'twilight';

  return (
    <footer className={`w-full border-t mt-12 py-8 transition-colors duration-300 ${
      isTwilight 
        ? 'border-[#223658] bg-[#0d162a] text-[#94a3b8]' 
        : 'border-[#ded4c3] bg-[#fbf9f4] text-[#736357]'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center space-y-3">
        {/* Soft blessing note */}
        <div className={`flex items-center gap-2 text-base sm:text-lg font-handwritten ${
          isTwilight ? 'text-[#cbd5e1]' : 'text-[#8a7566]'
        }`}>
          <Feather className={`w-4 h-4 ${isTwilight ? 'text-[#38bdf8]' : 'text-[#d49b48]'}`} />
          <span>
            {lang === 'vi' 
              ? 'Chúc bạn luôn tìm thấy những khoảnh khắc hoàng hôn êm đềm nhất giữa lòng Hà Nội.'
              : 'May you always find the gentlest sunset moments in the heart of Hanoi.'}
          </span>
          <Feather className={`w-4 h-4 rotate-180 ${isTwilight ? 'text-[#38bdf8]' : 'text-[#d49b48]'}`} />
        </div>

        {/* Required copyright line */}
        <div className={`text-xs sm:text-sm font-medium pt-1 ${
          isTwilight ? 'text-[#94a3b8]' : 'text-[#4a3e35]'
        }`}>
          {`© 2026-${new Date().getFullYear()} Developed by MrLuke1618. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
};
