import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface SettingsProps {
    onChangePlan: () => void;
    onSignOut: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onChangePlan, onSignOut }) => {
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
        if (window.confirm('Are you sure you want to cancel your subscription? This action will take you to the plan selection screen. Your data will be saved.')) {
            onChangePlan();
        }
    };
    
    const handleExportData = () => {
        const data: { [key: string]: any } = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key)!);
                } catch (e) {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexusos_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteData = () => {
        const confirmation = prompt('This will permanently delete all your data from this browser. This action cannot be undone. To confirm, please type "DELETE" below:');
        if (confirmation === 'DELETE') {
            onSignOut(); // This already calls localStorage.clear()
        }
    };


    return (
        <div className="w-full h-full flex flex-col p-1 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Settings
                </h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Manage your account, data, and subscription details.</p>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Security & Privacy</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This application is built on enterprise-grade security principles similar to platforms like Microsoft Azure, ensuring your data remains private and protected.</p>
                     <div className="space-y-4">
                        <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM10 6a1 1 0 011 1v3l-2 2a1 1 0 01-1.414-1.414L9 8.586V7a1 1 0 011-1z" clipRule="evenodd" /></svg>
                             <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Client-Side Firewall</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">All your data is processed and stored locally in your browser. It is never sent to our servers, creating a natural firewall that isolates your information on your device.</p>
                             </div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">On-Device Data Encryption</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Your data is secured by your password and PIN directly on your device. We have no way to access or recover your account, ensuring end-to-end privacy.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Security Best Practices</h3>
                     <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-3"><span className="text-purple-500 mt-1">✓</span><span>Use a strong, unique password and a memorable but non-obvious 4-digit PIN.</span></li>
                        <li className="flex items-start gap-3"><span className="text-purple-500 mt-1">✓</span><span>Since all data is stored on your device, ensure your computer or mobile phone is password-protected.</span></li>
                        <li className="flex items-start gap-3"><span className="text-purple-500 mt-1">✓</span><span>Regularly use the "Export All Data" feature to create secure backups of your information.</span></li>
                    </ul>
                </div>

                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Export a backup of your data or delete it permanently.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleExportData} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Export All Data
                        </button>
                        <button onClick={handleDeleteData} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            Delete All Data
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Subscription</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
                            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{plan || 'Not Subscribed'}</p>
                        </div>
                         <button
                            onClick={handleCancelClick}
                            className="bg-red-600/10 hover:bg-red-600/20 text-red-700 dark:text-red-300 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                         >
                            Cancel Plan
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;