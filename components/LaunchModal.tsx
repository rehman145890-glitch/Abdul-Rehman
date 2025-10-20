import React from 'react';

interface LaunchModalProps {
  onClose: () => void;
}

const LaunchModal: React.FC<LaunchModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-lg shadow-2xl shadow-purple-500/20 text-center p-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          Welcome to <span className="text-purple-600 dark:text-purple-500">Keystone</span>!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Our new name reflects our mission: to be the central, indispensable element that locks your business operations together.
        </p>
        <div className="text-left space-y-3 mb-8 text-gray-700 dark:text-gray-300">
          <p className="flex items-start"><span className="text-purple-500 dark:text-purple-400 mr-3 mt-1">✓</span> <strong>AI Content Creation:</strong> Instantly generate professional logos and thumbnails.</p>
          <p className="flex items-start"><span className="text-purple-500 dark:text-purple-400 mr-3 mt-1">✓</span> <strong>All-in-One Management:</strong> Track finances, HR, stock, and more, all in one place.</p>
          <p className="flex items-start"><span className="text-purple-500 dark:text-purple-400 mr-3 mt-1">✓</span> <strong>Offline & Secure:</strong> Your data is encrypted and stored locally on your device.</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LaunchModal;