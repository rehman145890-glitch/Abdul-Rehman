import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4500); // Should be slightly less than the removal timeout in Dashboard
    return () => clearTimeout(timer);
  }, []);
  
  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center transition-all duration-300 ease-in-out border';
  const typeClasses = {
    success: 'bg-green-100/80 dark:bg-green-500/20 backdrop-blur-sm border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-200',
    error: 'bg-red-100/80 dark:bg-red-500/20 backdrop-blur-sm border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-200',
  };

  const icon = {
      success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        {icon[type]}
        <span className="font-medium">{message}</span>
    </div>
  );
};

export default Toast;