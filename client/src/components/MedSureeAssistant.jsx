import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldAlert, RotateCcw, MessageCircle, Loader2, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';

const MedSureeAssistant = () => {
    const { t, lang } = useLanguage();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize/Update greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: t('ai_greeting') || "Hello! I'm your MedSuree Safety Assistant. How can I help you today?",
            }]);
        }
    }, [lang, t]);

    useEffect(() => {
        const handler = () => setOpen(prev => !prev);
        window.addEventListener('toggle-assistant', handler);
        return () => window.removeEventListener('toggle-assistant', handler);
    }, []);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [open, messages]);

    const sendMessage = async (retryCount = 0) => {
        const userMessage = input.trim();
        if (!userMessage || loading) return;

        setInput('');
        setError('');

        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const { data } = await axios.post(`${API_URL}/ai/chat`, {
                message: userMessage,
                history: messages.slice(-8), // context window
            });

            setMessages([...newMessages, { role: 'assistant', content: data.response }]);
        } catch (err) {
            const status = err.response?.status;
            if (retryCount < 1 && (!status || status >= 500)) {
                await new Promise(r => setTimeout(r, 1000));
                setLoading(false);
                setInput(userMessage);
                return sendMessage(retryCount + 1);
            }
            if (status === 429) {
                setError("Quota Exceeded: The AI service is at its limit. Please try again in 1 minute.");
                setMessages([...newMessages, {
                    role: 'assistant',
                    content: "Neural cloud is currently at maximum capacity. Please wait a moment before trying again.",
                    isError: true,
                }]);
            } else {
                setError(t('ai_error_generic') || "Failed to sync with Neural Cloud.");
                setMessages([...newMessages, {
                    role: 'assistant',
                    content: t('ai_error_response') || "Communication error. Check your connection.",
                    isError: true,
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: t('ai_greeting') || "Neural system reset. How can I assist?",
        }]);
        setError('');
    };

    const renderContent = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />');
    };

    return (
        <>
            {/* ── Trigger Bubble ─────────────────────────────────────────── */}
            <button
                onClick={() => setOpen(true)}
                className={`fixed bottom-10 right-10 z-[100] w-20 h-20 rounded-[2.5rem] bg-indigo-600 shadow-3xl shadow-indigo-600/40 flex items-center justify-center transition-all duration-700 hover:scale-110 hover:-rotate-6 hover:shadow-indigo-600/60 group overflow-hidden ${open ? 'scale-0 rotate-90 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <MessageCircle size={32} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute top-4 right-4 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600 z-20 animate-pulse" />
            </button>

            {/* ── Chat Interface ─────────────────────────────────────────── */}
            <div className={`fixed bottom-10 right-10 z-[101] w-[420px] max-w-[calc(100vw-40px)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
                <div className="flex flex-col rounded-[3.5rem] overflow-hidden shadow-4xl border border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl" style={{ height: '650px', maxHeight: '85vh' }}>

                    {/* Header */}
                    <div className="relative px-8 py-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shrink-0 shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:12px_12px]" />

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group transition-all duration-500 hover:rotate-12">
                                    <Sparkles size={28} className="text-white animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-tighter italic leading-tight">Neural <span className="text-indigo-200">Shield</span></h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-100 opacity-80">Sync: Authorized</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={clearChat} title="Reset Protocol" className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 border border-transparent hover:border-white/10">
                                    <RotateCcw size={18} />
                                </button>
                                <button onClick={() => setOpen(false)} className="p-3 rounded-2xl bg-black/20 hover:bg-black/40 transition-all active:scale-95">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Window */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                <div className={`flex items-end gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shadow-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`px-5 py-4 rounded-[1.8rem] text-[13px] font-medium leading-relaxed shadow-sm transition-all duration-500 ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : msg.isError
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-500 rounded-bl-sm'
                                            : 'bg-white/5 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-bl-sm hover:bg-white/10'
                                        }`}>
                                        <span dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Animation */}
                        {loading && (
                            <div className="flex justify-start animate-fadeIn">
                                <div className="flex items-end gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                                        <Bot size={14} />
                                    </div>
                                    <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-[1.8rem] rounded-bl-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-4" />
                    </div>

                    {/* Footer / Input Area */}
                    <div className="p-8 bg-white/5 dark:bg-black/20 border-t border-white/5 shrink-0">
                        {messages.length <= 1 && !loading && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {[
                                    { label: 'Check Side Effects', icon: <Trash2 size={12} /> },
                                    { label: 'Safety Guidelines', icon: <ShieldAlert size={12} /> },
                                    { label: 'System Features', icon: <Sparkles size={12} /> }
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setInput(item.label); inputRef.current?.focus(); }}
                                        className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center gap-2"
                                    >
                                        {item.icon} {item.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative group/input">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Sync with Neural Shield..."
                                rows={1}
                                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] pl-6 pr-16 py-5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none overflow-hidden max-h-32"
                                style={{ fieldSizing: 'content' }}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className={`absolute right-3 bottom-3 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center transition-all duration-300 shadow-xl shadow-indigo-600/30 active:scale-90 ${!input.trim() || loading ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-indigo-500 hover:scale-105'}`}
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center mt-4 opacity-40 italic">Global Health Intelligence Network • v2.0</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MedSureeAssistant;
