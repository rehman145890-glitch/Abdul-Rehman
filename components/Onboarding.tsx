import React, { useState, useEffect, FC } from 'react';
import PricingCard from './Pricing';
import { AppState } from '../App';

interface OnboardingProps {
  onComplete: (plan: string) => void;
  onEnterpriseRegister?: () => void;
  onBack: () => void;
  onNavigate: (state: AppState) => void;
  cameFromLogin?: boolean;
}

type AccountType = 'personal' | 'enterprise';
type LogoOption = 'upload' | 'later';

interface UserDetails {
    name: string;
    email: string;
    billingCurrency: string;
    profilePicture?: string;
    description?: string;
    skills?: string;
}

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500";
const formSelectClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 appearance-none bg-white border-gray-300 text-gray-800 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200";

const countries = [
  { name: 'United States', code: 'US' }, { name: 'Canada', code: 'CA' }, { name: 'United Kingdom', code: 'GB' },
  { name: 'Afghanistan', code: 'AF' }, { name: 'Albania', code: 'AL' }, { name: 'Algeria', code: 'DZ' },
  { name: 'Andorra', code: 'AD' }, { name: 'Angola', code: 'AO' }, { name: 'Argentina', code: 'AR' },
  { name: 'Australia', code: 'AU' }, { name: 'Austria', code: 'AT' }, { name: 'Bahamas', code: 'BS' },
  { name: 'Bangladesh', code: 'BD' }, { name: 'Belgium', code: 'BE' }, { name: 'Brazil', code: 'BR' },
  { name: 'China', code: 'CN' }, { name: 'Denmark', code: 'DK' }, { name: 'Egypt', code: 'EG' },
  { name: 'Finland', code: 'FI' }, { name: 'France', code: 'FR' }, { name: 'Germany', code: 'DE' },
  { name: 'Greece', code: 'GR' }, { name: 'India', code: 'IN' }, { name: 'Indonesia', code: 'ID' },
  { name: 'Ireland', code: 'IE' }, { name: 'Israel', code: 'IL' }, { name: 'Italy', code: 'IT' },
  { name: 'Japan', code: 'JP' }, { name: 'Malaysia', code: 'MY' }, { name: 'Mexico', code: 'MX' },
  { name: 'Netherlands', code: 'NL' }, { name: 'New Zealand', code: 'NZ' }, { name: 'Nigeria', code: 'NG' },
  { name: 'Norway', code: 'NO' }, { name: 'Pakistan', code: 'PK' }, { name: 'Philippines', code: 'PH' },
  { name: 'Portugal', code: 'PT' }, { name: 'Qatar', code: 'QA' }, { name: 'Russia', code: 'RU' },
  { name: 'Saudi Arabia', code: 'SA' }, { name: 'Singapore', code: 'SG' }, { name: 'South Africa', code: 'ZA' },
  { name: 'South Korea', code: 'KR' }, { name: 'Spain', code: 'ES' }, { name: 'Sweden', code: 'SE' },
  { name: 'Switzerland', code: 'CH' }, { name: 'Thailand', code: 'TH' }, { name: 'Turkey', code: 'TR' },
  { name: 'United Arab Emirates', code: 'AE' }, { name: 'Vietnam', code: 'VN' },
];

const phoneCodes = [
    { name: 'USA/CAN', code: '+1' }, { name: 'UK', code: '+44' }, { name: 'India', code: '+91' },
    { name: 'Pakistan', code: '+92' }, { name: 'Australia', code: '+61' }, { name: 'Germany', code: '+49' },
    { name: 'France', code: '+33' }, { name: 'Japan', code: '+81' }, { name: 'Brazil', code: '+55' },
    { name: 'UAE', code: '+971' }, { name: 'China', code: '+86' }, { name: 'Saudi Arabia', code: '+966' },
];

const personalSteps = ['Account Info', 'Your Profile'];
const companySteps = ['Company Details', 'Contact & Address', 'Branding & Security'];

