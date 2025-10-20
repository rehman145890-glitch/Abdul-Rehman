import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ThemeToggleButton from './components/ThemeToggleButton';

export type AppState = 'account_selection' | 'onboarding' | 'personal_login' | 'company_login' | 'dashboard' | 'about' | 'contact' | 'privacy' | 'terms' | 'faq';
export type AccountType = 'personal' | 'enterprise';

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
        <p className="mt-2">© {new Date().getFullYear()} Keystone Inc. All rights reserved.</p>
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
    <StaticPage title="About Keystone" onBack={onBack}>
        <p>Keystone was founded on a simple principle: businesses, regardless of their size, deserve powerful, intuitive, and accessible tools to manage their operations. In a world of fragmented software solutions, Keystone emerges as the central, indispensable element—the keystone—that locks every facet of your business together.</p>
        <p>Our platform provides an all-in-one hub for everything from AI-powered content creation for your marketing needs to detailed financial tracking, human resources management, and inventory control. We believe that by unifying these critical functions, we empower entrepreneurs, creators, and business leaders to focus on what they do best: innovating and growing.</p>
        <p>Built with a commitment to security and user privacy, Keystone operates on an offline-first model. All your sensitive business data is stored locally on your device, ensuring you have absolute control and ownership. Welcome to a smarter way to run your business.</p>
    </StaticPage>
);

const ContactPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Contact Us" onBack={onBack}>
        <p>We're here to help and answer any question you might have. We look forward to hearing from you!</p>
        <p>For general inquiries, support, or feedback, please reach out to us via email. Our team will get back to you as soon as possible.</p>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">General Support:</h4>
            <a href="mailto:support@keystone.com" className="text-purple-600 dark:text-purple-400 hover:underline">support@keystone.com</a>
        </div>
         <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Partnership Inquiries:</h4>
            <a href="mailto:partners@keystone.com" className="text-purple-600 dark:text-purple-400 hover:underline">partners@keystone.com</a>
        </div>
    </StaticPage>
);

const PrivacyPolicyPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Privacy Policy" onBack={onBack}>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        <p>Your privacy is critically important to us. At Keystone, we have a few fundamental principles that put you in control of your data:</p>
        <ul>
            <li><strong>Offline-First Data Storage:</strong> Keystone is designed as an offline-first application. This means that all the data you input—including financial records, employee information, company data, and generated content—is stored directly and exclusively on your local device's browser storage (localStorage).</li>
            <li><strong>No Data Transmission to Our Servers:</strong> Your information is never transmitted to us or any third party. We do not have servers that collect, store, or process your personal or business data. You have complete control and custody.</li>
            <li><strong>Developer and Third-Party Access:</strong> Because all data resides on your device, it is impossible for Keystone developers or any third party to access, view, or copy your information. You have sole custody of your data from end to end.</li>
            <li><strong>API Usage for AI Features:</strong> The only external communication the app performs is with the Google Gemini API for AI-powered features. These requests send only the specific prompts you enter for content generation and do not include any other personal or business data stored within the application.</li>
            <li><strong>Permanent Data Deletion:</strong> You can clear all your application data at any time by clearing your browser's cache and site data for this application. Since we do not store your data, this action is permanent and irreversible from our end.</li>
        </ul>
        <p>By using Keystone, you agree to this privacy policy. If you have any questions, please contact us.</p>
    </StaticPage>
);

const TermsPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Terms of Service" onBack={onBack}>
        <p>Please read these Terms of Service carefully before using the Keystone application.</p>
        <h4>1. Acceptance of Terms</h4>
        <p>By accessing or using our application, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the application.</p>
        <h4>2. User Accounts</h4>
        <p>You are responsible for safeguarding the password that you use to access the application and for any activities or actions under your password. As Keystone is an offline-first application, we have no access to your account or data and cannot assist with password recovery.</p>
        <h4>3. Content and Data Ownership</h4>
        <p>All data you create or input into Keystone is stored locally on your device. You own your data. We claim no intellectual property rights over the material you provide to the application. Your profile and materials uploaded remain yours.</p>
        <h4>4. Termination</h4>
        <p>We may terminate or suspend access to our application immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All data will remain on your device unless you clear your browser's site data.</p>
        <h4>5. Disclaimer of Warranties</h4>
        <p>The application is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the application will be uninterrupted, error-free, or completely secure. We aim for a high standard of quality and reliability, but cannot guarantee perfection.</p>
    </StaticPage>
);

