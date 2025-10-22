import React from 'react';

const HelpDesk: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-fade-in text-center">
            <header className="mb-8">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Help & Support
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                    This feature is under development. For assistance, please visit our Contact page.
                </p>
            </header>
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300">Our support team is available via email and WhatsApp. We'll be happy to help you with any questions or issues.</p>
                 <p className="text-sm mt-4 text-purple-600 dark:text-purple-400">See "Contact Us" for details.</p>
            </div>
        </div>
    );
};

export default HelpDesk;
