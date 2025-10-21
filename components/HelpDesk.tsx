import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import LoadingSpinner from './LoadingSpinner';

const systemInstruction = `You are a helpful and friendly customer support assistant for Keystone, an all-in-one business management application. Your goal is to answer user questions about the app's features and subscription plans.

**Application Overview:**
Keystone offers AI tools and management dashboards. There are three subscription plans:
- **Starter Plan (Personal Account):** Includes the 'AI Thumbnail Studio' and 'AI Logo Generator'.
- **Pro Plan (Personal Account):** Includes everything in Starter, plus the 'Startup Suite' which has tools for financial tracking (sales, costs, investments) and a Lean Canvas for business planning.
- **Enterprise Plan (Company Account):** Includes an advanced 'Enterprise Hub' with professional tools for Accounts, HR, Inventory, Marketing, Reports, and a Cash Book. It does *not* include the creative tools or the Startup Suite.

**Your Role:**
- Answer questions about how to use specific features (e.g., "How do I add a new employee?").
- Explain what is included in each subscription plan.
- Guide users on how to upgrade or change their plan (they need to go to the user menu at the top of the page and click 'Sign Out').
- If you cannot answer a question or if the user is frustrated, politely instruct them to contact human support by clicking the 'Contact Support' button. Do not invent features or make promises. Be concise and clear in your responses.`;

interface Message {
    role: 'user' | 'model';
    text: string;
}

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500";


const HelpDesk: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            const API_KEY = process.env.API_KEY;
            if (API_KEY) {
                const ai = new GoogleGenAI({ apiKey: API_KEY });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction },
                });
                setMessages([{ role: 'model', text: 'Hello! How can I help you with Keystone today?' }]);
            } else {
                setMessages([{ role: 'model', text: 'API Key is not configured. Help desk is unavailable.' }]);
            }
        }
    }, [isOpen]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                throw new Error("Chat session not initialized.");
            }
            const responseStream = await chatRef.current.sendMessageStream({ message: input });

            let modelResponse = '';
            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            let errorText = 'Sorry, I encountered an error. Please try again or contact support.';
            if (error instanceof Error && error.message.includes('Requested entity was not found')) {
                window.dispatchEvent(new Event('apiKeyError'));
                errorText = 'Your API key is invalid. I cannot continue. Please select a valid key to use Keystone features.';
                setTimeout(() => setIsOpen(false), 3000);
            }
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = errorText;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleContactSupport = () => {
        const subject = encodeURIComponent("Keystone App Support Request");
        const body = encodeURIComponent("Hello Keystone Support Team,\n\nI have a question about the app:\n\n[Please describe your issue here]\n\nThank you!");
        window.location.href = `mailto:support@keystone.com?subject=${subject}&body=${body}`;
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform z-40"
                aria-label="Open Help Desk"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[360px] h-[520px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-40 animate-fade-in">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">AI Help Desk</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-75"></div>
                               <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-150"></div>
                               <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse delay-300"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
             <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleContactSupport} className="w-full text-center text-xs text-purple-600 dark:text-purple-400 hover:underline mb-2">
                    Can't find an answer? Contact Support
                </button>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className={`${formInputClasses} flex-1 text-sm`}
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4" disabled={isLoading || !input.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.17 16.57l4.11-1.175a1 1 0 011.127 1.258l-2.285 6.48a1 1 0 001.393 1.125l7-2.5a1 1 0 00.514-1.637l-14-7z" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HelpDesk;