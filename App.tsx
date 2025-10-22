

import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ThemeToggleButton from './components/ThemeToggleButton';

export type AppState = 'account_selection' | 'onboarding' | 'personal_login' | 'company_login' | 'dashboard' | 'about' | 'contact' | 'privacy' | 'terms' | 'faq';
export type AccountType = 'personal' | 'enterprise';

// --- Centralized Branding Configuration ---
// To change the app name across the entire platform, update it here.
export const BRAND_CONFIG = {
    appName: 'NexusOS'
};

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500";

const Footer: React.FC<{ onNavigate: (state: AppState) => void; }> = ({ onNavigate }) => (
    <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={() => onNavigate('about')} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">About Us</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Contact</button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms of Service</button>
            <button onClick={() => onNavigate('faq')} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">FAQs</button>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} {BRAND_CONFIG.appName} Inc. All rights reserved.</p>
    </footer>
);

const StaticPage: React.FC<{ title: string; children: React.ReactNode; onBack: () => void; }> = ({ title, children, onBack }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-3xl bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10 animate-fade-in shadow-2xl shadow-purple-500/10 relative">
             <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Go back">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 text-center">{title}</h1>
            <div className="text-gray-600 dark:text-gray-400 space-y-4 prose prose-p:text-gray-600 prose-headings:text-gray-900 dark:prose-invert dark:prose-p:text-gray-400 dark:prose-headings:text-white max-w-none">
                {children}
            </div>
        </div>
    </div>
);

const AboutPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title={`About ${BRAND_CONFIG.appName}`} onBack={onBack}>
        <p>{BRAND_CONFIG.appName} was founded on a simple principle: businesses, regardless of their size, deserve powerful, intuitive, and accessible tools to manage their operations. In a world of fragmented software solutions, {BRAND_CONFIG.appName} emerges as the central, indispensable element—the nexus—that connects every facet of your business together.</p>
        <p>Our platform provides an all-in-one hub for everything from AI-powered content creation for your marketing needs to detailed financial tracking, human resources management, and inventory control. We believe that by unifying these critical functions, we empower entrepreneurs, creators, and business leaders to focus on what they do best: innovating and growing.</p>
        <p>Built with a commitment to security and user privacy, {BRAND_CONFIG.appName} operates on an offline-first model. All your sensitive business data is stored locally on your device, ensuring you have absolute control and ownership. Welcome to a smarter way to run your business.</p>
    </StaticPage>
);

const ContactPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Contact Us" onBack={onBack}>
        <p>We're here to help and answer any question you might have. We look forward to hearing from you!</p>
        <p>For general inquiries, support, or feedback, please reach out to us via email. Our team will get back to you as soon as possible.</p>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Developer Contact:</h4>
            <p className="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.2 3.2C10.2 3.2 10.2 3.2 10.2 3.2C6.3 3.2 3.2 6.3 3.2 10.2C3.2 11.7 3.7 13.1 4.5 14.3L3.4 17.4L6.7 16.3C7.8 17 9 17.4 10.2 17.4C14.1 17.4 17.2 14.3 17.2 10.4C17.2 6.5 14.1 3.4 10.2 3.4L10.2 3.2ZM8.2 6.9C8.4 6.5 8.6 6.5 8.8 6.5C8.9 6.5 9.1 6.5 9.2 6.9C9.4 7.3 9.8 8.3 9.9 8.5C10 8.6 10.1 8.7 10 8.8C9.9 8.9 9.8 8.9 9.7 9C9.6 9.1 9.4 9.3 9.3 9.4C9.1 9.6 9 9.7 8.8 9.9C8.7 10 8.5 10.2 8.8 10.5C9.1 10.8 9.6 11.4 10.2 11.9C10.9 12.6 11.5 12.9 11.8 13.1C12 13.2 12.2 13.2 12.3 13C12.4 12.9 12.7 12.5 12.8 12.3C13 12.1 13.1 12.1 13.3 12.1C13.5 12.1 14.5 12.6 14.7 12.8C14.9 12.9 15.1 13.1 15.1 13.2C15.1 13.3 15.1 13.7 14.9 14.1C14.7 14.5 14 15.1 13.6 15.1C13.2 15.1 12.6 14.9 12.1 14.7C11.5 14.4 10.6 14 9.6 13C8.4 11.8 7.7 10.5 7.5 10.2C7.3 9.9 6.9 9.3 6.9 8.8C6.9 8.4 7.2 8.1 7.4 7.9C7.5 7.7 7.7 7.6 7.8 7.5C7.9 7.4 8 7.3 8.1 7.2C8.1 7.1 8.1 7 8.2 6.9Z" /></svg>
                <a href="https://wa.me/923000645233" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">+92 300 0645233 (WhatsApp)</a>
            </p>
             <p className="flex items-center gap-2 mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                <a href="mailto:Juca.fabrics145890@Gmail.com" className="text-purple-600 dark:text-purple-400 hover:underline">Juca.fabrics145890@Gmail.com</a>
            </p>
        </div>
         <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Partnership Inquiries:</h4>
            <a href="mailto:partners@nexusos.com" className="text-purple-600 dark:text-purple-400 hover:underline">partners@{BRAND_CONFIG.appName.toLowerCase()}.com</a>
        </div>
    </StaticPage>
);

const PrivacyPolicyPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Privacy Policy" onBack={onBack}>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        <p>Your privacy is critically important to us. At {BRAND_CONFIG.appName}, we have a few fundamental principles that put you in control of your data:</p>
        <ul>
            <li><strong>Offline-First Data Storage:</strong> {BRAND_CONFIG.appName} is designed as an offline-first application. This means that all the data you input—including financial records, employee information, company data, and generated content—is stored directly and exclusively on your local device's browser storage (localStorage). This architecture provides an enterprise-grade security model where your data is isolated on your machine.</li>
            <li><strong>No Data Transmission to Our Servers:</strong> Your information is never transmitted to us or any third party. We do not have servers that collect, store, or process your personal or business data. You have complete control and custody.</li>
            <li><strong>Developer and Third-Party Access:</strong> Because all data resides on your device, it is impossible for {BRAND_CONFIG.appName} developers or any third party to access, view, or copy your information. You have sole custody of your data from end to end.</li>
            <li><strong>AI API Usage:</strong> The only external communication the app performs is with the Google Gemini API for AI-powered features. These requests send only the specific prompts you enter for content generation and do not include any other personal or business data stored within the application. All AI interactions are protected by Google's robust security measures.</li>
            <li><strong>Permanent Data Deletion:</strong> You can clear all your application data at any time by clearing your browser's cache and site data for this application. Since we do not store your data, this action is permanent and irreversible from our end.</li>
        </ul>
        <p>By using {BRAND_CONFIG.appName}, you agree to this privacy policy. If you have any questions, please contact us.</p>
    </StaticPage>
);

const TermsPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Terms of Service" onBack={onBack}>
        <p>Please read these Terms of Service carefully before using the {BRAND_CONFIG.appName} application.</p>
        <h4>1. Acceptance of Terms</h4>
        <p>By accessing or using our application, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the application.</p>
        <h4>2. User Accounts</h4>
        <p>You are responsible for safeguarding the password and Security PIN that you use to access the application and for any activities or actions under your password. As {BRAND_CONFIG.appName} is an offline-first application, we have no access to your account or data and cannot assist with password recovery.</p>
        <h4>3. Content and Data Ownership</h4>
        <p>All data you create or input into {BRAND_CONFIG.appName} is stored locally on your device. You own your data. We claim no intellectual property rights over the material you provide to the application. Your profile and materials uploaded remain yours.</p>
         <h4>4. AI-Generated Content</h4>
        <p>The AI features are designed to produce unique and original content. However, you are responsible for ensuring that any AI-generated content (logos, thumbnails, banners, text) does not infringe on existing copyrights or trademarks. We provide tools to help you check for uniqueness, but ultimate liability rests with you, the user.</p>
        <h4>5. Termination</h4>
        <p>We may terminate or suspend access to our application immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All data will remain on your device unless you clear your browser's site data.</p>
        <h4>6. Disclaimer of Warranties</h4>
        <p>The application is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the application will be uninterrupted, error-free, or completely secure. We aim for a high standard of quality and reliability, but cannot guarantee perfection.</p>
    </StaticPage>
);

const FAQPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Frequently Asked Questions" onBack={onBack}>
        <h4>Is my data secure?</h4>
        <p>Absolutely. {BRAND_CONFIG.appName} is an "offline-first" application, which means all your sensitive business and personal data is stored securely and privately on your local device. It is never transmitted to our servers or any third party. Our architecture acts as a 'Client-Side Firewall,' isolating your information and providing an enterprise-grade security model. We, the developers, have zero access to your data.</p>
        
        <h4>How reliable is the application?</h4>
        <p>{BRAND_CONFIG.appName} is engineered for stability and a smooth user experience. Our development process includes rigorous testing to minimize errors and ensure the platform is reliable for your critical business operations. We are committed to providing a high-quality, dependable tool.</p>
        
        <h4>Will the app be slow or lag?</h4>
        <p>The application is highly optimized for performance. By leveraging local, on-device storage and efficient, modern code, {BRAND_CONFIG.appName} provides a fast and responsive experience, free from the typical lag associated with web-based applications that rely on constant server communication.</p>
        
        <h4>How do the AI features work with my data?</h4>
        <p>Our AI features, powered by the Google Gemini API, only use the specific text or prompts you enter for a given task (e.g., a description for a logo). None of your other business or personal data stored in the app is ever sent to the API. All interactions with the AI are protected by Google's security.</p>
        
        <h4>How do I get support if I have an issue?</h4>
        <p>For detailed assistance, you can reach our support team via the "Contact Us" page, which includes developer contact information.</p>
    </StaticPage>
);


