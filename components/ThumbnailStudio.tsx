

import React, { useState, useCallback, useRef, FC } from 'react';
import ImageCanvas from './ImageCanvas';
import PromptInput from './PromptInput';
import { generateThumbnail, ThumbnailOptions } from '../services/geminiService';
import { ToastMessage } from './Dashboard';

// A simple utility to prevent XSS by escaping HTML characters.
const sanitizeHTML = (str: string | undefined | null): string => {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

type AspectRatio = '16:9' | '1:1' | '9:16';

// --- Manual Editor Types & Constants ---
interface ManualThumbnailState {
  backgroundColor: string;
  backgroundImage: string | null;
  titleText: string;
  titleFont: string;
  titleColor: string;
  titleSize: number;
  taglineText: string;
  taglineFont: string;
  taglineColor: string;
  taglineSize: number;
}

const fontFamilies = ['Inter', 'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Impact'];

const formInputClasses = "w-full rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500";
const formSelectClasses = "w-full rounded-lg p-2 appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";

// --- Helper Components ---
const TabButton: FC<{ label: string; isActive: boolean; onClick: () => void, children?: React.ReactNode }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors rounded-t-lg ${isActive ? 'border-purple-500 text-purple-600 dark:text-purple-300 bg-purple-500/10' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>{label}</button>
);

const ControlGroup: FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-3">{label}</h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const AspectRatioButton: FC<{ label: string; value: AspectRatio; isActive: boolean; onClick: (val: AspectRatio) => void }> = ({ label, value, isActive, onClick }) => (
    <button 
      onClick={() => onClick(value)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
        isActive
          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
);


const ThumbnailCanvas = React.forwardRef<SVGSVGElement, { state: ManualThumbnailState }>(({ state }, ref) => {
  const {
    backgroundColor,
    backgroundImage,
    titleText,
    titleFont,
    titleColor,
    titleSize,
    taglineText,
    taglineFont,
    taglineColor,
    taglineSize,
  } = state;

  const canvasWidth = 1280;
  const canvasHeight = 720;

  // Position text elements. If tagline exists, shift both for vertical centering as a group.
  const titleY = taglineText 
    ? canvasHeight / 2 - (taglineSize / 2) - 10 
    : canvasHeight / 2;
  const taglineY = titleY + titleSize * 0.75;


  return (
    <svg
      ref={ref}
      width="100%"
      height="100%"
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Georgia&family=Times+New+Roman&family=Arial&family=Verdana&family=Courier+New&family=Impact');`}
        </style>
      </defs>

      <rect width={canvasWidth} height={canvasHeight} fill={backgroundColor} />

      {backgroundImage && (
        <image href={backgroundImage} x="0" y="0" width={canvasWidth} height={canvasHeight} preserveAspectRatio="xMidYMid slice" />
      )}

      <text
        x="50%"
        y={titleY}
        fontFamily={titleFont}
        fontSize={titleSize}
        fill={titleColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="900"
        style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}
      >
        {sanitizeHTML(titleText)}
      </text>

      {taglineText && (
        <text
          x="50%"
          y={taglineY}
          fontFamily={taglineFont}
          fontSize={taglineSize}
          fill={taglineColor}
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="400"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
        >
          {sanitizeHTML(taglineText)}
        </text>
      )}
    </svg>
  );
});

// --- Main Component ---
interface ThumbnailStudioProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const ThumbnailStudio: React.FC<ThumbnailStudioProps> = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  // AI Generator State
  const [options, setOptions] = useState<ThumbnailOptions>({
    title: '',
    tagline: '',
    background: '',
    logoText: '',
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  // Manual Editor State
  const [manualState, setManualState] = useState<ManualThumbnailState>({
    backgroundColor: '#111827',
    backgroundImage: null,
    titleText: 'Your Title Here',
    titleFont: 'Inter',
    titleColor: '#FFFFFF',
    titleSize: 90,
    taglineText: 'A catchy tagline below',
    taglineFont: 'Inter',
    taglineColor: '#D1D5DB',
    taglineSize: 45,
  });
  const svgCanvasRef = useRef<SVGSVGElement>(null);

  // AI Generator Logic
  const handleGenerate = useCallback(async () => {
    if (!options.title.trim() && !options.background.trim() && !referenceImage) return;
    setIsLoading(true);
    setImageUrl(null);
    setWatermarkedImageUrl(null);
    setWatermarkText('');
    try {
      const url = await generateThumbnail(options, aspectRatio, referenceImage ?? undefined);
      setImageUrl(url);
      addToast('Thumbnail generated successfully!', 'success');
    } catch (err) {
      if (err instanceof Error) {
        addToast(err.message, 'error');
      } else {
        addToast('An unexpected error occurred.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [options, addToast, referenceImage, aspectRatio]);

  const handleApplyWatermark = () => {
        if (!imageUrl || !watermarkText.trim()) {
            addToast('Please generate an image and enter watermark text.', 'error');
            return;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx!.drawImage(img, 0, 0);
            
            ctx!.font = 'bold 32px Inter';
            ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx!.textAlign = 'center';
            ctx!.textBaseline = 'middle';
            
            ctx!.fillText(sanitizeHTML(watermarkText), canvas.width / 2, canvas.height / 2);
            setWatermarkedImageUrl(canvas.toDataURL('image/jpeg'));
            addToast('Watermark applied!', 'success');
        };
    };

    const openUniquenessCheck = (url: string | null) => {
        if (!url) return;
        const searchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`;
        window.open(searchUrl, '_blank');
    };

  // Manual Editor Logic
  const handleStateChange = (prop: keyof ManualThumbnailState, value: any) => {
    setManualState(prevState => ({ ...prevState, [prop]: value }));
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          handleStateChange('backgroundImage', reader.result as string);
          addToast('Background image added!', 'success');
        };
        reader.readAsDataURL(file);
      } else if (file) {
        addToast('Please select a valid image file.', 'error');
      }
    };

    const handleRemoveImage = () => {
        handleStateChange('backgroundImage', null);
        const fileInput = document.getElementById('bg-image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

  const handleDownloadSVG = () => {
    const svgNode = svgCanvasRef.current;
    if (!svgNode) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeHTML(manualState.titleText).toLowerCase().replace(/\s/g, '-')}-thumbnail.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Thumbnail downloaded as SVG!', 'success');
  };

  const renderAiGenerator = () => (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
        <AspectRatioButton label="YouTube (16:9)" value="16:9" isActive={aspectRatio === '16:9'} onClick={setAspectRatio} />
        <AspectRatioButton label="Post (1:1)" value="1:1" isActive={aspectRatio === '1:1'} onClick={setAspectRatio} />
        <AspectRatioButton label="Story (9:16)" value="9:16" isActive={aspectRatio === '9:16'} onClick={setAspectRatio} />
      </div>
      <ImageCanvas isLoading={isLoading} imageUrl={watermarkedImageUrl || imageUrl} aspectRatio={aspectRatio} />
       <div className="w-full max-w-xl">
         {imageUrl && (
            <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-3">
                 <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Watermark</label>
                    <div className="flex gap-2">
                        <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="e.g., © Your Name" className={formInputClasses} />
                        <button onClick={handleApplyWatermark} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Apply</button>
                    </div>
                 </div>
                 <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Intellectual Property</label>
                    <button onClick={() => openUniquenessCheck(watermarkedImageUrl || imageUrl)} className="w-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        Check Uniqueness (Google Lens)
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">This is not legal advice. The uniqueness check is a tool to help you research similar images.</p>
                 </div>
            </div>
          )}
        <PromptInput
          options={options}
          setOptions={setOptions}
          onSubmit={handleGenerate}
          isLoading={isLoading}
          onFileChange={setReferenceImage}
          referenceImageName={referenceImage?.name || null}
        />
         {(imageUrl || watermarkedImageUrl) && (
            <a 
              href={watermarkedImageUrl || imageUrl!} 
              download="ai-generated-thumbnail.jpeg" 
              className="block w-full text-center mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Download Thumbnail
            </a>
          )}
      </div>
    </div>
  );

  const renderManualEditor = () => (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
      <div className="flex-grow flex items-center justify-center bg-white dark:bg-black/20 p-4 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl shadow-purple-500/10">
        <ThumbnailCanvas state={manualState} ref={svgCanvasRef} />
      </div>
      <div className="w-full lg:w-96 bg-white dark:bg-gray-900/50 p-6 border border-gray-200 dark:border-gray-800 rounded-xl flex-shrink-0">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Editor Controls</h3>
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
          <ControlGroup label="Background">
              {!manualState.backgroundImage ? (
                <>
                  <label className="block text-sm text-gray-500 dark:text-gray-400">Background Color</label>
                  <input type="color" value={manualState.backgroundColor} onChange={e => handleStateChange('backgroundColor', e.target.value)} className="w-full h-10 p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer" />
                  <label htmlFor="bg-image-upload" className="block w-full text-center mt-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm cursor-pointer">
                      Upload Background Image
                  </label>
                  <input id="bg-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </>
              ) : (
                <div className="relative">
                  <img src={manualState.backgroundImage} alt="Background preview" className="w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600" />
                  <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold transition-transform hover:scale-110">
                      ✕
                  </button>
                </div>
              )}
          </ControlGroup>
          <ControlGroup label="Main Title">
              <input type="text" value={manualState.titleText} onChange={e => handleStateChange('titleText', e.target.value)} className={`${formInputClasses} text-sm`} />
              <select value={manualState.titleFont} onChange={e => handleStateChange('titleFont', e.target.value)} className={`${formSelectClasses} text-sm`}>
                  {fontFamilies.map(font => <option key={font} value={font}>{font}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4 items-center">
                <input type="color" value={manualState.titleColor} onChange={e => handleStateChange('titleColor', e.target.value)} className="w-full h-10 p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer" />
                <div className="flex items-center gap-2">
                    <input type="range" min="50" max="150" value={manualState.titleSize} onChange={e => handleStateChange('titleSize', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-sm w-8 text-right text-gray-600 dark:text-gray-400">{manualState.titleSize}px</span>
                </div>
              </div>
          </ControlGroup>
          <ControlGroup label="Tagline">
              <input type="text" value={manualState.taglineText} onChange={e => handleStateChange('taglineText', e.target.value)} className={`${formInputClasses} text-sm`} />
              <select value={manualState.taglineFont} onChange={e => handleStateChange('taglineFont', e.target.value)} className={`${formSelectClasses} text-sm`}>
                  {fontFamilies.map(font => <option key={font} value={font}>{font}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4 items-center">
                <input type="color" value={manualState.taglineColor} onChange={e => handleStateChange('taglineColor', e.target.value)} className="w-full h-10 p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer" />
                <div className="flex items-center gap-2">
                    <input type="range" min="20" max="80" value={manualState.taglineSize} onChange={e => handleStateChange('taglineSize', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-sm w-8 text-right text-gray-600 dark:text-gray-400">{manualState.taglineSize}px</span>
                </div>
              </div>
          </ControlGroup>
        </div>
        <button onClick={handleDownloadSVG} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Download Thumbnail
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center p-1 animate-fade-in">
        <header className="mb-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                AI Thumbnail <span className="text-purple-500">Studio</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                Generate a stunning thumbnail with AI or craft your own with the manual editor.
            </p>
        </header>
        
        <div className="w-full max-w-6xl">
            <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
                <nav className="-mb-px flex justify-center space-x-4">
                    <TabButton label="AI Generator" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
                    <TabButton label="Manual Editor" isActive={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />
                </nav>
            </div>
        </div>
        
        {activeTab === 'ai' ? renderAiGenerator() : renderManualEditor()}
    </div>
  );
};

export default ThumbnailStudio;