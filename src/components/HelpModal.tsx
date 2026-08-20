import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  HelpCircle, 
  Sunset, 
  ShoppingBag, 
  Coffee, 
  Camera, 
  Mic, 
  MapPin, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Sun,
  Moon,
  Navigation as NavIcon,
  ShieldCheck
} from 'lucide-react';
import { Language, ThemePalette } from '../types';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme?: ThemePalette;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, lang, theme = 'golden' }) => {
  const isGolden = theme === 'golden';

  const sections = [
    {
      icon: Sunset,
      color: isGolden 
        ? 'text-[#d49b48] bg-[#d49b48]/15 border-[#d49b48]/30' 
        : 'text-[#38bdf8] bg-[#38bdf8]/15 border-[#38bdf8]/30',
      titleVi: '1. Sổ Tay Hoàng Hôn & Thời Tiết Định Vị GPS',
      titleEn: '1. Sunset Planner & Live GPS Weather',
      contentVi: 'Cập nhật thời tiết và đếm ngược giờ vàng thực tế dựa trên vị trí GPS chính xác của bạn (sau khi bạn chấp nhận quyền vị trí). Nếu không bật GPS, ứng dụng sẽ tự động hiển thị dữ liệu thời tiết trực tiếp tại khu vực Hồ Tây, Hà Nội.',
      contentEn: 'Real-time weather and golden hour countdown calculated from your exact GPS location upon granting permission. If denied, the app gracefully defaults to live conditions at West Lake, Hanoi.'
    },
    {
      icon: isGolden ? Sun : Moon,
      color: isGolden 
        ? 'text-[#d49b48] bg-[#d49b48]/15 border-[#d49b48]/30' 
        : 'text-[#facc15] bg-[#facc15]/15 border-[#facc15]/30',
      titleVi: "2. Chuyển Đổi Bảng Màu 'Nắng Vàng' & 'Xanh Thẫm'",
      titleEn: "2. 'Warm Golden Hour' & 'Deep Blue Twilight' Palette",
      contentVi: "Ứng dụng tự động điều chỉnh bảng màu theo thời gian thực (Ban ngày: Nắng Vàng Chiều, Ban đêm: Hoàng Hôn Xanh Thẫm). Bạn có thể bấm nút chuyển đổi hình Mặt Trời / Mặt Trăng trên thanh điều hướng bất kỳ lúc nào.",
      contentEn: "The palette automatically adapts to the time of day (Day: Warm Golden Hour, Night: Deep Blue Twilight). You can also toggle anytime using the Sun/Moon button on the top navigation bar."
    },
    {
      icon: ShoppingBag,
      color: isGolden 
        ? 'text-[#5d6e58] bg-[#5d6e58]/15 border-[#5d6e58]/30' 
        : 'text-[#34d399] bg-[#34d399]/15 border-[#34d399]/30',
      titleVi: '3. Săn Deal & Phối Đồ Ghibli (Deal Hunter & Vision AI)',
      titleEn: '3. Deal Hunter & Ghibli Style Advice',
      contentVi: 'Khám phá các gợi ý trang phục vải linen thoáng mát, túi cói và phụ kiện vintage phù hợp với thời tiết Hà Nội. Nhấn "Đổi gợi ý" để AI đề xuất công thức phối đồ độc bản tức thì.',
      contentEn: 'Explore curated discounts on linen dresses, woven straw bags, and vintage accessories suited for local weather. Click "Refresh" for instant, dynamic AI coordination tips.'
    },
    {
      icon: Coffee,
      color: isGolden 
        ? 'text-[#99472e] bg-[#99472e]/15 border-[#99472e]/30' 
        : 'text-[#fb923c] bg-[#fb923c]/15 border-[#fb923c]/30',
      titleVi: '4. Góc Quán & Ghép Vị Cà Phê (Hanoi Cafes & Taste Matcher)',
      titleEn: '4. Hanoi Cafes & Taste Matcher',
      contentVi: 'Khám phá danh sách các quán cà phê có ban công và view hoàng hôn đẹp nhất ven hồ. Hệ thống AI Taste Matcher sẽ tự động ghép món đồ uống đặc sản (cốt dừa, cà phê trứng, trà sen) theo từng tâm trạng.',
      contentEn: 'Discover top balcony cafes along Hanoi lakes with scenic sunset vistas. The AI Taste Matcher pairs signature local beverages (coconut coffee, egg coffee, lotus tea) to your current mood.'
    },
    {
      icon: Camera,
      color: isGolden 
        ? 'text-[#7a9aab] bg-[#7a9aab]/15 border-[#7a9aab]/30' 
        : 'text-[#818cf8] bg-[#818cf8]/15 border-[#818cf8]/30',
      titleVi: '5. Toạ Độ Sống Ảo & Randomizer (Photo Map & Outfits)',
      titleEn: '5. Photo Coordinates & Randomizer',
      contentVi: 'Lọc toạ độ chụp ảnh theo quận hoặc bấm "Đổi toạ độ" để nhận góc chụp độc đáo kèm thời gian vàng (ví dụ 17:35) và chỉ dẫn trang phục. Nhấp vào bất kỳ thẻ nào để mở vị trí Google Maps.',
      contentEn: 'Filter coordinates by district or click "Refresh" for a spontaneous photo spot with precise golden hour timing (e.g. 5:35 PM) and outfit rules. Click any card for direct Google Maps navigation.'
    },
    {
      icon: Mic,
      color: isGolden 
        ? 'text-[#2f4d5c] bg-[#7a9aab]/20 border-[#7a9aab]/40' 
        : 'text-[#38bdf8] bg-[#38bdf8]/20 border-[#38bdf8]/40',
      titleVi: '6. Bạn Đồng Hành Giọng Nói (Live Companion - Gemini 3.7)',
      titleEn: '6. Live Companion (English Voice & Vietnamese Subtitles)',
      contentVi: 'Trò chuyện bằng giọng nói với AI thời gian thực (được cấp nguồn bởi Gemini 3.7 Flash). AI phản hồi bằng giọng đọc tiếng Anh tự nhiên đồng thời hiển thị phụ đề tiếng Việt đồng bộ ngay trên màn hình.',
      contentEn: 'Interact naturally using real-time voice powered by Gemini 3.7 Flash. The companion speaks in natural English while rendering live synchronized Vietnamese subtitles.'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto parchment-card rounded-3xl p-5 sm:p-7 border-2 shadow-2xl relative space-y-6 z-10 ${
              isGolden 
                ? 'bg-[#faf6ee] border-[#d49b48]/50 text-[#3a2e28]' 
                : 'bg-[#121c32] border-[#38bdf8]/40 text-[#f1f5f9]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-start justify-between gap-4 border-b pb-4 ${
              isGolden ? 'border-[#ded2bc]' : 'border-[#243556]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isGolden ? 'bg-[#d49b48]/20 text-[#8a532a]' : 'bg-[#38bdf8]/20 text-[#38bdf8]'
                }`}>
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif-title font-bold text-xl sm:text-2xl">
                    {lang === 'vi' ? 'Hướng Dẫn Sử Dụng & Tính Năng' : 'Sanctuary User Guide & Features'}
                  </h2>
                  <p className={`text-xs sm:text-sm ${isGolden ? 'text-[#736357]' : 'text-[#94a3b8]'}`}>
                    {lang === 'vi' 
                      ? 'Khám phá trọn vẹn tất cả tính năng hoàng hôn, định vị thời tiết, săn deal và AI tại Hà Nội' 
                      : 'Complete overview of sunset planning, GPS live weather, styling deals, and AI features'}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isGolden 
                    ? 'bg-[#ebe2d0] hover:bg-[#ded1bc] text-[#52443a]' 
                    : 'bg-[#1e2f4f] hover:bg-[#283e68] text-[#cbd5e1]'
                }`}
                title={lang === 'vi' ? 'Đóng' : 'Close'}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Feature Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((sec, idx) => {
                const Icon = sec.icon;
                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + idx * 0.03, duration: 0.25 }}
                    className={`p-4 rounded-2xl border space-y-2.5 shadow-2xs transition-colors ${
                      isGolden 
                        ? 'bg-[#fdfbf7] border-[#e2d7c2] hover:border-[#d49b48]/60 text-[#3a2e28]' 
                        : 'bg-[#17243e] border-[#293c60] hover:border-[#38bdf8]/60 text-[#f1f5f9]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${sec.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif-title font-bold text-sm sm:text-base">
                        {lang === 'vi' ? sec.titleVi : sec.titleEn}
                      </h3>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isGolden ? 'text-[#5d4e44]' : 'text-[#cbd5e1]'
                    }`}>
                      {lang === 'vi' ? sec.contentVi : sec.contentEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* GPS Permission & Privacy Notice */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isGolden 
                ? 'bg-[#5d6e58]/10 border-[#5d6e58]/30 text-[#3b4b39]' 
                : 'bg-[#065f46]/20 border-[#059669]/40 text-[#a7f3d0]'
            }`}>
              <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isGolden ? 'text-[#5d6e58]' : 'text-[#34d399]'}`} />
              <div className="text-xs sm:text-sm space-y-1">
                <span className="font-bold">
                  {lang === 'vi' ? '📍 Quyền Vị Trí & Bảo Mật:' : '📍 Location Permission & Privacy Guarantee:'}
                </span>
                <p className={isGolden ? 'text-[#485946]' : 'text-[#d1fae5]'}>
                  {lang === 'vi'
                    ? 'Khi bạn cho phép truy cập vị trí, toạ độ GPS chỉ được sử dụng trực tiếp trên trình duyệt để tính toán góc mặt trời, giờ hoàng hôn và thời tiết địa phương. Không có bất kỳ thông tin vị trí nào bị thu thập hoặc lưu trữ trên máy chủ.'
                    : 'When location access is allowed, GPS coordinates are processed directly within your browser solely to query live weather and compute solar sunset angles. No personal location data is tracked or saved.'}
                </p>
              </div>
            </div>

            {/* Multi-Device Optimization Guide */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isGolden 
                ? 'bg-[#faf2e3] border-[#d8caa6] text-[#3a2e28]' 
                : 'bg-[#182642] border-[#2c4068] text-[#f1f5f9]'
            }`}>
              <h3 className="font-serif-title font-bold text-sm sm:text-base flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${isGolden ? 'text-[#d49b48]' : 'text-[#38bdf8]'}`} />
                <span>{lang === 'vi' ? 'Tối Ưu Hoá Cho Mọi Thiết Bị' : 'Optimized for All Devices'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                  isGolden ? 'bg-[#fdfbf7] border-[#e2d8c3]' : 'bg-[#1a2b4b] border-[#2b3f66]'
                }`}>
                  <Smartphone className={`w-4 h-4 shrink-0 mt-0.5 ${isGolden ? 'text-[#d49b48]' : 'text-[#38bdf8]'}`} />
                  <div>
                    <span className="font-bold block mb-0.5">Mobile (iOS / Android)</span>
                    <span className={isGolden ? 'text-[#52443a]' : 'text-[#cbd5e1]'}>
                      {lang === 'vi' ? 'Thao tác chạm >44px, nút chuyển chế độ màu tiện lợi.' : 'Touch-friendly targets >44px with quick theme toggles.'}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                  isGolden ? 'bg-[#fdfbf7] border-[#e2d8c3]' : 'bg-[#1a2b4b] border-[#2b3f66]'
                }`}>
                  <Tablet className={`w-4 h-4 shrink-0 mt-0.5 ${isGolden ? 'text-[#5d6e58]' : 'text-[#34d399]'}`} />
                  <div>
                    <span className="font-bold block mb-0.5">Tablet / iPad</span>
                    <span className={isGolden ? 'text-[#52443a]' : 'text-[#cbd5e1]'}>
                      {lang === 'vi' ? 'Bố cục 2 cột trực quan như quyển sổ tay mỹ thuật.' : 'Tactile sketchbook layout with rich two-column cards.'}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                  isGolden ? 'bg-[#fdfbf7] border-[#e2d8c3]' : 'bg-[#1a2b4b] border-[#2b3f66]'
                }`}>
                  <Monitor className={`w-4 h-4 shrink-0 mt-0.5 ${isGolden ? 'text-[#7a9aab]' : 'text-[#818cf8]'}`} />
                  <div>
                    <span className="font-bold block mb-0.5">PC / Laptop</span>
                    <span className={isGolden ? 'text-[#52443a]' : 'text-[#cbd5e1]'}>
                      {lang === 'vi' ? 'Trải nghiệm màn hình rộng độ phân giải cao với phím tắt.' : 'Expanded widescreen layout with detailed inspectors.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="flex justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
                  isGolden 
                    ? 'bg-[#3a2e28] hover:bg-[#4d3d35] text-[#fdfbf7]' 
                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-[#ffffff]'
                }`}
              >
                {lang === 'vi' ? 'Đã Hiểu, Bắt Đầu Khám Phá' : 'Got It, Start Exploring'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