const AccountSelection: React.FC<{ onSelect: (type: AccountType, action: 'register' | 'login') => void; onNavigate: (state: AppState) => void }> = ({ onSelect, onNavigate }) => {
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                The All-in-One Platform for Your Ambition. Welcome to <span className="text-purple-600 dark:text-purple-500">{BRAND_CONFIG.appName}</span>.
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12">
                From AI-powered creative tools for freelancers to a complete operational hub for established companies, {BRAND_CONFIG.appName} connects your business together. First, let's determine the best setup for your needs. This platform is built for stability, security, and performance, ensuring a seamless experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                    <div className="flex-grow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Account</h2>
                        <p className="text-gray-600 dark:text-gray-400">Perfect for creators, freelancers, and early-stage startups.</p>
                    </div>
                     <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button onClick={() => onSelect('personal', 'register')} disabled={!agreedToTerms} className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Create Account</button>
                        <button onClick={() => onSelect('personal', 'login')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Sign In</button>
                    </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                    <div className="flex-grow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Company Account</h2>
                        <p className="text-gray-600 dark:text-gray-400">For established businesses needing advanced management tools.</p>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button onClick={() => onSelect('enterprise', 'register')} disabled={!agreedToTerms} className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Register Company</button>
                        <button onClick={() => onSelect('enterprise', 'login')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Sign In</button>
                    </div>
                </div>
            </div>
            <div className="mt-10">
                <label className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="h-4 w-4 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 rounded flex-shrink-0" />
                    <span className="ml-2">I have read and agree to the 
                        <button type="button" onClick={() => onNavigate('terms')} className="text-purple-600 dark:text-purple-400 hover:underline mx-1">Terms of Service</button> 
                        and 
                        <button type="button" onClick={() => onNavigate('privacy')} className="text-purple-600 dark:text-purple-400 hover:underline ml-1">Privacy Policy</button>.
                    </span>
                </label>
            </div>
        </div>
    </div>
)};

const PersonalLogin: React.FC<{ onLoginSuccess: () => void; onBack: () => void; onSignUp: () => void; }> = ({ onLoginSuccess, onBack, onSignUp }) => {
    const [loginStep, setLoginStep] = useState<'password' | 'pin'>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);

    useEffect(() => {
        let timer: number;
        if (cooldownTime > 0) {
            timer = window.setInterval(() => {
                setCooldownTime(prev => prev - 1);
            }, 1000);
        }
        return () => window.clearInterval(timer);
    }, [cooldownTime]);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cooldownTime > 0 || isLoading) return;
        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
            try {
                const storedDetailsRaw = localStorage.getItem('userDetails');
                if (storedDetailsRaw) {
                    const storedDetails = JSON.parse(storedDetailsRaw);
                    if (storedDetails.email === email && storedDetails.password === password) {
                        setLoginStep('pin');
                    } else {
                        setError('Invalid email or password.');
                        setCooldownTime(10);
                    }
                } else {
                    setError('No personal account found. Please sign up.');
                }
            } catch (e) {
                setError('An error occurred. Please try again.');
                console.error(e);
            }
            setIsLoading(false);
        }, 500);
    };
    
    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            try {
                const storedDetailsRaw = localStorage.getItem('userDetails');
                const storedDetails = JSON.parse(storedDetailsRaw!);
                if (storedDetails.pin === pin) {
                    onLoginSuccess();
                } else {
                    setError('Invalid Security PIN.');
                    setLoginStep('password');
                    setCooldownTime(10);
                }
            } catch (e) {
                setError('An error occurred. Please try again.');
            }
            setIsLoading(false);
        }, 500);
    };

    const handleSocialLogin = (provider: 'google' | 'apple') => {
        if (isLoading || cooldownTime > 0) return;
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            const mockEmail = provider === 'google' ? 'user@google.com' : 'user@apple.com';
            const mockName = provider === 'google' ? 'Google User' : 'Apple User';
            const userDetails = {
                name: mockName,
                email: mockEmail,
                password: `social_mock_${Date.now()}`,
                pin: '1234', // Mock PIN for social login
                skills: 'Social Login',
                profilePicture: '',
            };
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            localStorage.setItem('accountType', 'personal');
            onLoginSuccess();
            setIsLoading(false);
        }, 500);
    };
    
    const handleForgotPassword = () => {
        alert(`Password Reset\n\nBecause ${BRAND_CONFIG.appName} is an offline-first application that stores all data on your device, we cannot reset your password. This is a security measure to protect your data. Please try to remember your password or create a new account.`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10 animate-fade-in shadow-2xl shadow-purple-500/10 relative">
                <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {loginStep === 'password' ? 'Sign in to your personal account.' : 'Enter your Security PIN.'}
                    </p>
                </div>

                {loginStep === 'password' ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
                            <input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={formInputClasses} placeholder="you@example.com" disabled={isLoading || cooldownTime > 0} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Password</label>
                                <button type="button" onClick={handleForgotPassword} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Forgot Password?</button>
                            </div>
                            <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className={formInputClasses} placeholder="••••••••" disabled={isLoading || cooldownTime > 0} />
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center pt-2">{error}</p>}
                        {cooldownTime > 0 && <p className="text-yellow-500 dark:text-yellow-400 text-sm text-center pt-2">Please try again in {cooldownTime} seconds.</p>}
                        <button type="submit" disabled={isLoading || cooldownTime > 0} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 !mt-8 shadow-lg shadow-purple-500/20 flex items-center justify-center h-12">
                           {isLoading ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : 'Continue'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">4-Digit PIN</label>
                            <input id="pin" name="pin" type="password" required value={pin} onChange={e => setPin(e.target.value)} maxLength={4} pattern="\d{4}" className={`${formInputClasses} text-center tracking-[1em]`} placeholder="••••" disabled={isLoading} />
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center pt-2">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 !mt-8 shadow-lg shadow-purple-500/20 flex items-center justify-center h-12">
                           {isLoading ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : 'Sign In'}
                        </button>
                    </form>
                )}

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/80 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading || cooldownTime > 0}
                        className="w-full flex items-center justify-center gap-3 rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200 disabled:opacity-50 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.582-3.333-11.227-7.818l-6.573 4.819C9.656 40.663 16.318 44 24 44z"></path>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.24 44 30.022 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('apple')}
                        disabled={isLoading || cooldownTime > 0}
                        className="w-full flex items-center justify-center gap-3 rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200 disabled:opacity-50 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 16 16">
                           <path d="M8.28,2.23C7.42,2.23,6.3,2.7,5.55,3.45C4,4.9,3.82,7.18,5.2,8.58C5.75,9.15,6.6,9.5,7.5,9.5c0.1,0,0.18,0,0.28-0.02 c-0.02,0.25-0.04,0.5-0.04,0.75c0,2.25,1.83,4.08,4.08,4.08c0.08,0,0.18-0.01,0.28-0.02c0.5,0.58,1.12,0.88,1.8,0.88 c0.7,0,1.35-0.35,1.78-0.9c-1.38,0.82-3.08,0.68-4.28-0.4C10.7,12.5,10.18,10.82,10.5,9.28c0.12-0.52,0.35-1,0.65-1.45 C10.42,6.4,9.98,4.5,8.28,2.23z"></path><path d="M10.5,5.12c0.22-0.7,0.18-1.48-0.15-2.12c-0.3-0.6-0.78-1.1-1.4-1.42C8.8,1.52,8.65,1.45,8.5,1.4 C8,1.25,7.5,1.28,7,1.48C5.7,2.02,4.6,3.4,4.6,5c0,1.38,0.85,2.62,2,3.2C7.15,8.48,7.7,8.6,8.3,8.6 c0.3,0,0.58-0.05,0.85-0.12C10,8.12,10.42,6.72,10.5,5.12z"></path>
                        </svg>
                        Apple
                    </button>
                </div>

                 <button onClick={onSignUp} className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold mt-6 transition-colors w-full text-center">
                    Don't have an account? Sign Up
                </button>
            </div>
        </div>
    );
};

