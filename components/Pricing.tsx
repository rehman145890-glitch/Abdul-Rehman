import React from 'react';

const conversionRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.93,
    GBP: 0.79,
    JPY: 157,
    INR: 83.5,
    PKR: 278,
};

const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    PKR: 'Rs',
}

interface PricingCardProps {
    plan: string;
    price: number; // Base price in USD
    currency: string;
    features: string[];
    onSelect: (() => void) | undefined;
    isFeatured?: boolean;
    disabled?: boolean;
    disabledText?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, price, currency, features, onSelect, isFeatured = false, disabled = false, disabledText }) => {
    const rate = conversionRates[currency] || 1;
    const symbol = currencySymbols[currency] || '$';
    const convertedPrice = Math.round(price * rate);

    return (
        <div className={`p-8 rounded-xl border ${isFeatured && !disabled ? 'border-purple-500/50 bg-purple-500/5 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/50'} ${disabled ? 'opacity-50' : 'transition-all transform hover:scale-[1.03]'} relative flex flex-col shadow-lg`}>
            {isFeatured && !disabled && <div className="absolute top-0 right-0 mr-4 -mt-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">POPULAR</div>}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan}</h3>
            <div className="mt-4">
                <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    Free
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400"> for 1 Month</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Then {symbol}{convertedPrice}/month</p>
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-800 my-6"></div>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-left flex-grow">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={onSelect}
                disabled={disabled}
                className={`w-full mt-8 font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md ${
                    disabled
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : isFeatured
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                        : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
            >
                {disabled ? disabledText : 'Start Free Trial'}
            </button>
        </div>
    );
};

export default PricingCard;