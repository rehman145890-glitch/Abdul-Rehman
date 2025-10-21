import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface SettingsProps {
    onCancelSubscription: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onCancelSubscription }) => {
    const [plan, setPlan] = useState<string | null>(null);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const storedPlan = localStorage.getItem('subscriptionPlan');
        setPlan(storedPlan);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme as string);
    }, [theme]);

    const handleCancelClick = () => {
        if (window.confirm('Are you sure you want to cancel your subscription? This action will sign you out and you will need to choose a new plan to continue using the dashboard.')) {
            onCancelSubscription();
        }
    };
    
    const handleDownloadLogo = () => {
        const svgContent = `
<svg width="130" height="100" viewBox="0 0 130 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="background-color: white; padding: 10px; font-family: 'Inter', sans-serif;">
  <defs>
    <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color: #38A8A8" />
      <stop offset="100%" style="stop-color: #2A6F6F" />
    </linearGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color: #EAD49A" />
      <stop offset="100%" style="stop-color: #C7A25B" />
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="1" dy="1" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <g transform="translate(0, -10)">
    <path d="M30 80 C 10 80, 0 60, 15 40 C 25 20, 45 5, 65 5 C 85 5, 105 20, 115 40 C 130 60, 120 80, 100 80" stroke="white" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M30 80 C 10 80, 0 60, 15 40 C 25 20, 45 5, 65 5" stroke="url(#tealGradient)" stroke-width="10" fill="none" stroke-linecap="round" />
    <path d="M65 5 C 85 5, 105 20, 115 40 C 130 60, 120 80, 100 80" stroke="url(#goldGradient)" stroke-width="10" fill="none" stroke-linecap="round" />
    <line x1="30" y1="80" x2="30" y2="70" stroke="white" stroke-width="2.5"/>
    <line x1="100" y1="80" x2="100" y2="70" stroke="white" stroke-width="2.5"/>
    <line x1="15" y1="40" x2="22" y2="43" stroke="white" stroke-width="2.5"/>
    <line x1="115" y1="40" x2="108" y2="43" stroke="white" stroke-width="2.5"/>
    <g filter="url(#dropShadow)">
      <path d="M42 80 L 42 50 L 65 65 L 88 50 L 65 30 L 42 50 Z" fill="#1E2A4D" />
    </g>
  </g>
  
  <g transform="translate(0, 5)">
    <text x="65" y="80" text-anchor="middle" font-family="inherit" font-size="22" font-weight="900" fill="#1E2A4D">KEYSTONE</text>
    <text x="65" y="92" text-anchor="middle" font-family="inherit" font-size="8" font-weight="500" letter-spacing="0.3em" fill="#C7A25B">WEBSITE</text>
  </g>
</svg>
`;
        const blob = new Blob([svgContent.trim()], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'keystone-logo.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="w-full h-full flex flex-col p-1 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Settings
                </h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Manage your account and subscription details.</p>
            </header>

            <div className="w-full max-w-2xl space-y-6">
                 <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Appearance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select your preferred theme.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${theme === 'light' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Light</span>
                                {theme === 'light' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                            </div>
                            <div className="w-full h-16 bg-gray-100 border border-gray-200 rounded-md p-2 flex items-start gap-1">
                                <div className="w-1/3 h-full bg-white rounded-sm shadow-sm"></div>
                                <div className="w-2/3 h-full flex flex-col gap-1">
                                    <div className="h-1/3 bg-gray-200 rounded-sm"></div>
                                    <div className="h-1/3 bg-purple-200 rounded-sm"></div>
                                    <div className="h-1/3 bg-gray-200 rounded-sm"></div>
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${theme === 'dark' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Dark</span>
                                {theme === 'dark' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                            </div>
                            <div className="w-full h-16 bg-gray-950 border border-gray-700 rounded-md p-2 flex items-start gap-1">
                                <div className="w-1/3 h-full bg-gray-800 rounded-sm"></div>
                                <div className="w-2/3 h-full flex flex-col gap-1">
                                    <div className="h-1/3 bg-gray-700 rounded-sm"></div>
                                    <div className="h-1/3 bg-purple-900/50 rounded-sm"></div>
                                    <div className="h-1/3 bg-gray-700 rounded-sm"></div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
                
                 <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Brand Assets</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Download the official Keystone logo.</p>
                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="transform scale-75 origin-left">
                           <Logo />
                        </div>
                        <button
                            onClick={handleDownloadLogo}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download SVG
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Subscription Management</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
                            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{plan || 'Not Subscribed'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-500/10 dark:bg-red-900/20 p-6 rounded-xl border border-red-500/20 dark:border-red-500/30">
                     <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Cancel Subscription</h3>
                     <p className="text-red-600/80 dark:text-red-400/80 mb-4 text-sm">
                        Canceling your subscription will immediately sign you out. All your data will remain securely saved on your device for when you choose to subscribe again.
                     </p>
                     <button
                        onClick={handleCancelClick}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors"
                     >
                        Cancel Subscription
                     </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;