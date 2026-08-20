import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Headphones,
  Activity,
  Globe,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Language } from '../types';

interface GhibliLiveVoiceCompanionProps {
  lang: Language;
}

interface DialogueMessage {
  id: string;
  sender: 'user' | 'assistant';
  englishSpeech: string;
  vietnameseSubtitle: string;
  timestamp: string;
}

export const GhibliLiveVoiceCompanion: React.FC<GhibliLiveVoiceCompanionProps> = ({ lang }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [messages, setMessages] = useState<DialogueMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      englishSpeech: "Welcome to Hanoi Sunset Sanctuary. What would you like to explore this evening?",
      vietnameseSubtitle: "Chào mừng bạn đến với Hanoi Sunset Sanctuary. Bạn muốn khám phá điều gì chiều nay?",
      timestamp: '17:00'
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const quickPrompts = [
    {
      en: 'What is the best angle for West Lake sunset today?',
      vi: 'Góc ngắm hoàng hôn Hồ Tây đẹp nhất chiều nay?'
    },
    {
      en: 'Recommend a quiet cafe with zero glare for reading',
      vi: 'Gợi ý quán cafe yên tĩnh không bị chói nắng?'
    },
    {
      en: 'What outfit colors match the evening lighting?',
      vi: 'Phối màu trang phục nào hợp với ánh ráng chiều?'
    }
  ];

  // Speech Recognition Setup (supports both English and Vietnamese voice inputs)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  // Connect WebSocket for low-latency dialogue
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({ type: 'start_session' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ai_dialogue') {
            const newMsg: DialogueMessage = {
              id: `msg-${Date.now()}`,
              sender: 'assistant',
              englishSpeech: data.englishSpeech,
              vietnameseSubtitle: data.vietnameseSubtitle,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, newMsg]);
            setIsLoading(false);
            if (!isMuted) {
              speakEnglishText(data.englishSpeech);
            }
          }
        } catch {
          setIsLoading(false);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch {
      setIsConnected(false);
    }

    return () => {
      wsRef.current?.close();
    };
  }, [isMuted]);

  // Native English speech synthesis (voice in English only)
  const speakEnglishText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.pitch = 1.0;
      utterance.rate = 0.95;

      // Select high-quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Karen')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      } else {
        const randomPrompt = quickPrompts[Math.floor(Math.random() * quickPrompts.length)][lang];
        handleSendMessage(randomPrompt);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: DialogueMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      englishSpeech: text,
      vietnameseSubtitle: text,
      timestamp: now
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Send via WebSocket or dynamic HTTP endpoint
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_text',
        text,
        seed: Date.now()
      }));
    } else {
      try {
        const res = await fetch('/api/ai/live-dialogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userText: text, seed: Date.now() })
        });
        const data = await res.json();
        const newMsg: DialogueMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          englishSpeech: data.englishSpeech,
          vietnameseSubtitle: data.vietnameseSubtitle,
          timestamp: now
        };
        setMessages((prev) => [...prev, newMsg]);
        if (!isMuted) {
          speakEnglishText(data.englishSpeech);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="parchment-card rounded-[24px] p-5 sm:p-6 border border-[#ded4c3] space-y-4 bg-gradient-to-br from-[#fdfbf7] to-[#f7efe1] shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#7a9aab]/20 text-[#2f4d5c] flex items-center justify-center shadow-inner relative">
            <Headphones className="w-5 h-5" />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d49b48] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d49b48]"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-title font-bold text-base sm:text-lg text-[#3a2e28]">
                {lang === 'vi' ? 'Live Companion • Giọng Tiếng Anh & Phụ Đề Việt' : 'Live Companion • English Voice & VN Subtitles'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5d6e58]/15 text-[#3b4b38] font-semibold border border-[#5d6e58]/25">
                EN Voice + VN Sub
              </span>
            </div>
            <p className="text-xs text-[#786558]">
              {lang === 'vi' 
                ? 'Trò chuyện bằng giọng nói tiếng Anh tự nhiên kèm phụ đề tiếng Việt chuẩn xác'
                : 'Natural English speech synthesis with synchronized Vietnamese subtitles'}
            </p>
          </div>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={() => {
            if (isSpeaking) window.speechSynthesis.cancel();
            setIsMuted(!isMuted);
          }}
          className={`p-2 rounded-[12px] border transition-all cursor-pointer ${
            isMuted ? 'bg-[#ebe2d0] text-[#8a7566] border-[#d8caa6]' : 'bg-[#d49b48]/15 text-[#8a532a] border-[#d49b48]/35'
          }`}
          title={isMuted ? 'Bật âm thanh giọng nói' : 'Tắt âm thanh giọng nói'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Voice Visualizer Avatar Bar */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-[#f0e7d5]/60 border border-[#ded2bc] flex flex-col items-center justify-center text-center space-y-3">
        <div className="relative flex items-center justify-center">
          <div className={`absolute w-20 h-20 rounded-full bg-[#d49b48]/20 transition-transform duration-500 ${
            isListening || isSpeaking ? 'scale-150 animate-ping opacity-60' : 'scale-100 opacity-20'
          }`} />

          <button
            onClick={toggleListening}
            className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-[#99472e] text-white scale-110 ring-4 ring-[#99472e]/30'
                : 'bg-[#3a2e28] text-[#d49b48] hover:bg-[#4d3d35]'
            }`}
            title={lang === 'vi' ? 'Bấm để nói chuyện' : 'Click to talk'}
          >
            {isListening ? (
              <Mic className="w-6 h-6 animate-pulse text-white" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-[#4a3a30] block">
            {isListening 
              ? (lang === 'vi' ? 'Đang nghe giọng nói của bạn...' : 'Listening to your voice...') 
              : isSpeaking 
                ? (lang === 'vi' ? 'Đang phát âm thanh tiếng Anh...' : 'Speaking in English...')
                : (lang === 'vi' ? 'Bấm Micro để trò chuyện hoặc nhập văn bản' : 'Click Mic to talk or type below')}
          </span>
          <span className="text-[11px] text-[#8c786a]">
            {lang === 'vi' ? 'Câu hỏi nhanh:' : 'Quick questions:'}
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.en)}
              className="px-3 py-1.5 rounded-full bg-[#fdfbf7] hover:bg-[#f6eee0] border border-[#d8caa6] text-xs text-[#52443a] transition-all hover:scale-102 cursor-pointer shadow-2xs"
            >
              💬 "{lang === 'vi' ? qp.vi : qp.en}"
            </button>
          ))}
        </div>
      </div>

      {/* Message Dialogue Feed with Dual English + Subtitle rendering */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-[18px] text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#3a2e28] text-[#fdfbf7] rounded-tr-xs shadow-2xs'
                  : 'bg-[#fdfbf7] text-[#3a2e28] border border-[#ded3be] rounded-tl-xs shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5 text-[10px] opacity-70">
                <span className="font-semibold">
                  {msg.sender === 'user' ? (lang === 'vi' ? 'Bạn' : 'You') : 'Live Companion (EN)'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {msg.sender === 'assistant' ? (
                <div className="space-y-2">
                  {/* English Spoken Audio Text */}
                  <div className="flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-[#8a532a] shrink-0 mt-0.5" />
                    <p className="font-medium text-[#2d241f] text-xs sm:text-sm">
                      {msg.englishSpeech}
                    </p>
                  </div>

                  {/* Vietnamese Subtitle Box */}
                  <div className="p-2.5 rounded-[12px] bg-[#f4ece0] border border-[#ded1be] text-xs text-[#5a483d] flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-[#d49b48]/20 text-[#8a532a] font-bold text-[10px] shrink-0">
                      Phụ đề
                    </span>
                    <p className="leading-normal">
                      {msg.vietnameseSubtitle}
                    </p>
                  </div>
                </div>
              ) : (
                <p>{msg.englishSpeech}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#8a7566] p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d49b48]" />
            <span>{lang === 'vi' ? 'Đang tạo câu trả lời mới...' : 'Generating fresh response...'}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={lang === 'vi' ? 'Nhập tin nhắn hoặc câu hỏi...' : 'Type a message or question...'}
          className="flex-1 px-4 py-2.5 rounded-[14px] bg-[#fdfbf7] border border-[#d8caa6] text-xs sm:text-sm text-[#3a2e28] placeholder-[#9c897b] focus:outline-none focus:ring-2 focus:ring-[#d49b48]/50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2.5 rounded-[14px] bg-[#3a2e28] hover:bg-[#4f3e36] disabled:opacity-50 text-[#fdfbf7] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#d49b48]" />
          <span className="hidden sm:inline">{lang === 'vi' ? 'Gửi' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};
