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
  ShieldCheck
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
}

export const DermChatDrawer: React.FC<DermChatDrawerProps> = ({
  isOpen,
  onClose,
  patientName = 'Patient'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'advisor',
      text: `Hello ${patientName}! I am Dr. Ananya's clinical skincare advisor assistant. I have reviewed your 3-angle facial scan. How can I help you with your daily routine or active ingredients today?`,
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

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: inputVal.trim(),
      time: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputVal.toLowerCase();
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (query.includes('purge') || query.includes('purging') || query.includes('bump')) {
        reply = 'Mild purging is completely expected during weeks 1-3 as active ingredients accelerate cellular turnover. If bumps are non-itching and in your usual acne zones, keep using your Cica Barrier Cream and do not pick at them!';
      } else if (query.includes('sunscreen') || query.includes('spf')) {
        reply = 'Always apply your Invisible Matte SPF 50+ as the final morning step, at least 15 minutes before stepping into direct sunlight. Reapply every 3-4 hours if sweating or outdoors.';
      } else if (query.includes('peel') || query.includes('dry') || query.includes('sting')) {
        reply = 'If you experience mild peeling or stinging, practice "sandwiching": Apply your Cica Ceramide Cream first, wait 5 minutes, apply a pea-sized amount of your PM active, then finish with another light layer of cream.';
      } else if (query.includes('pregnant') || query.includes('pregnancy')) {
        reply = 'Retinoids and high-strength Salicylic acid (>2%) are strictly contraindicated during pregnancy and breastfeeding. Please let us know so we can keep your regimen limited to pregnancy-safe Azelaic Acid, Niacinamide, and Ceramides.';
      } else {
        reply = 'Thank you for your question! Your regimen is designed to clear micro-comedones while safeguarding your moisture barrier. Ensure you apply products on clean, dry skin and avoid mixing other unverified physical scrubs.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'advisor',
          text: reply,
          time: 'Just now'
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>DermAdvisor Live Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                CureSkin Protocol • Clinical Skin Advisor
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'advisor' && (
                <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0 text-xs">
                  DR
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-slate-500 text-xs pl-9">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px]">Advisor is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950 flex gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => setInputVal('Is skin purging normal?')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap"
          >
            Purging or breakout?
          </button>
          <button
            onClick={() => setInputVal('How to apply sunscreen?')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap"
          >
            Sunscreen application
          </button>
          <button
            onClick={() => setInputVal('My skin feels dry/stinging')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap"
          >
            Dryness / Stinging
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your routine, actives, or peeling..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 flex items-center justify-center transition shadow font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