const FAQPage: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <StaticPage title="Frequently Asked Questions" onBack={onBack}>
        <h4>Is my data secure?</h4>
        <p>Absolutely. Keystone is an "offline-first" application, which means all your sensitive business and personal data is stored securely and privately on your local device. It is never transmitted to our servers or any third party. Our 'offline-first' architecture means your data is end-to-end protected directly on your computer. We, the developers, have zero access to it. Your company's information remains completely private to you.</p>
        
        <h4>How reliable is the application?</h4>
        <p>Keystone is engineered for stability and a smooth user experience. Our development process includes rigorous testing to minimize errors and ensure the platform is reliable for your critical business operations. We are committed to providing a high-quality, dependable tool.</p>
        
        <h4>Will the app be slow or lag?</h4>
        <p>The application is highly optimized for performance. By leveraging local, on-device storage and efficient, modern code, Keystone provides a fast and responsive experience, free from the typical lag associated with web-based applications that rely on constant server communication.</p>
        
        <h4>How do the AI features work with my data?</h4>
        <p>Our AI features, powered by the Google Gemini API, only use the specific text or prompts you enter for a given task (e.g., a description for a logo). None of your other business or personal data stored in the app is ever sent to the API.</p>
        
        <h4>How do I get support if I have an issue?</h4>
        <p>You can use our AI Help Desk (the question mark icon in the dashboard) for instant answers to common questions. For more detailed assistance, you can reach our support team via the "Contact Us" page.</p>
    </StaticPage>
);


