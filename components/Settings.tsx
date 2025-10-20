import React, { useState, useEffect } from 'react';

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