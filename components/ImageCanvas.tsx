import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ImageCanvasProps {
  isLoading: boolean;
  imageUrl: string | null;
  aspectRatio?: '16:9' | '1:1';
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ isLoading, imageUrl, aspectRatio = '16:9' }) => {
  const aspectClass = aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video';
  const placeholderTitle = aspectRatio === '1:1' ? 'Your Logo Awaits' : 'Your Thumbnail Awaits';
  const Icon = aspectRatio === '1:1' 
    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
    : <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


  return (
    <div className={`w-full max-w-xl ${aspectClass} bg-gray-100 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 shadow-2xl shadow-purple-500/10 relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      {!imageUrl && !isLoading && (
        <div className="text-center text-gray-500 dark:text-gray-600 p-8">
          {Icon}
          <h2 className="text-xl font-semibold mt-4 text-gray-600 dark:text-gray-500">{placeholderTitle}</h2>
          <p className="mt-1 text-sm">Fill out the details to generate a visual masterpiece.</p>
        </div>
      )}
      {imageUrl && (
        <img
          key={imageUrl}
          src={imageUrl}
          alt="Generated Visual"
          className="w-full h-full object-cover animate-fade-in"
          style={{ animationFillMode: 'forwards' }}
        />
      )}
    </div>
  );
};

export default ImageCanvas;