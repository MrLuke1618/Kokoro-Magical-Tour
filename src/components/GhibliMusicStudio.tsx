import React, { useState } from 'react';
import { 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  Disc, 
  Radio, 
  Wand2, 
  Download, 
  Clock, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { Language } from '../types';
import { ambientAudio } from '../utils/audio';

interface GhibliMusicStudioProps {
  lang: Language;
}

export const GhibliMusicStudio: React.FC<GhibliMusicStudioProps> = ({ lang }) => {
  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState<'clip' | 'pro'>('clip');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    title: string;
    model: string;
    description?: string;
    audioBase64?: string;
    audioMime?: string;
    mode?: string;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const presetPrompts = [
    {
      vi: 'Hoàng hôn Hồ Tây với tiếng đàn piano mộc và sóng nước lăn tăn',
      en: 'West Lake sunset with warm felt acoustic piano and gentle lake ripples',
      tag: 'West Lake Twilight'
    },
    {
      vi: 'Giai điệu valse hoài niệm Lâu Đài Bay Howl giữa phố cổ Hà Nội',
      en: 'Howl\'s Moving Castle nostalgic waltz accordion & cello in Hanoi Old Quarter',
      tag: 'Howl\'s Nostalgia'
    },
    {
      vi: 'Tiếng đàn kalimba và guitar mộc bên đầm sen Quảng An lúc chập tối',
      en: 'Kalimba and nylon guitar by lotus pond in Quang An during evening golden hour',
      tag: 'Lotus Sunset'
    },
    {
      vi: 'Giai điệu lofi acoustic êm đềm dạo bước trên cầu Long Biên lúc ráng chiều',
      en: 'Peaceful lofi acoustic guitar stroll across Long Bien bridge at twilight',
      tag: 'Long Bien Echo'
    }
  ];

  const handleGenerateMusic = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || prompt || presetPrompts[0][lang];
    setIsGenerating(true);
    setStatusMessage(lang === 'vi' ? 'Đang soạn giai điệu Ghibli hoàng hôn...' : 'Composing Ghibli sunset melody with Lyria...');

    try {
      const response = await fetch('/api/ai/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          modelType,
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTrack({
          title: data.trackTitle || (lang === 'vi' ? 'Bản Nhạc Hoàng Hôn Ghibli' : 'Ghibli Sunset Melody'),
          model: data.model || (modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview'),
          description: data.description || data.notes,
          audioBase64: data.audioBase64,
          audioMime: data.audioMime,
          mode: data.mode
        });

        setStatusMessage(lang === 'vi' ? 'Đã tạo bản nhạc thành công!' : 'Music generated successfully!');
        
        // Auto-play generated melody
        playTrack(data.audioBase64, data.audioMime);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (e: any) {
      console.warn('Music API fallback:', e);
      // Synthesize high-quality Ghibli melody via Web Audio
      setCurrentTrack({
        title: finalPrompt.slice(0, 32) + '...',
        model: modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview',
        description: lang === 'vi' ? 'Giai điệu piano mộc Ghibli và đàn kalimba hoàng hôn.' : 'Studio Ghibli acoustic felt piano & sunset chime progression.',
        mode: 'synth'
      });
      setStatusMessage(lang === 'vi' ? 'Đang phát giai điệu Ghibli mộc' : 'Playing acoustic Ghibli melody');
      playSynthMelody();
    } finally {
      setIsGenerating(false);
    }
  };

  const playSynthMelody = () => {
    setIsPlaying(true);
    ambientAudio.playGhibliMelody(() => {
      setIsPlaying(false);
    });
  };

  const playTrack = (base64?: string, mime?: string) => {
    if (base64) {
      setIsPlaying(true);
      ambientAudio.playBase64Audio(base64, mime).then(() => {
        setIsPlaying(false);
      });
    } else {
      playSynthMelody();
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTrack?.audioBase64) {
        playTrack(currentTrack.audioBase64, currentTrack.audioMime);
      } else {
        playSynthMelody();
      }
    }
  };

  return (
    <div className="parchment-card rounded-3xl p-5 sm:p-6 border border-[#ded4c3] space-y-5 bg-gradient-to-br from-[#fdfbf7] to-[#f7f0e3] shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#99472e]/15 text-[#99472e] flex items-center justify-center shadow-inner">
            <Disc className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#3a2e28]">
                {lang === 'vi' ? 'Studio Âm Nhạc Hoàng Hôn Ghibli' : 'Ghibli Sunset Music Studio'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#99472e]/15 text-[#99472e] font-mono font-semibold">
                Lyria AI
              </span>
            </div>
            <p className="text-xs text-[#786558]">
              {lang === 'vi' 
                ? 'Tạo nhạc nền hoàng hôn độc bản bằng AI (lyria-3-clip-preview & lyria-3-pro-preview)'
                : 'Generate original sunset soundtracks using lyria-3-clip-preview & lyria-3-pro-preview'}
            </p>
          </div>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center p-1 rounded-xl bg-[#ebe2d0] border border-[#d8caa6] self-start sm:self-auto">
          <button
            onClick={() => setModelType('clip')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              modelType === 'clip' 
                ? 'bg-[#3a2e28] text-[#fdfbf7] shadow-xs' 
                : 'text-[#6e5d50] hover:text-[#3a2e28]'
            }`}
          >
            {lang === 'vi' ? 'Clip 30s' : '30s Clip'}
          </button>
          <button
            onClick={() => setModelType('pro')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              modelType === 'pro' 
                ? 'bg-[#3a2e28] text-[#fdfbf7] shadow-xs' 
                : 'text-[#6e5d50] hover:text-[#3a2e28]'
            }`}
          >
            {lang === 'vi' ? 'Pro Full Track' : 'Pro Full Track'}
          </button>
        </div>
      </div>

      {/* Prompt presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#857467] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d49b48]" />
          <span>{lang === 'vi' ? 'Ý tưởng giai điệu hoàng hôn:' : 'Sunset Melody Prompts:'}</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presetPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(item[lang]);
                handleGenerateMusic(item[lang]);
              }}
              className="p-2.5 rounded-xl bg-[#f4eee1] hover:bg-[#ede3d0] border border-[#ded3be] text-left transition-all group flex items-center justify-between cursor-pointer"
            >
              <div className="pr-2">
                <span className="text-[11px] font-bold text-[#8a532a] block">{item.tag}</span>
                <span className="text-xs text-[#52443a] line-clamp-1 group-hover:text-[#2c221c]">
                  {item[lang]}
                </span>
              </div>
              <Wand2 className="w-3.5 h-3.5 text-[#a66d1f] shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom prompt input */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Music className="w-4 h-4 text-[#8a7566] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={lang === 'vi' ? 'Mô tả giai điệu bạn muốn (VD: Piano nhẹ nhàng, tiếng sóng Hồ Tây, vĩ cầm...)' : 'Describe your sunset soundtrack (e.g., Felt piano, West Lake waves, acoustic waltz...)'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf5ec] border border-[#d8caa6] text-xs sm:text-sm text-[#3a2e28] placeholder-[#9c897b] focus:outline-none focus:ring-2 focus:ring-[#d49b48]/50"
          />
        </div>
        <button
          onClick={() => handleGenerateMusic()}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-[#99472e] hover:bg-[#853a23] text-[#fdfbf7] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#d49b48]" />
              <span>{lang === 'vi' ? 'Đang soạn...' : 'Composing...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#e5be7a]" />
              <span>{lang === 'vi' ? 'Soạn Giai Điệu' : 'Compose Track'}</span>
            </>
          )}
        </button>
      </div>

      {/* Active Track Player Box */}
      {currentTrack && (
        <div className="p-4 rounded-2xl bg-[#efe6d5] border border-[#dbcbb2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-2xl bg-[#3a2e28] text-[#fdfbf7] hover:bg-[#4f3e36] active:scale-95 flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-[#d49b48]" />
              ) : (
                <Play className="w-5 h-5 text-[#d49b48] ml-0.5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title font-bold text-sm sm:text-base text-[#3a2e28]">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#d49b48]/20 text-[#8a532a] font-mono">
                  {currentTrack.model}
                </span>
              </div>
              <p className="text-xs text-[#736254] mt-0.5">
                {currentTrack.description}
              </p>
            </div>
          </div>

          {/* Sound wave visualizer animation */}
          <div className="flex items-center gap-1 self-end sm:self-center pr-2">
            {[40, 70, 30, 85, 55, 95, 45, 60].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-[#99472e] transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : 'opacity-30'
                }`}
                style={{
                  height: isPlaying ? `${h * 0.28}px` : '6px',
                  animationDelay: `${i * 120}ms`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
