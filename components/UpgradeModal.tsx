import React from 'react';

interface UpgradeModalProps {
  currentPlan: string;
  requiredPlan: string;
  onClose: () => void;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ currentPlan, requiredPlan, onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md shadow-2xl shadow-purple-500/10 text-center p-8">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-400 dark:border-yellow-600 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
          Upgrade Required
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This feature requires the <span className="font-bold text-purple-600 dark:text-purple-400">{requiredPlan}</span> plan.
          You are currently on the <span className="font-bold text-gray-800 dark:text-gray-200">{currentPlan}</span> plan.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="w-1/2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
           <button
            onClick={onUpgrade}
            className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Change Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;