const CompanyLogin: React.FC<{ onLoginSuccess: () => void; onBack: () => void; }> = ({ onLoginSuccess, onBack }) => {
    const [loginStep, setLoginStep] = useState<'password' | 'pin'>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);

    const companyName = (() => {
        try {
            const detailsRaw = localStorage.getItem('companyDetails');
            if (detailsRaw) {
                return JSON.parse(detailsRaw).businessName || 'your company';
            }
        } catch (e) { console.error(e) }
        return 'your company';
    })();
    
    useEffect(() => {
        let timer: number;
        if (cooldownTime > 0) {
            timer = window.setInterval(() => {
                setCooldownTime(prev => prev - 1);
            }, 1000);
        }
        return () => window.clearInterval(timer);
    }, [cooldownTime]);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cooldownTime > 0 || isLoading) return;
        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
            try {
                const storedDetailsRaw = localStorage.getItem('companyDetails');
                if (storedDetailsRaw) {
                    const storedDetails = JSON.parse(storedDetailsRaw);
                    if (storedDetails.email === email && storedDetails.password === password) {
                         setLoginStep('pin');
                    } else {
                        setError('Invalid email or password.');
                        setCooldownTime(10);
                    }
                } else {
                    setError('No company account found. Please register.');
                }
            } catch (e) {
                setError('An error occurred. Please try again.');
                console.error(e);
            }
            setIsLoading(false);
        }, 500);
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            try {
                const storedDetailsRaw = localStorage.getItem('companyDetails');
                const storedDetails = JSON.parse(storedDetailsRaw!);
                if (storedDetails.pin === pin) {
                    onLoginSuccess();
                } else {
                    setError('Invalid Security PIN.');
                    setLoginStep('password');
                    setCooldownTime(10);
                }
            } catch (e) {
                setError('An error occurred. Please try again.');
            }
            setIsLoading(false);
        }, 500);
    };
    
    const handleForgotPassword = () => {
        alert(`Password Reset\n\nBecause ${BRAND_CONFIG.appName} is an offline-first application that stores all data on your device, we cannot reset your password. This is a security measure to protect your data. Please try to remember your password or register a new company account.`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10 animate-fade-in shadow-2xl shadow-purple-500/10 relative">
                <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                     <p className="text-gray-600 dark:text-gray-400">
                        {loginStep === 'password' ? `Sign in to access the ${companyName} dashboard.` : 'Enter your Company Security PIN.'}
                    </p>
                </div>
                {loginStep === 'password' ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Company Email</label>
                            <input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={formInputClasses} placeholder="you@company.com" disabled={isLoading || cooldownTime > 0} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Password</label>
                                <button type="button" onClick={handleForgotPassword} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Forgot Password?</button>
                            </div>
                            <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className={formInputClasses} placeholder="••••••••" disabled={isLoading || cooldownTime > 0} />
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center pt-2">{error}</p>}
                        {cooldownTime > 0 && <p className="text-yellow-500 dark:text-yellow-400 text-sm text-center pt-2">Please try again in {cooldownTime} seconds.</p>}
                        <button type="submit" disabled={isLoading || cooldownTime > 0} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 !mt-8 shadow-lg shadow-purple-500/20 flex items-center justify-center h-12">
                           {isLoading ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : 'Continue'}
                        </button>
                    </form>
                ) : (
                     <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">4-Digit PIN</label>
                            <input id="pin" name="pin" type="password" required value={pin} onChange={e => setPin(e.target.value)} maxLength={4} pattern="\d{4}" className={`${formInputClasses} text-center tracking-[1em]`} placeholder="••••" disabled={isLoading} />
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center pt-2">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 !mt-8 shadow-lg shadow-purple-500/20 flex items-center justify-center h-12">
                           {isLoading ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : 'Sign In'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const PageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState | null>(null);
    const [previousAppState, setPreviousAppState] = useState<AppState | null>(null);

    useEffect(() => {
        const isSubscribed = !!localStorage.getItem('isSubscribed');
        if (isSubscribed) {
            setAppState('dashboard');
        } else {
            const hasPersonal = !!localStorage.getItem('userDetails');
            const hasCompany = !!localStorage.getItem('companyDetails');
            const accountType = localStorage.getItem('accountType');
            // If user has details but is not subscribed, send to onboarding/subscription page.
            if ((accountType === 'personal' && hasPersonal) || (accountType === 'enterprise' && hasCompany)) {
                setAppState('onboarding');
            } else {
                setAppState('account_selection');
            }
        }
    }, []);

    const handleSignOut = () => {
        if (window.confirm("Are you sure you want to sign out? This will clear all account data from this device. This action cannot be undone.")) {
            localStorage.clear();
            setAppState('account_selection');
        }
    };

    const handleChangePlan = () => {
        localStorage.removeItem('isSubscribed');
        localStorage.removeItem('subscriptionPlan');
        setAppState('onboarding');
    };
    
    const handleAccountSelect = (type: AccountType, action: 'register' | 'login') => {
        localStorage.setItem('accountType', type);
        if (action === 'register') {
            setAppState('onboarding');
        } else {
            setAppState(type === 'personal' ? 'personal_login' : 'company_login');
        }
    };
    
    const handleLoginSuccess = () => {
        const isSubscribed = !!localStorage.getItem('isSubscribed');
        setAppState(isSubscribed ? 'dashboard' : 'onboarding');
    };
    
    const handleOnboardingComplete = (plan: string) => {
        localStorage.setItem('isSubscribed', 'true');
        localStorage.setItem('subscriptionPlan', plan);
        setAppState('dashboard');
    };

    const handleNavigate = (newState: AppState) => {
        setPreviousAppState(appState);
        setAppState(newState);
    }
    
    const handleBack = () => {
        if(previousAppState && previousAppState !== appState) {
            setAppState(previousAppState);
            setPreviousAppState(null); // Reset for next navigation
        } else {
            // Default back logic
            if (appState === 'onboarding' || appState === 'personal_login' || appState === 'company_login') {
                 // Clear account type so user is forced to re-select
                localStorage.removeItem('accountType');
                setAppState('account_selection');
            } else {
                const isSubscribed = !!localStorage.getItem('isSubscribed');
                setAppState(isSubscribed ? 'dashboard' : 'account_selection');
            }
        }
    };
    
    if (appState === null) {
        return <PageLoader />;
    }
    
    const renderContent = () => {
        switch (appState) {
            case 'account_selection':
                return (
                    <>
                        <div className="absolute top-4 right-4 z-10"><ThemeToggleButton /></div>
                        <AccountSelection onSelect={handleAccountSelect} onNavigate={handleNavigate} />
                        <Footer onNavigate={handleNavigate} />
                    </>
                );
            case 'onboarding':
                const cameFromLogin = !!localStorage.getItem('userDetails') || !!localStorage.getItem('companyDetails');
                return <Onboarding onComplete={handleOnboardingComplete} onBack={handleBack} cameFromLogin={cameFromLogin} onNavigate={handleNavigate} />;
            case 'personal_login':
                 return <PersonalLogin onLoginSuccess={handleLoginSuccess} onBack={handleBack} onSignUp={() => { localStorage.setItem('accountType', 'personal'); setAppState('onboarding') }} />;
            case 'company_login':
                return <CompanyLogin onLoginSuccess={handleLoginSuccess} onBack={handleBack} />;
            case 'dashboard':
                 const userDetailsRaw = localStorage.getItem('userDetails');
                 const companyDetailsRaw = localStorage.getItem('companyDetails');
                return <Dashboard 
                    onSignOut={handleSignOut}
                    onChangePlan={handleChangePlan}
                    userDetails={userDetailsRaw ? JSON.parse(userDetailsRaw) : null}
                    companyDetails={companyDetailsRaw ? JSON.parse(companyDetailsRaw) : null}
                />;
            case 'about': return <AboutPage onBack={handleBack} />;
            case 'contact': return <ContactPage onBack={handleBack} />;
            case 'privacy': return <PrivacyPolicyPage onBack={handleBack} />;
            case 'terms': return <TermsPage onBack={handleBack} />;
            case 'faq': return <FAQPage onBack={handleBack} />;
            default:
                return <div>Invalid state</div>;
        }
    };
    
    return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-300">
            {renderContent()}
        </div>
    );
};

export default App;