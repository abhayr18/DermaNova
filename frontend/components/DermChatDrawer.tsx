'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  UserCheck,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Sun,
  Flame,
  CheckCircle2,
  ChevronRight,
  Pill,
  Heart
} from 'lucide-react';

interface DermChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
}

interface Message {
  sender: 'advisor' | 'user';
  text: string;
  time: string;
  fitCard?: {
    name: string;
    brand: string;
    fitScore: number;
    price: string;
    why: string;
  };
}

export const DermChatDrawer: React.FC<DermChatDrawerProps> = ({
  isOpen,
  onClose,
  patientName = 'Patient'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'advisor',
      text: `Hello ${patientName}! I’m your Lóvi 24/7 AI Cosmetologist. I have reviewed your facial scan and barrier health. How does your skin feel today?`,
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickQuestion = (queryText: string) => {
    setInputVal(queryText);
    sendMessage(queryText);
  };

  const handleSkinFeeling = (feeling: 'Great' | 'Fine' | 'Not good') => {
    let reply = '';
    if (feeling === 'Great') {
      reply = 'Wonderful to hear! That confirms your current barrier repair actives are balancing sebum and keeping transepidermal water loss low. Remember UV Index is high today (7.2), so keep your SPF close!';
    } else if (feeling === 'Fine') {
      reply = 'Steady progress is the foundation of healthy skin. Consistency with gentle botanical cleansing and moisture barrier sealing will continue refining your texture over the coming 3 weeks.';
    } else {
      reply = 'I hear you. If you are experiencing tightness, stinging, or active breakouts, pause all harsh physical scrubs. Apply your Centella Ceramide cream first, and let us target only the pinpointed lesion zones tonight.';
    }

    const userMsg: Message = {
      sender: 'user',
      text: `My skin feels ${feeling.toLowerCase()} today.`,
      time: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'advisor',
          text: reply,
          time: 'Just now'
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const sendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: text.trim(),
      time: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    const query = text.toLowerCase();

    setTimeout(() => {
      let reply = '';
      let fitCard: any = null;

      if (query.includes('evening') || query.includes('night') || query.includes('routine')) {
        reply = 'Based on your SkinID and current scan, your evening routine is where restoration happens. Consider adding a stabilized retinoid or azelaic acid to speed cellular turnover while your skin regenerates:';
        fitCard = {
          name: 'Retinol 0.5% in Squalane',
          brand: 'The Ordinary',
          fitScore: 92,
          price: '$8.30',
          why: 'Slows down photoaging without stripping epidermal barrier moisture.'
        };
      } else if (query.includes('spf') || query.includes('sunscreen') || query.includes('sun')) {
        reply = 'UV index is elevated today! For acne-prone and reactive skin, look for mineral zinc or lightweight fluid multi-filter sunscreens that leave zero white cast and do not clog pores:';
        fitCard = {
          name: 'Anthelios Melt-In Sunscreen Milk SPF 60',
          brand: 'La Roche-Posay',
          fitScore: 94,
          price: '$25.99',
          why: 'Photostable UVA/UVB defense prevents dark post-inflammatory hyperpigmentation (PIH).'
        };
      } else if (query.includes('purge') || query.includes('purging') || query.includes('breakout')) {
        reply = 'Mild purging is completely expected during weeks 1–3 as active ingredients clear micro-comedones. If the bumps are in your usual acne pinpoint zones, do not pick them—maintain hydration and barrier defense!';
      } else if (query.includes('pregnant') || query.includes('pregnancy')) {
        reply = 'High-dose retinoids and salicylic acid (>2%) are contraindicated in pregnancy. Lóvi automatically filters your recommendations to 100% pregnancy-safe Azelaic Acid, Niacinamide, and Centella Asiatica.';
      } else {
        reply = 'Thank you for your question! Every recommendation is reviewed by our medical board of cosmetic chemists and dermatologists, guaranteed 100% brand-neutral. Apply spot treatments after cleansing, and let your barrier rest overnight.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'advisor',
          text: reply,
          time: 'Just now',
          fitCard
        }
      ]);
      setIsTyping(false);
    }, 850);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navara-dark/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md h-full bg-[#181d15] border-l border-navara-border flex flex-col shadow-2xl">
        
        {/* Drawer Header (Navara Botanical + Lovi AI Style) */}
        <div className="p-4 border-b border-navara-border bg-[#1c2219] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#3a4a2f] to-[#aaab87] flex items-center justify-center text-navara-dark font-black shadow-lg">
              <Bot className="w-5 h-5 text-navara-ivory" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-luxury text-sm font-bold text-navara-ivory">
                  Lóvi AI Cosmetologist
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-navara-matcha/20 text-navara-matcha border border-navara-matcha/30 font-bold">
                  24/7 Live
                </span>
              </div>
              <div className="text-[11px] font-mono text-navara-stone">
                USMLE-Level Medical Reasoning • 0% Brand Hype
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#232e1b] hover:bg-[#2c3a22] text-navara-stone hover:text-navara-ivory transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Environmental UV Index Widget */}
        <div className="px-4 py-2 bg-gradient-to-r from-[#2a3b19] to-[#1c2219] border-b border-navara-borderSubtle flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-navara-cream">
            <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>UV Index: <strong className="text-navara-ivory">7.2 (High)</strong> • Wear SPF 50+</span>
          </div>
          <span className="text-[10px] font-mono text-navara-matcha font-bold">Live Sensor</span>
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Daily Feeling Check-in Prompt */}
          <div className="p-3.5 rounded-2xl bg-[#232e1b]/70 border border-navara-border space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navara-sage flex items-center gap-1">
              <Heart className="w-3 h-3 text-navara-terracotta" /> Daily Skin Check-In
            </span>
            <p className="text-xs text-navara-cream">How does your skin feel right now?</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleSkinFeeling('Great')}
                className="px-3 py-1 rounded-xl bg-[#1c2219] hover:bg-[#283221] border border-navara-borderSubtle text-xs text-navara-ivory transition"
              >
                ✨ Great
              </button>
              <button
                onClick={() => handleSkinFeeling('Fine')}
                className="px-3 py-1 rounded-xl bg-[#1c2219] hover:bg-[#283221] border border-navara-borderSubtle text-xs text-navara-ivory transition"
              >
                🌿 It's fine
              </button>
              <button
                onClick={() => handleSkinFeeling('Not good')}
                className="px-3 py-1 rounded-xl bg-[#1c2219] hover:bg-[#283221] border border-navara-borderSubtle text-xs text-navara-ivory transition"
              >
                💧 Tight / Reactive
              </button>
            </div>
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-navara-ivory text-navara-dark font-medium rounded-br-none shadow-md'
                    : 'bg-[#232e1b] border border-navara-border text-navara-cream rounded-bl-none shadow-sm'
                }`}
              >
                <p>{msg.text}</p>

                {/* Optional Embedded Fit Score Card */}
                {msg.fitCard && (
                  <div className="p-3 rounded-xl bg-[#181d15] border border-navara-borderSubtle text-xs space-y-1.5 mt-2 text-navara-ivory">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-navara-ivory">
                        {msg.fitCard.name}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
                        {msg.fitCard.fitScore}% Fit
                      </span>
                    </div>
                    <div className="text-[10px] text-navara-stone">{msg.fitCard.brand} • {msg.fitCard.price}</div>
                    <p className="text-[10px] text-navara-sage leading-snug">{msg.fitCard.why}</p>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-mono text-navara-stone/80 mt-1 px-1">
                {msg.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#232e1b] border border-navara-border w-24">
              <span className="w-1.5 h-1.5 rounded-full bg-navara-sage animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-navara-sage animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-navara-sage animate-bounce delay-200" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 border-t border-navara-borderSubtle bg-[#1c2219]/90 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => handleQuickQuestion('How can I improve my evening routine?')}
            className="px-2.5 py-1 rounded-xl bg-[#232e1b] hover:bg-[#2e3d23] border border-navara-borderSubtle text-navara-cream whitespace-nowrap text-[11px]"
          >
            🌙 Improve evening routine
          </button>
          <button
            onClick={() => handleQuickQuestion('What are the TOP-3 SPFs for my skin?')}
            className="px-2.5 py-1 rounded-xl bg-[#232e1b] hover:bg-[#2e3d23] border border-navara-borderSubtle text-navara-cream whitespace-nowrap text-[11px]"
          >
            ☀️ Top 3 SPFs for my skin
          </button>
          <button
            onClick={() => handleQuickQuestion('Why is my skin purging or peeling?')}
            className="px-2.5 py-1 rounded-xl bg-[#232e1b] hover:bg-[#2e3d23] border border-navara-borderSubtle text-navara-cream whitespace-nowrap text-[11px]"
          >
            💧 Why is my skin peeling?
          </button>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-navara-border bg-[#181d15] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Lóvi anything about your skin or ingredients..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2.5 rounded-2xl glass-input text-xs font-sans placeholder:text-navara-stone/50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-2xl bg-navara-ivory hover:bg-navara-cream disabled:opacity-40 text-navara-dark transition shadow-lg shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
