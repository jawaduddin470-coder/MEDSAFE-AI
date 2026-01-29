import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const MediSafeAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I am MediSafe Assistant. I can help you understand medication safety, explain risk reports, or navigate the app. How can I help you today?',
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setInputText('');
        setIsLoading(true);

        try {
            // Prepare history for API (excluding the very first welcome message if needed, or mapping correctly)
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                content: m.content
            }));

            const response = await axios.post('http://localhost:5001/api/ai/chat', {
                message: userMessage,
                history: history
            });

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: response.data.response },
            ]);
        } catch (error) {
            console.error('Chat Error:', error);
            let errorMessage = "I'm having trouble connecting right now. Please try again later.";
            if (error.response && error.response.status === 503) {
                errorMessage = "My AI services are currently unavailable (configuration issue). Please contact support.";
            }
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: errorMessage },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">MediSafe Assistant</h3>
                                <p className="text-xs text-blue-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Safety Awareness
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                            aria-label="Close chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Disclaimer Banner */}
                    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-100 dark:border-amber-800 p-2 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-200 shrink-0">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
                        <p className="leading-tight">
                            <b>Educational Use Only:</b> I cannot provide medical advice, diagnosis, or treatment. In emergencies, call 911 or your doctor.
                        </p>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 mt-1">
                                        <Bot size={16} className="text-blue-600" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                                        <User size={16} className="text-gray-500" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                                    <Bot size={16} className="text-blue-600" />
                                </div>
                                <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask about medication safety..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isLoading}
                                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">AI can make mistakes. Always verify important info.</p>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-2 p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:shadow-blue-500/30 hover:scale-105'
                    }`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <MessageCircle size={24} className="animate-bounce-subtle" />
                        <span className="font-semibold pr-1 hidden group-hover:block animate-in slide-in-from-right-2 fade-in duration-300 text-sm">
                            MediSafe Assistant
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};

export default MediSafeAssistant;
