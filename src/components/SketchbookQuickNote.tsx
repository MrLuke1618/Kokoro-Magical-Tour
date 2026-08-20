import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, 
  Check, 
  Trash2, 
  Paperclip, 
  StickyNote, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { Language, ThemePalette } from '../types';

interface SketchbookQuickNoteProps {
  itemId: string;
  itemTitle: string;
  lang: Language;
  theme?: ThemePalette;
  compact?: boolean;
  defaultOpen?: boolean;
}

const STORAGE_KEY_PREFIX = 'hanoi_sketchbook_note_';

export const SketchbookQuickNote: React.FC<SketchbookQuickNoteProps> = ({
  itemId,
  itemTitle,
  lang,
  theme = 'golden',
  compact = false,
  defaultOpen = false
}) => {
  const [note, setNote] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${itemId}`;

  // Load from localStorage on mount or itemId change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNote(parsed.text || '');
        setSavedTime(parsed.updatedAt || null);
      } else {
        setNote('');
        setSavedTime(null);
      }
    } catch (e) {
      console.warn('Failed to load quick note', e);
    }
  }, [storageKey]);

  const handleSave = () => {
    const trimmed = note.trim();
    try {
      if (trimmed) {
        const timestamp = new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const payload = {
          text: trimmed,
          updatedAt: timestamp,
          itemId,
          itemTitle
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setSavedTime(timestamp);
      } else {
        localStorage.removeItem(storageKey);
        setSavedTime(null);
      }
      setIsEditing(false);
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2000);
    } catch (e) {
      console.warn('Failed to save quick note', e);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(storageKey);
      setNote('');
      setSavedTime(null);
      setIsEditing(false);
    } catch (e) {
      console.warn('Failed to delete note', e);
    }
  };

  const hasNote = note.trim().length > 0;

  const quickPrompts = lang === 'vi' ? [
    '☕ Bàn số 4 view hồ',
    '📸 Đi lúc 17h30 bắt trọn nắng vàng',
    '🍰 Thử bánh chuối & trà quế',
    '✨ Đi cùng bạn thân'
  ] : [
    '☕ Table #4 lake view',
    '📸 Best at 5:30 PM for sunset',
    '🍰 Try banana loaf & cinnamon tea',
    '✨ Bring sketchbook'
  ];

  return (
    <div 
      id={`quick-note-${itemId}`}
      className="w-full select-text transition-all duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tucked Note Header Tab (Accordion toggle) */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && !hasNote) {
              setIsEditing(true);
            }
          }}
          className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-xl border transition-all cursor-pointer ${
            hasNote 
              ? 'bg-[#fdf7e7] text-[#784318] border-[#e6cca5] shadow-2xs' 
              : 'bg-[#f7f0e4]/80 text-[#69584b] border-[#e3d7c3] hover:bg-[#ede0ce]'
          }`}
          title={lang === 'vi' ? 'Ghi chú sổ tay cá nhân' : 'Personal sketchbook quick note'}
        >
          <StickyNote className="w-3.5 h-3.5 text-[#d49b48]" />
          <span>
            {hasNote 
              ? (lang === 'vi' ? 'Sổ tay đã ghim:' : 'Tucked Note:') 
              : (lang === 'vi' ? '+ Thêm ghi chú sổ tay' : '+ Add Quick Note')}
          </span>

          {hasNote && (
            <span className="max-w-[120px] sm:max-w-[180px] truncate text-[11px] font-normal italic opacity-85 ml-1">
              "{note}"
            </span>
          )}

          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          )}
        </button>

        {hasNote && savedTime && (
          <span className="text-[10px] text-[#8c786a] font-mono opacity-80 hidden sm:inline">
            {savedTime}
          </span>
        )}
      </div>

      {/* Expanded Handwritten Slip Note */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
            exit={{ opacity: 0, height: 0, scaleY: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden pt-2"
          >
            {/* The Handwritten Kraft Paper Slip with Washi Tape */}
            <div className="relative mt-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#fefbf3] to-[#f9f2e3] border border-[#dfcaa3] shadow-xs text-[#3a2e28] rotate-[-0.3deg]">
              {/* Decorative Washi Tape on Top Center */}
              <div 
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 rounded-xs bg-[#e8c89b]/80 border-t border-b border-[#c8a573]/50 shadow-2xs backdrop-blur-2xs transform -rotate-1 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#c29961 0.75px, transparent 0.75px)',
                  backgroundSize: '4px 4px'
                }}
              />

              {/* Top Row: Paper Clip & Note Header */}
              <div className="flex items-center justify-between gap-2 mb-2 pt-1 border-b border-[#ebd7be]/80 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a532a]">
                  <Paperclip className="w-3.5 h-3.5 text-[#b07d4b] transform -rotate-45" />
                  <span className="font-serif italic tracking-wide">
                    {lang === 'vi' ? 'Bút ký Hồ Tây' : 'Lakeside Field Note'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {showSavedFeedback && (
                    <motion.span 
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] text-green-700 font-medium flex items-center gap-1 bg-green-100/80 px-1.5 py-0.5 rounded-md"
                    >
                      <Check className="w-3 h-3" />
                      <span>{lang === 'vi' ? 'Đã lưu' : 'Saved'}</span>
                    </motion.span>
                  )}

                  {!isEditing && hasNote && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded-lg text-[#8a532a] hover:bg-[#ebdcc4] transition-colors cursor-pointer"
                      title={lang === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {hasNote && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="p-1 rounded-lg text-[#99472e] hover:bg-[#fadcd5] transition-colors cursor-pointer"
                      title={lang === 'vi' ? 'Xóa ghi chú này' : 'Delete note'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Editing Area or Readout View */}
              {isEditing || !hasNote ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      lang === 'vi'
                        ? 'Viết nhanh ghi chú cá nhân (ví dụ: góc bàn đẹp nhất, kỷ niệm, đồ uống nên thử)...'
                        : 'Jot down personal field notes (e.g. favorite seat, memory, special drink to try)...'
                    }
                    className="w-full p-2.5 rounded-xl bg-[#fffef9]/90 border border-[#d8c39d] text-xs sm:text-sm font-serif text-[#33251d] placeholder:text-[#a18c7c] placeholder:italic focus:outline-none focus:ring-1 focus:ring-[#d49b48] resize-none leading-relaxed"
                    autoFocus={isEditing}
                  />

                  {/* Quick Suggestion Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[#8c786a] font-medium flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-[#d49b48]" />
                      <span>{lang === 'vi' ? 'Gợi ý nhanh:' : 'Quick tags:'}</span>
                    </span>
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNote((prev) => prev ? `${prev} • ${prompt}` : prompt)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4ebdc] hover:bg-[#ebdcc4] text-[#634e3f] border border-[#dec9ab] transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {hasNote && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-2.5 py-1 rounded-xl text-xs text-[#736357] hover:bg-black/5 cursor-pointer"
                      >
                        {lang === 'vi' ? 'Hủy' : 'Cancel'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-3.5 py-1.5 rounded-xl bg-[#8a532a] hover:bg-[#72421e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                    >
                      <PenTool className="w-3 h-3 text-[#fde047]" />
                      <span>{lang === 'vi' ? 'Ghim Vào Sổ Tay' : 'Save To Notebook'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Static Readout with Subtle Notebook Ruled Lines */
                <div 
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 rounded-xl bg-[#fffef9]/70 border border-[#e8d7be] cursor-pointer hover:bg-[#fffef9] transition-all group"
                  title={lang === 'vi' ? 'Bấm để sửa ghi chú' : 'Click to edit note'}
                >
                  <p className="text-xs sm:text-sm font-serif italic text-[#3a281e] leading-relaxed break-words">
                    "{note}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#9c8777] mt-1.5 pt-1 border-t border-[#ebd8c1]/60">
                    <span className="flex items-center gap-1 group-hover:text-[#8a532a]">
                      <Edit3 className="w-3 h-3" />
                      <span>{lang === 'vi' ? 'Chạm để sửa' : 'Click to edit'}</span>
                    </span>
                    {savedTime && <span>{savedTime}</span>}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