const AccountSelection: React.FC<{ onSelect: (type: AccountType, action: 'register' | 'login') => void; }> = ({ onSelect }) => (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                The All-in-One Platform for Your Ambition. Welcome to <span className="text-purple-600 dark:text-purple-500">Keystone</span>.
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12">
                From AI-powered creative tools for freelancers to a complete operational hub for established companies, Keystone locks your business together. First, let's determine the best setup for your needs. This platform is built for stability, security, and performance, ensuring a seamless experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                    <div className="flex-grow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Account</h2>
                        <p className="text-gray-600 dark:text-gray-400">Perfect for creators, freelancers, and early-stage startups.</p>
                    </div>
                     <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button onClick={() => onSelect('personal', 'register')} className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors">Create Account</button>
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
                        <button onClick={() => onSelect('enterprise', 'register')} className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors">Register Company</button>
                        <button onClick={() => onSelect('enterprise', 'login')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Sign In</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PersonalLogin: React.FC<{ onLoginSuccess: () => void; onBack: () => void; onSignUp: () => void; }> = ({ onLoginSuccess, onBack, onSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cooldownTime > 0) return;
        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
            try {
                const storedDetailsRaw = localStorage.getItem('userDetails');
                if (storedDetailsRaw) {
                    const storedDetails = JSON.parse(storedDetailsRaw);
                    if (storedDetails.email === email && storedDetails.password === password) {
                        onLoginSuccess();
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
    
    const handleForgotPassword = () => {
        alert("Password Reset\n\nBecause Keystone is an offline-first application that stores all data on your device, we cannot reset your password. This is a security measure to protect your data. Please try to remember your password or create a new account.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10 animate-fade-in shadow-2xl shadow-purple-500/10 relative">
                <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-600 dark:text-gray-400">Sign in to your personal account.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        ) : 'Sign In'}
                    </button>
                </form>
                 <button onClick={onSignUp} className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold mt-6 transition-colors w-full text-center">
                    Don't have an account? Sign Up
                </button>
            </div>
        </div>
    );
};

const CompanyLogin: React.FC<{ onLoginSuccess: () => void; onBack: () => void; }> = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cooldownTime > 0) return;
        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
            try {
                const storedDetailsRaw = localStorage.getItem('companyDetails');
                if (storedDetailsRaw) {
                    const storedDetails = JSON.parse(storedDetailsRaw);
                    if (storedDetails.email === email && storedDetails.password === password) {
                        onLoginSuccess();
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
    
    const handleForgotPassword = () => {
        alert("Password Reset\n\nBecause Keystone is an offline-first application that stores all data on your device, we cannot reset your password. This is a security measure to protect your data. Please try to remember your password or register a new company account.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10 animate-fade-in shadow-2xl shadow-purple-500/10 relative">
                <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-600 dark:text-gray-400">Sign in to access the {companyName} dashboard.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const getInitialState = (): AppState => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const accountType = localStorage.getItem('accountType') as AccountType;

        if (isLoggedIn) return 'dashboard';
        
        if (accountType === 'enterprise') {
            const hasCompanyDetails = !!localStorage.getItem('companyDetails');
            return hasCompanyDetails ? 'company_login' : 'account_selection';
        }
        if (accountType === 'personal') {
            const hasUserDetails = !!localStorage.getItem('userDetails');
            return hasUserDetails ? 'personal_login' : 'account_selection';
        }

        return 'account_selection';
    };
    
  const [appState, setAppState] = useState<AppState>(getInitialState);
  const [prevState, setPrevState] = useState<AppState | null>(null);

  const [companyDetails, setCompanyDetails] = useState<any>(() => {
    const detailsRaw = localStorage.getItem('companyDetails');
    if (detailsRaw) {
      try { return JSON.parse(detailsRaw); } catch { return null; }
    }
    return null;
  });

  const [userDetails, setUserDetails] = useState<any>(() => {
    const detailsRaw = localStorage.getItem('userDetails');
    if (detailsRaw) {
        try { return JSON.parse(detailsRaw); } catch { return null; }
    }
    return null;
  });
  
  const changeAppState = (newState: AppState) => {
    setPrevState(appState);
    setAppState(newState);
  };

  useEffect(() => {
      const handleDetailsChange = () => {
          const companyDetailsRaw = localStorage.getItem('companyDetails');
          const userDetailsRaw = localStorage.getItem('userDetails');
          try {
              setCompanyDetails(companyDetailsRaw ? JSON.parse(companyDetailsRaw) : null);
              setUserDetails(userDetailsRaw ? JSON.parse(userDetailsRaw) : null);
          } catch {
              setCompanyDetails(null);
              setUserDetails(null);
          }
      };
      window.addEventListener('companyDetailsChanged', handleDetailsChange);
      return () => window.removeEventListener('companyDetailsChanged', handleDetailsChange);
  }, []);

  const handleAccountSelect = (type: AccountType, action: 'register' | 'login') => {
    localStorage.setItem('accountType', type);
    if (action === 'register') {
        changeAppState('onboarding');
    } else {
        changeAppState(type === 'personal' ? 'personal_login' : 'company_login');
    }
  };

  const handleSubscriptionComplete = (plan: string) => {
    localStorage.setItem('isSubscribed', 'true');
    localStorage.setItem('subscriptionPlan', plan);
    localStorage.setItem('isLoggedIn', 'true');
    changeAppState('dashboard');
  };

  const handleEnterpriseRegister = () => {
    const detailsRaw = localStorage.getItem('companyDetails');
    if (detailsRaw) {
      try { setCompanyDetails(JSON.parse(detailsRaw)); } catch {}
    }
    changeAppState('company_login');
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    const isSubscribed = !!localStorage.getItem('isSubscribed');

    if (isSubscribed) {
        changeAppState('dashboard');
    } else {
        changeAppState('onboarding');
    }
  };
  
  const handleSignOut = () => {
    const accountType = localStorage.getItem('accountType');
    localStorage.removeItem('isLoggedIn');
    if (accountType === 'enterprise') {
        changeAppState('company_login');
    } else if (accountType === 'personal') {
        changeAppState('personal_login');
    } else {
        localStorage.clear();
        setCompanyDetails(null);
        setUserDetails(null);
        changeAppState('account_selection');
    }
  };

  const handleOnboardingBack = () => {
    if (prevState === 'company_login' || prevState === 'personal_login') {
        localStorage.removeItem('isLoggedIn');
        changeAppState(prevState);
    } else {
        changeAppState('account_selection');
    }
  };
  
  const handleStaticPageBack = () => {
      changeAppState(prevState || 'account_selection');
  };

  const renderContent = () => {
    switch (appState) {
        case 'account_selection':
            return (
                <div className="relative min-h-screen">
                    <div className="absolute top-4 right-4 z-10">
                        <ThemeToggleButton />
                    </div>
                    <AccountSelection onSelect={handleAccountSelect} />
                    <Footer onNavigate={changeAppState} />
                </div>
            );
        case 'onboarding':
            return (
                <div className="relative min-h-screen">
                    <div className="absolute top-4 right-4 z-10">
                        <ThemeToggleButton />
                    </div>
                    <Onboarding onComplete={handleSubscriptionComplete} onEnterpriseRegister={handleEnterpriseRegister} onBack={handleOnboardingBack} cameFromLogin={prevState === 'company_login' || prevState === 'personal_login'} onNavigate={changeAppState} />
                    <Footer onNavigate={changeAppState} />
                </div>
            );
        case 'personal_login':
            return (
                <div className="relative min-h-screen">
                    <div className="absolute top-4 right-4 z-10">
                        <ThemeToggleButton />
                    </div>
                    <PersonalLogin onLoginSuccess={handleLoginSuccess} onBack={() => changeAppState('account_selection')} onSignUp={() => {localStorage.setItem('accountType', 'personal'); changeAppState('onboarding')}} />
                    <Footer onNavigate={changeAppState} />
                </div>
            );
        case 'company_login':
            return (
                <div className="relative min-h-screen">
                    <div className="absolute top-4 right-4 z-10">
                        <ThemeToggleButton />
                    </div>
                    <CompanyLogin onLoginSuccess={handleLoginSuccess} onBack={() => changeAppState('account_selection')} />
                    <Footer onNavigate={changeAppState} />
                </div>
            );
        case 'dashboard':
          return <Dashboard onSignOut={handleSignOut} companyDetails={companyDetails} userDetails={userDetails} />;
        case 'about':
            return <AboutPage onBack={handleStaticPageBack} />;
        case 'contact':
            return <ContactPage onBack={handleStaticPageBack} />;
        case 'privacy':
            return <PrivacyPolicyPage onBack={handleStaticPageBack} />;
        case 'terms':
            return <TermsPage onBack={handleStaticPageBack} />;
        case 'faq':
            return <FAQPage onBack={handleStaticPageBack} />;
        default:
          return (
            <div className="relative min-h-screen">
                <div className="absolute top-4 right-4 z-10">
                    <ThemeToggleButton />
                </div>
                <AccountSelection onSelect={handleAccountSelect}/>
                <Footer onNavigate={changeAppState} />
            </div>
          );
    }
  };
  
  return <>{renderContent()}</>;
};

export default App;