const ProgressIndicator: FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => (
    <div className="flex items-center justify-between w-full mb-10">
        {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;
            return (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isCompleted ? 'bg-purple-600 text-white' : isActive ? 'bg-purple-500/30 border-2 border-purple-500 text-purple-400 dark:text-purple-300' : 'bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {isCompleted ? '✓' : stepNumber}
                        </div>
                        <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${isActive || isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-grow h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
            );
        })}
    </div>
);

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onEnterpriseRegister, onBack, cameFromLogin, onNavigate }) => {
  const [view, setView] = useState<'registration' | 'subscription'>('registration');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<any>({
      billingCurrency: 'USD',
      country: 'US',
      phoneCode: '+1'
  });
  
  const [logoOption, setLogoOption] = useState<LogoOption>('later');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const type = localStorage.getItem('accountType') as AccountType | null;
    setAccountType(type);

    const isSubscribed = !!localStorage.getItem('isSubscribed');
    const hasPersonalDetails = !!localStorage.getItem('userDetails');
    const hasCompanyDetails = !!localStorage.getItem('companyDetails');
    const hasRegistered = (type === 'personal' && hasPersonalDetails) || (type === 'enterprise' && hasCompanyDetails);

    if (isSubscribed || (cameFromLogin && hasRegistered)) {
        setView('subscription');
        const detailsKey = type === 'personal' ? 'userDetails' : 'companyDetails';
        const detailsRaw = localStorage.getItem(detailsKey);
        if (detailsRaw) {
            try { setUserDetails(JSON.parse(detailsRaw)); } catch {}
        }
    } else {
        setView('registration');
    }
  }, [cameFromLogin]);

  const totalSteps = accountType === 'personal' ? personalSteps.length : companySteps.length;
  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
        setPasswordError(null);
    }
  };

  const handleLogoOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoOption(e.target.value as LogoOption);
    if (e.target.value === 'later') {
      setLogoPreview(null);
      setFormData({ ...formData, logo: null });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'profilePicture') => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          if(field === 'logo') setLogoPreview(base64String);
          if(field === 'profilePicture') setProfilePicPreview(base64String);
          setFormData({ ...formData, [field]: base64String });
        };
        reader.readAsDataURL(file);
      }
  };

  const validateStep = () => {
      // This function determines if the "Next" or final submit button should be disabled
      if(accountType === 'personal') {
          // Step 1: Name, Email, and matching passwords (at least 8 characters).
          if (step === 1) return !formData.name?.trim() || !formData.email?.trim() || !formData.password || !formData.confirmPassword || (formData.password !== formData.confirmPassword) || formData.password.length < 8;
          // Step 2: Billing currency and agreement to terms.
          if (step === 2) return !formData.billingCurrency || !agreedToTerms;
      }
      if(accountType === 'enterprise') {
          // Step 1: Core company details.
          if (step === 1) return !formData.businessName?.trim() || !formData.industry?.trim() || !formData.businessType || (formData.businessType === 'Company' && !formData.companySubType) || !formData.companySize;
          // Step 2: Contact and address information.
          if (step === 2) return !formData.email?.trim() || !formData.phoneType || !formData.phoneCode || !formData.phoneNumber?.trim() || !formData.address?.trim() || !formData.city?.trim() || !formData.country;
          // Step 3: Currency, password, and terms agreement.
          if (step === 3) return !formData.billingCurrency || !formData.password || !formData.confirmPassword || (formData.password !== formData.confirmPassword) || formData.password.length < 8 || !agreedToTerms;
      }
      return false;
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
    }
    if (formData.password.length < 8) {
        setPasswordError("Password must be at least 8 characters long.");
        return;
    }

    const detailKey = accountType === 'personal' ? 'userDetails' : 'companyDetails';
    const { confirmPassword, ...dataToSave } = formData;
    
    localStorage.setItem(detailKey, JSON.stringify(dataToSave));
    
    if (accountType === 'personal') {
        setUserDetails(dataToSave);
        setView('subscription');
    } else if (accountType === 'enterprise' && onEnterpriseRegister) {
        onEnterpriseRegister();
    }
  };
  
  const handleBackClick = () => {
    if (view === 'subscription') {
        onBack();
    } else if (step > 1) {
        prevStep();
    } else {
        onBack();
    }
  };
  
  const handleSelectPlan = (plan: string) => {
    onComplete(plan);
  };

  const renderRegistrationForm = () => {
    const NavButtons = () => (
        <div className="flex items-center gap-4 !mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {step > 1 ? (
                 <button type="button" onClick={prevStep} className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-5 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                    Back
                </button>
            ) : <div className="w-[105px] h-12"></div>}
            <div className="flex-grow"></div>
            {step < totalSteps ? (
                <button type="button" onClick={nextStep} disabled={validateStep()} className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:opacity-50">
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            ) : (
                <button type="submit" disabled={validateStep()} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:opacity-50">
                   {accountType === 'personal' ? 'Create Account & Continue' : 'Register Company & Continue'}
                </button>
            )}
        </div>
    );
    
    const formContainerClasses = "w-full bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-10 animate-fade-in shadow-2xl shadow-purple-500/10 relative";

    if (accountType === 'personal') {
      return (
        <div className={`${formContainerClasses} max-w-2xl`}>
          <button onClick={handleBackClick} className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors z-10" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Create your Personal Account</h1>
            <p className="text-gray-600 dark:text-gray-400">For creators, freelancers, and startups.</p>
          </div>
          <ProgressIndicator steps={personalSteps} currentStep={step} />
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
             {step === 1 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Your Name</label>
                            <input id="name" name="name" type="text" required value={formData.name || ''} onChange={handleChange} className={formInputClasses} placeholder="e.g., Jane Doe" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Your Email</label>
                            <input id="email" name="email" type="email" required value={formData.email || ''} onChange={handleChange} className={formInputClasses} placeholder="you@example.com" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Password</label>
                            <input id="password" name="password" type="password" required value={formData.password || ''} onChange={handleChange} className={formInputClasses} placeholder="8+ characters" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword || ''} onChange={handleChange} className={formInputClasses} placeholder="Re-enter password" />
                        </div>
                    </div>
                    {passwordError && <p className="text-red-500 dark:text-red-400 text-sm text-center pt-2">{passwordError}</p>}
                </>
             )}
             {step === 2 && (
                 <>
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Profile Picture</label>
                            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative">
                                {profilePicPreview ? <img src={profilePicPreview} alt="Preview" className="w-full h-full rounded-full object-cover" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                <label htmlFor="profilePicture" className="absolute -bottom-2 -right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                </label>
                                <input id="profilePicture" name="profilePicture" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePicture')} className="hidden" />
                            </div>
                        </div>
                        <div className="flex-grow w-full space-y-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Short Bio / Description</label>
                                <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className={`${formInputClasses} resize-none`} rows={2} placeholder="e.g., Freelance web developer specializing in React."></textarea>
                            </div>
                             <div>
                                <label htmlFor="skills" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Skills</label>
                                <input id="skills" name="skills" type="text" value={formData.skills || ''} onChange={handleChange} className={formInputClasses} placeholder="React, TypeScript, UI/UX" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated, e.g., React, TypeScript, UI/UX</p>
                            </div>
                        </div>
                     </div>
                    <div>
                      <label htmlFor="billingCurrency" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Billing Currency</label>
                      <select id="billingCurrency" name="billingCurrency" required value={formData.billingCurrency} onChange={handleChange} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                        <option value="USD">USD ($)</option> <option value="EUR">EUR (€)</option> <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option> <option value="INR">INR (₹)</option> <option value="PKR">PKR (Rs)</option>
                      </select>
                    </div>
                     <div className="pt-4">
                        <label className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 rounded mr-3 mt-0.5 flex-shrink-0" />
                            <span>I agree to the 
                                <button type="button" onClick={() => onNavigate('terms')} className="text-purple-600 dark:text-purple-400 hover:underline mx-1">Terms of Service</button> 
                                and 
                                <button type="button" onClick={() => onNavigate('privacy')} className="text-purple-600 dark:text-purple-400 hover:underline ml-1">Privacy Policy</button>.
                            </span>
                        </label>
                    </div>
                </>
             )}
            <NavButtons />
          </form>
        </div>
      );
    }
    
    if (accountType === 'enterprise') {
      return (
          <div className={`${formContainerClasses} max-w-3xl`}>
            <button onClick={handleBackClick} className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors z-10" aria-label="Go back">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Register your Company</h1>
                <p className="text-gray-600 dark:text-gray-400">For established businesses and enterprises.</p>
            </div>
            <ProgressIndicator steps={companySteps} currentStep={step} />
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {step === 1 && (<>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Business Name</label>
                      <input id="businessName" name="businessName" type="text" required value={formData.businessName || ''} onChange={handleChange} className={formInputClasses} placeholder="Your Company's Legal Name" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please use the full, legally registered name.</p>
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Industry</label>
                      <input id="industry" name="industry" type="text" required value={formData.industry || ''} onChange={handleChange} className={formInputClasses} placeholder="e.g., Software, Retail, Manufacturing" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The primary sector your business operates in.</p>
                    </div>
                  </div>
                  <div className={`grid grid-cols-1 ${formData.businessType === 'Company' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                     <div>
                        <label htmlFor="businessType" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Business Type</label>
                        <select id="businessType" name="businessType" required value={formData.businessType || ''} onChange={handleChange} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                          <option value="" disabled>Select type...</option> <option value="Sole Proprietor">Sole Proprietor</option> <option value="Partnership">Partnership</option> <option value="Company">Company</option>
                        </select>
                      </div>
                      {formData.businessType === 'Company' && (
                        <div>
                          <label htmlFor="companySubType" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Company Type</label>
                          <select id="companySubType" name="companySubType" required value={formData.companySubType || ''} onChange={handleChange} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                            <option value="" disabled>Select...</option> <option value="PVT">PVT (Private)</option> <option value="LTD">LTD (Limited)</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label htmlFor="companySize" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Company Size</label>
                        <select id="companySize" name="companySize" required value={formData.companySize || ''} onChange={handleChange} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                          <option value="" disabled>Select...</option><option value="1-10">1-10 employees</option><option value="11-50">11-50 employees</option><option value="51-200">51-200 employees</option><option value="201-1000">201-1,000 employees</option><option value="1000+">1,000+ employees</option>
                        </select>
                      </div>
                  </div>
              </>)}
              {step === 2 && (<>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Contact Email</label>
                        <input id="email" name="email" type="email" required value={formData.email || ''} onChange={handleChange} className={formInputClasses} placeholder="you@company.com" />
                      </div>
                      <div>
                        <label htmlFor="phoneType" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Phone Type</label>
                        <select id="phoneType" name="phoneType" required value={formData.phoneType || ''} onChange={handleChange} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                          <option value="" disabled>Select...</option><option value="Personal Mobile">Personal Mobile</option><option value="Company Landline">Company Landline</option>
                        </select>
                      </div>
                   </div>
                   <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Contact Phone</label>
                        <div className="flex">
                          <select id="phoneCode" name="phoneCode" required value={formData.phoneCode} onChange={handleChange} className={`${formSelectClasses} rounded-r-none w-36`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                             {phoneCodes.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                          </select>
                          <input id="phoneNumber" name="phoneNumber" type="tel" required value={formData.phoneNumber || ''} onChange={handleChange} className={`${formInputClasses} rounded-l-none`} placeholder="(555) 123-4567" />
                        </div>
                    </div>
                   <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Street Address</label>
                    <input id="address" name="address" type="text" required value={formData.address || ''} onChange={handleChange} className={formInputClasses} placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">City</label>
                        <input id="city" name="city" type="text" required value={formData.city || ''} onChange={handleChange} className={formInputClasses} placeholder="Anytown" />
                      </div>
                       <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Country</label>
                        <select id="country" name="country" required value={formData.country} onChange={handleChange} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                          {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      </div>
                  </div>
              </>)}
              {step === 3 && (<>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Company Logo (Optional)</label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="logoOption" value="later" checked={logoOption === 'later'} onChange={handleLogoOptionChange} className="form-radio bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500" /><span>I'll add it later</span></label>
                            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="logoOption" value="upload" checked={logoOption === 'upload'} onChange={handleLogoOptionChange} className="form-radio bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500" /><span>Upload a logo now</span></label>
                        </div>
                        {logoOption === 'upload' && (
                            <div className="mt-4 flex items-center gap-4">
                                <input id="logoFile" name="logoFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className={formInputClasses} />
                                {logoPreview && <img src={logoPreview} alt="Logo Preview" className="h-12 w-12 rounded-lg object-contain bg-gray-200 dark:bg-gray-800 p-1" />}
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="billingCurrency" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Billing Currency</label>
                        <select id="billingCurrency" name="billingCurrency" required value={formData.billingCurrency} onChange={handleChange} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                          <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="JPY">JPY (¥)</option><option value="INR">INR (₹)</option><option value="PKR">PKR (Rs)</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Password</label>
                            <input id="password" name="password" type="password" required value={formData.password || ''} onChange={handleChange} className={formInputClasses} placeholder="8+ characters" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword || ''} onChange={handleChange} className={formInputClasses} placeholder="Re-enter password" />
                        </div>
                    </div>
                    {passwordError && <p className="text-red-500 dark:text-red-400 text-sm text-center pt-2">{passwordError}</p>}
                    <div className="pt-4 space-y-3">
                        <label className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 rounded mr-3 mt-0.5 flex-shrink-0" />
                            <span>I agree to the 
                                <button type="button" onClick={() => onNavigate('terms')} className="text-purple-600 dark:text-purple-400 hover:underline mx-1">Terms of Service</button> 
                                and 
                                <button type="button" onClick={() => onNavigate('privacy')} className="text-purple-600 dark:text-purple-400 hover:underline ml-1">Privacy Policy</button>.
                            </span>
                        </label>
                        <div className="flex items-center justify-center text-xs text-green-700/80 dark:text-green-500/80 p-2 bg-green-100/50 dark:bg-green-900/20 rounded-md gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                             </svg>
                            <span>Your data is end-to-end protected and stored only on your device.</span>
                        </div>
                    </div>
              </>)}
              <NavButtons />
            </form>
          </div>
      );
    }
    return null;
  };

  const renderSubscriptionView = () => (
    <div className="w-full max-w-6xl bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 text-center animate-fade-in shadow-2xl shadow-purple-500/10 relative">
        <button onClick={handleBackClick} className="absolute top-6 left-6 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors z-10" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      {userDetails && (
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <p className="text-gray-600 dark:text-gray-400">Subscription for:</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userDetails.name || (userDetails as any).businessName}</h2>
          <p className="text-sm text-gray-500">{userDetails.email}</p>
        </div>
      )}
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">Unlock Your <span className="text-purple-600 dark:text-purple-500">Full Potential</span></h1>
      <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12">All plans are free for the first month. Choose the plan that best fits your needs.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PricingCard 
          plan="Starter" 
          price={10} 
          currency={userDetails?.billingCurrency || 'USD'} 
          features={['AI Thumbnail Studio', 'AI Logo Generator', 'Basic Startup Suite']} 
          onSelect={() => handleSelectPlan('Starter')} 
          disabled={accountType === 'enterprise'}
          disabledText="Not available for Company Accounts"
        />
        <PricingCard 
          plan="Pro" 
          price={30} 
          currency={userDetails?.billingCurrency || 'USD'} 
          features={['Unlimited AI Generations', 'AI Thumbnail & Logo Studios', 'Advanced Startup Financials', 'Interactive Lean Canvas', 'Priority Support']} 
          onSelect={() => handleSelectPlan('Pro')} 
          isFeatured={true}
          disabled={accountType === 'enterprise'}
          disabledText="Not available for Company Accounts"
        />
        <PricingCard 
          plan="Enterprise" 
          price={50} 
          currency={userDetails?.billingCurrency || 'USD'} 
          features={['Central Overview Dashboard', 'Financial Reports (P&L)', 'Detailed Cash Book Management', 'Marketing ROI Tracking', 'Advanced HR & Inventory', 'Dedicated Account Manager']} 
          onSelect={() => handleSelectPlan('Enterprise')} 
          disabled={accountType === 'personal'}
          disabledText="Requires Company Account Setup"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {view === 'registration' ? renderRegistrationForm() : renderSubscriptionView()}
    </div>
  );
};

export default Onboarding;