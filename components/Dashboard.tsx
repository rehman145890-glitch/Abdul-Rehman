import React, { useState, useCallback, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import Toast from './Toast';
import LaunchModal from './LaunchModal';
import UpgradeModal from './UpgradeModal';
import HelpDesk from './HelpDesk';

// Lazy load components for code-splitting and faster initial load
const ThumbnailStudio = lazy(() => import('./ThumbnailStudio'));
const CompanyManagement = lazy(() => import('./CompanyManagement'));
const LogoGenerator = lazy(() => import('./LogoGenerator'));
const StartupSuite = lazy(() => import('./StartupSuite'));
const Settings = lazy(() => import('./Settings'));


export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

interface DashboardProps {
  onSignOut: () => void;
  companyDetails?: {
      businessName?: string;
      logo?: string;
      [key: string]: any;
  } | null;
  userDetails?: {
      name?: string;
      profilePicture?: string;
      skills?: string;
      [key: string]: any;
  } | null;
}

type View = 'thumbnail' | 'management' | 'logo' | 'startup' | 'settings';
type Plan = 'Starter' | 'Pro' | 'Enterprise';

const PageLoader: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ onSignOut, companyDetails, userDetails }) => {
    const [activeView, setActiveView] = useState<View>();
    const [plan, setPlan] = useState<Plan | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [showLaunchModal, setShowLaunchModal] = useState(false);
    const [upgradeModalInfo, setUpgradeModalInfo] = useState<{ requiredPlan: Plan } | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const hasSeenModal = localStorage.getItem('hasSeenKeystoneLaunch');
        if (!hasSeenModal) {
            setShowLaunchModal(true);
        }
        
        const storedPlan = localStorage.getItem('subscriptionPlan') as Plan | null;
        setPlan(storedPlan);

        if (storedPlan === 'Enterprise') {
            setActiveView('management');
        } else if (storedPlan === 'Pro') {
            setActiveView('startup');
        } else {
            setActiveView('thumbnail');
        }
        
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, []);

    const features = useMemo(() => {
        const accountType = localStorage.getItem('accountType');
        return {
            management: plan === 'Enterprise' && accountType === 'enterprise',
            startup: (plan === 'Pro' || plan === 'Starter') && accountType === 'personal',
            thumbnail: (plan === 'Starter' || plan === 'Pro') && accountType === 'personal',
            logo: (plan === 'Starter' || plan === 'Pro') && accountType === 'personal',
            settings: true,
        };
    }, [plan]);

    const viewTitles: Record<View, string> = {
        thumbnail: 'Thumbnail Studio',
        management: 'Enterprise Hub',
        logo: 'Logo Generator',
        startup: 'Startup Suite',
        settings: 'Settings',
    };

    const handleNavClick = (view: View) => {
        const featureAccess: Record<View, boolean> = {
            thumbnail: features.thumbnail,
            management: features.management,
            logo: features.logo,
            startup: features.startup,
            settings: features.settings,
        };
        const requiredPlan: Record<View, Plan> = {
            thumbnail: 'Starter',
            management: 'Enterprise',
            logo: 'Starter', 
            startup: 'Starter',
            settings: 'Starter',
        };

        if (featureAccess[view]) {
            setActiveView(view);
            setIsSettingsOpen(false);
        } else {
            setUpgradeModalInfo({ requiredPlan: requiredPlan[view] });
        }
    };

    const handleCloseLaunchModal = () => {
        localStorage.setItem('hasSeenKeystoneLaunch', 'true');
        setShowLaunchModal(false);
    };

    const addToast = useCallback((message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const NavItem = ({ view, label, icon, isLocked, onClick }: { view?: View, label: string, icon: React.ReactNode, isLocked?: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-3 py-2.5 text-sm transition-all duration-200 rounded-lg group relative ${
                activeView === view && !isLocked
                    ? 'bg-purple-600/10 text-purple-500 dark:text-purple-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200'
            } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
        >
             {activeView === view && !isLocked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-full"></div>}
            <div className="w-6 h-6">{icon}</div>
            <span className="ml-4 font-semibold flex-grow text-left">{label}</span>
            {isLocked && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
        </button>
    );
    
    const renderActiveView = () => {
        switch(activeView) {
            case 'thumbnail': return features.thumbnail ? <ThumbnailStudio addToast={addToast} /> : null;
            case 'management': return features.management ? <CompanyManagement addToast={addToast} companyDetails={companyDetails} /> : null;
            case 'logo': return features.logo ? <LogoGenerator addToast={addToast} /> : null;
            case 'startup': return features.startup ? <StartupSuite addToast={addToast} /> : null;
            case 'settings': return features.settings ? <Settings onCancelSubscription={onSignOut} /> : null;
            default:
                if (features.management) return <CompanyManagement addToast={addToast} companyDetails={companyDetails} />;
                if (features.startup) return <StartupSuite addToast={addToast} />;
                if (features.thumbnail) return <ThumbnailStudio addToast={addToast} />;
                return <div className="w-full h-full flex items-center justify-center text-gray-500">Select a tool to get started.</div>;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-200 flex relative">
            {showLaunchModal && <LaunchModal onClose={handleCloseLaunchModal} />}
            {upgradeModalInfo && (
                <UpgradeModal 
                    currentPlan={plan || 'None'}
                    requiredPlan={upgradeModalInfo.requiredPlan}
                    onClose={() => setUpgradeModalInfo(null)}
                    onUpgrade={onSignOut}
                />
            )}
            <aside className="w-64 bg-white/80 dark:bg-black/30 p-4 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="mb-8 pt-2">
                     {companyDetails ? (
                        <div className="flex items-center gap-3">
                            {companyDetails.logo && <img src={companyDetails.logo} alt="Company Logo" className="h-10 w-10 rounded-lg object-contain bg-gray-200 dark:bg-gray-800 p-1 flex-shrink-0" />}
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">{companyDetails.businessName}</h1>
                        </div>
                    ) : userDetails ? (
                        <div className="flex flex-col items-center text-center gap-2">
                           {userDetails.profilePicture ? 
                                <img src={userDetails.profilePicture} alt="Profile" className="h-20 w-20 rounded-full object-cover border-2 border-purple-500/50" />
                                :
                                <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-purple-500/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                            }
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate w-full">{userDetails.name}</h1>
                            {userDetails.skills && (
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {userDetails.skills.split(',').map((skill:string, i:number) => skill.trim() && <span key={i} className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">{skill.trim()}</span>)}
                                </div>
                            )}
                        </div>
                    ) : (
                         <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white text-center">
                           <span className="text-purple-600 dark:text-purple-500">Key</span>stone
                        </h1>
                    )}
                </div>
                <nav className="flex flex-col space-y-2 flex-grow">
                     {features.startup && <NavItem 
                        view="startup" 
                        label="Startup Suite"
                        isLocked={!features.startup}
                        onClick={() => handleNavClick('startup')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    />}
                     {features.management && <NavItem 
                        view="management" 
                        label="Enterprise Hub"
                        isLocked={!features.management}
                        onClick={() => handleNavClick('management')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    />}
                    {features.thumbnail && <NavItem 
                        view="thumbnail" 
                        label="Thumbnail Studio" 
                        isLocked={!features.thumbnail}
                        onClick={() => handleNavClick('thumbnail')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    />}
                    {features.logo && <NavItem 
                        view="logo" 
                        label="Logo Generator"
                        isLocked={!features.logo}
                        onClick={() => handleNavClick('logo')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
                    />}
                </nav>
                 <div className="w-full mt-auto space-y-2">
                    <div className="flex items-center justify-center text-xs text-green-600/80 dark:text-green-500/80 pt-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                        <span>Data Secured & Stored Locally</span>
                    </div>
                     <p className="text-center text-xs text-gray-500 dark:text-gray-400">Offline Ready | Powered by Gemini</p>
                </div>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/70 backdrop-blur-sm sticky top-0 z-20">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeView ? viewTitles[activeView] : 'Dashboard'}
                    </h2>
                    <div className="relative" ref={settingsRef}>
                        <button onClick={() => setIsSettingsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800/50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                        {isSettingsOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 animate-fade-in py-1">
                                <button onClick={() => handleNavClick('settings')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Settings
                                </button>
                                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                                <button onClick={onSignOut} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50/70 dark:bg-gray-950/70">
                    <Suspense fallback={<PageLoader />}>
                        {renderActiveView()}
                    </Suspense>
                </main>
            </div>
            <div className="absolute top-4 right-4 z-50 space-y-2 w-full max-w-sm">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} />
                ))}
            </div>
            <HelpDesk />
        </div>
    );
};

export default Dashboard;