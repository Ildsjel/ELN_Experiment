import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Trash2, ArrowRight } from 'lucide-react';
import { chatWithData } from '../services/geminiService';
import { ViewState } from '../types';

const CHAT_STORAGE_KEY = 'helix_nexus_chat_history';

interface FormattedMessageProps {
  content: string;
  onNavigate: (view: ViewState, params?: any) => void;
}

// Simple formatter component to handle basic markdown-like syntax from AI responses
const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, onNavigate }) => {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, lineIdx) => {
        // Skip empty lines that are just separators between blocks if they are multiple
        if (line.trim() === '' && lineIdx > 0 && lines[lineIdx-1].trim() === '') return null;

        // Process bold text: **text**
        const processBold = (text: string) => {
          const parts = text.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        // Process CTA buttons: [[CTA: Label | View | Params]]
        const processCTA = (text: string) => {
          const ctaParts = text.split(/(\[\[CTA:.*?\]\])/g);
          return ctaParts.map((part, i) => {
            const match = part.match(/\[\[CTA:\s*(.*?)\s*\|\s*(.*?)\s*(?:\|\s*(.*?)\s*)?\]\]/);
            if (match) {
              const [, label, view, paramsStr] = match;
              let params = undefined;
              try { if (paramsStr) params = JSON.parse(paramsStr); } catch (e) {}
              
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(view as any, params)}
                  className="mt-3 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 active:scale-95 pointer-events-auto"
                >
                  {label} <ArrowRight size={14} />
                </button>
              );
            }
            return processBold(part);
          });
        };

        // Handle numbered or bulleted lists
        const listMatch = line.trim().match(/^(\d+\.|\*|-)\s+(.*)/);
        if (listMatch) {
          const [, marker, text] = listMatch;
          return (
            <div key={lineIdx} className="flex gap-2 ml-1 items-start">
              <span className="shrink-0 font-bold text-indigo-500">{marker}</span>
              <span className="flex-1">{processCTA(text)}</span>
            </div>
          );
        }

        // Handle headers (simple check for lines that are short and bold-only or start with #)
        if (line.trim().startsWith('#')) {
          const level = (line.match(/^#+/) || ['#'])[0].length;
          const text = line.replace(/^#+\s*/, '');
          const textSize = level === 1 ? 'text-lg' : level === 2 ? 'text-md' : 'text-sm';
          return <h4 key={lineIdx} className={`${textSize} font-bold text-slate-900 mt-2 mb-1`}>{processCTA(text)}</h4>;
        }

        return <div key={lineIdx} className="leading-relaxed">{processCTA(line)}</div>;
      })}
    </div>
  );
};

interface ChatBotProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
      }
    }
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setMessages([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await chatWithData(newHistory, userMessage);
      const updatedHistory = [...newHistory, { role: 'model' as const, content: response || "No response" }];
      setMessages(updatedHistory);
    } catch (error) {
      setMessages([...newHistory, { role: 'model' as const, content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[450px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200 flex flex-col max-h-[700px]">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Helix Assistant</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-slate-300">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Clear History"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 h-[450px]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-6">
                <Bot size={40} className="mb-3 opacity-20" />
                <p className="text-sm italic">Hi! I'm your AI lab assistant. Ask me about your experiments, inventory, or general scientific questions.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                    className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                    }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <FormattedMessage content={msg.content} onNavigate={onNavigate} />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 pl-4 pr-12 py-3 bg-slate-100 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-200 transition-all outline-none"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md active:scale-95"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-medium tracking-wide uppercase">
                Helix Intelligence • Gemini 3 Pro
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${
            isOpen 
            ? 'bg-slate-800 text-slate-400 hover:text-white rotate-90' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/40'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};