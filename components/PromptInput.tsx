import React from 'react';
import { ThumbnailOptions } from '../services/geminiService';

interface PromptInputProps {
  options: ThumbnailOptions;
  setOptions: (options: ThumbnailOptions) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500";


const PromptInput: React.FC<PromptInputProps> = ({ options, setOptions, onSubmit, isLoading }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || (!options.title.trim() && !options.background.trim())) return;
    onSubmit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOptions({ ...options, [name]: value });
  };

  const isButtonDisabled = isLoading || (!options.title.trim() && !options.background.trim());

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mt-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Main Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={options.title}
            onChange={handleInputChange}
            placeholder="e.g., My Awesome Video"
            className={formInputClasses}
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tagline / Subtitle</label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            value={options.tagline}
            onChange={handleInputChange}
            placeholder="e.g., A new adventure begins"
            className={formInputClasses}
            disabled={isLoading}
          />
        </div>
      </div>
       <div>
          <label htmlFor="logoText" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Logo Text</label>
          <input
            id="logoText"
            name="logoText"
            type="text"
            value={options.logoText}
            onChange={handleInputChange}
            placeholder="e.g., ACME or A"
            className={formInputClasses}
            disabled={isLoading}
          />
        </div>
      <div>
        <label htmlFor="background" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Background Description *</label>
        <textarea
          id="background"
          name="background"
          value={options.background}
          onChange={handleInputChange}
          placeholder="e.g., A neon hologram of a cat driving at top speed"
          rows={3}
          className={`${formInputClasses} resize-none`}
          disabled={isLoading}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isButtonDisabled}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-12 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Generate Thumbnail
          </>
        )}
      </button>
    </form>
  );
};

export default PromptInput;