import React, { useState, useRef, useCallback, FC } from 'react';
import { ToastMessage } from './Dashboard';
import ImageCanvas from './ImageCanvas';
import { generateLogo } from '../services/geminiService';

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


interface LogoGeneratorProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

interface ManualLogoState {
  icon: string;
  imageIcon: string | null;
  iconColor: string;
  iconSize: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  layout: 'top' | 'left' | 'right';
}

const icons = {
  abstractCube: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>,
  mountain: <path d="M3 20h18L12 4z" />,
  hexagon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
  circle: <circle cx="12" cy="12" r="10" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
};

const fontFamilies = ['Inter', 'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New'];

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500";
const formSelectClasses = "w-full rounded-lg p-3 appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200";

const TabButton: FC<{ label: string; isActive: boolean; onClick: () => void; children?: React.ReactNode }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors rounded-t-lg ${isActive ? 'border-purple-500 text-purple-600 dark:text-purple-300 bg-purple-500/10' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>{label}</button>
);


const LogoGenerator: React.FC<LogoGeneratorProps> = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  // AI Generator State
  const [logoPrompt, setLogoPrompt] = useState('');
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState<string | null>(null);
  const [watermarkedLogoUrl, setWatermarkedLogoUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  // Manual Editor State
  const [logoState, setLogoState] = useState<ManualLogoState>(() => {
    const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    return {
        icon: 'abstractCube',
        imageIcon: null,
        iconColor: '#a78bfa',
        iconSize: 50,
        text: 'Your Company',
        fontFamily: 'Inter',
        fontSize: 24,
        textColor: isDarkMode ? '#f9fafb' : '#111827',
        layout: 'left',
    };
  });
  const svgCanvasRef = useRef<SVGSVGElement>(null);

  // AI Generator Logic
  const handleGenerateLogo = useCallback(async () => {
    if (!logoPrompt.trim() && !referenceImage) {
      addToast('Please enter a description or upload an image for your logo.', 'error');
      return;
    }
    setIsGenerating(true);
    setGeneratedLogoUrl(null);
    setWatermarkedLogoUrl(null);
    setWatermarkText('');
    try {
      const url = await generateLogo(logoPrompt, referenceImage ?? undefined);
      setGeneratedLogoUrl(url);
      addToast('Logo generated successfully!', 'success');
    } catch (err) {
      if (err instanceof Error) {
        addToast(err.message, 'error');
      } else {
        addToast('An unexpected error occurred.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [logoPrompt, addToast, referenceImage]);

   const handleApplyWatermark = () => {
        if (!generatedLogoUrl || !watermarkText.trim()) {
            addToast('Please generate a logo and enter watermark text.', 'error');
            return;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = generatedLogoUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx!.drawImage(img, 0, 0);
            
            ctx!.font = 'bold 24px Inter';
            ctx!.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx!.textAlign = 'center';
            ctx!.textBaseline = 'bottom';
            
            ctx!.fillText(sanitizeHTML(watermarkText), canvas.width / 2, canvas.height - 10);
            setWatermarkedLogoUrl(canvas.toDataURL('image/jpeg'));
            addToast('Watermark applied!', 'success');
        };
    };

    const openUniquenessCheck = (url: string | null) => {
        if (!url) return;
        const searchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`;
        window.open(searchUrl, '_blank');
    };

  // Manual Editor Logic
  const handleStateChange = (prop: keyof ManualLogoState, value: any) => {
    setLogoState(prevState => ({ ...prevState, [prop]: value }));
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          handleStateChange('imageIcon', reader.result as string);
          addToast('Image uploaded as icon!', 'success');
        };
        reader.readAsDataURL(file);
      } else if (file) {
        addToast('Please select a valid image file.', 'error');
      }
    };

    const handleRemoveImage = () => {
        handleStateChange('imageIcon', null);
        const fileInput = document.getElementById('logo-image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        addToast('Image icon removed.', 'success');
    };


  const handleDownloadSVG = () => {
    const svgNode = svgCanvasRef.current;
    if (!svgNode) return;

    const svgClone = svgNode.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('width', '200');
    svgClone.setAttribute('height', '200');

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeHTML(logoState.text).toLowerCase().replace(/\s/g, '-')}-logo.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Logo downloaded as SVG!', 'success');
  };
  
  const renderAiGenerator = () => (
    <div className="w-full max-w-5xl flex flex-col items-center gap-8">
      <ImageCanvas isLoading={isGenerating} imageUrl={watermarkedLogoUrl || generatedLogoUrl} aspectRatio="1:1" />
      <div className="w-full max-w-xl space-y-4">
         {generatedLogoUrl && (
             <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-3">
                 <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Watermark</label>
                    <div className="flex gap-2">
                        <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="e.g., © Your Brand" className={formInputClasses} />
                        <button onClick={handleApplyWatermark} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Apply</button>
                    </div>
                 </div>
                 <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Intellectual Property</label>
                    <button onClick={() => openUniquenessCheck(watermarkedLogoUrl || generatedLogoUrl)} className="w-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        Check Uniqueness (Google Lens)
                    </button>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">This is not legal advice. The uniqueness check is a tool to help you research similar logos.</p>
                 </div>
            </div>
         )}
        <form onSubmit={(e) => { e.preventDefault(); handleGenerateLogo(); }}>
          <div>
              <label htmlFor="logoPrompt" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Logo Description *</label>
              <textarea
                id="logoPrompt"
                name="logoPrompt"
                value={logoPrompt}
                onChange={(e) => setLogoPrompt(e.target.value)}
                placeholder="e.g., A minimalist logo for a coffee shop called 'Brew Bliss', with a coffee bean icon"
                rows={3}
                className={`${formInputClasses} resize-none`}
                disabled={isGenerating}
              />
          </div>
           <div className="mt-4">
            <label htmlFor="referenceImage" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Reference Image (Optional)</label>
            <label htmlFor="referenceImage" className={`flex items-center justify-center w-full p-3 rounded-lg border-2 border-dashed focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-200 cursor-pointer ${referenceImage ? 'border-purple-500/50 bg-purple-500/10' : 'border-gray-300 dark:border-gray-700 hover:border-purple-500/50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-2a2 2 0 012-2h12a2 2 0 012 2v2m-6-12h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">{sanitizeHTML(referenceImage?.name) || 'Click to upload an image'}</span>
            </label>
            <input id="referenceImage" type="file" accept="image/*" className="hidden" onChange={e => setReferenceImage(e.target.files ? e.target.files[0] : null)} />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Provide an image to inspire or be edited into a logo.</p>
          </div>
          <button
            type="submit"
            disabled={isGenerating || (!logoPrompt.trim() && !referenceImage)}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-12 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
          >
            {isGenerating ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
             <>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Generate with AI
             </>
            )}
          </button>
        </form>
         {(generatedLogoUrl || watermarkedLogoUrl) && (
            <a 
              href={watermarkedLogoUrl || generatedLogoUrl!} 
              download="ai-generated-logo.jpeg" 
              className="block w-full text-center mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Download Logo
            </a>
          )}
      </div>
    </div>
  );

  const renderManualEditor = () => (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
      <div className="flex-grow flex items-center justify-center bg-white dark:bg-black/20 p-8 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl shadow-purple-500/10 dark:shadow-purple-900/10">
        <LogoCanvas state={logoState} ref={svgCanvasRef} />
      </div>
      <div className="w-full lg:w-96 bg-white dark:bg-gray-900/50 p-6 border border-gray-200 dark:border-gray-800 rounded-xl flex-shrink-0">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Editor Controls</h3>
        <div className="space-y-6">
          <ControlGroup label="Icon">
              {logoState.imageIcon ? (
                <div className="relative">
                    <img src={logoState.imageIcon} alt="Icon preview" className="w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-2" />
                    <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold transition-transform hover:scale-110">
                        ✕
                    </button>
                </div>
              ) : (
                <>
                    <select value={logoState.icon} onChange={e => handleStateChange('icon', e.target.value)} className={`${formSelectClasses} text-sm`}>
                        {Object.keys(icons).map(name => <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>)}
                    </select>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mt-2">Icon Color</label>
                    <input type="color" value={logoState.iconColor} onChange={e => handleStateChange('iconColor', e.target.value)} className="w-full h-10 p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer" />
                    <label htmlFor="logo-image-upload" className="block w-full text-center mt-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm cursor-pointer">
                        Upload Image as Icon
                    </label>
                    <input id="logo-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </>
              )}
              <label className="block text-sm text-gray-600 dark:text-gray-400 mt-2">Icon Size: {logoState.iconSize}px</label>
              <input type="range" min="20" max="80" value={logoState.iconSize} onChange={e => handleStateChange('iconSize', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </ControlGroup>
          <ControlGroup label="Text">
              <input type="text" value={logoState.text} onChange={e => handleStateChange('text', e.target.value)} className={`${formInputClasses} text-sm`} />
              <select value={logoState.fontFamily} onChange={e => handleStateChange('fontFamily', e.target.value)} className={`${formSelectClasses} text-sm`}>
                  {fontFamilies.map(font => <option key={font} value={font}>{font}</option>)}
              </select>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mt-2">Text Color</label>
              <input type="color" value={logoState.textColor} onChange={e => handleStateChange('textColor', e.target.value)} className="w-full h-10 p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer" />
              <label className="block text-sm text-gray-600 dark:text-gray-400 mt-2">Font Size: {logoState.fontSize}px</label>
              <input type="range" min="12" max="48" value={logoState.fontSize} onChange={e => handleStateChange('fontSize', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </ControlGroup>
          <ControlGroup label="Layout">
              <div className="flex justify-between gap-2">
                  <LayoutButton current={logoState.layout} value="top" onClick={() => handleStateChange('layout', 'top')}>Top</LayoutButton>
                  <LayoutButton current={logoState.layout} value="left" onClick={() => handleStateChange('layout', 'left')}>Left</LayoutButton>
                  <LayoutButton current={logoState.layout} value="right" onClick={() => handleStateChange('layout', 'right')}>Right</LayoutButton>
              </div>
          </ControlGroup>
          <button onClick={handleDownloadSVG} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
              Download as SVG
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center p-1 animate-fade-in">
        <header className="mb-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                AI Logo <span className="text-purple-500">Generator</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                Generate a unique logo with AI or craft your own with the manual editor.
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

const ControlGroup: FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-3">{label}</h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const LayoutButton: FC<{ current: string, value: string, onClick: () => void; children: React.ReactNode; }> = ({ current, value, onClick, children }) => (
    <button onClick={onClick} className={`flex-1 p-2 text-sm rounded-md transition-colors ${current === value ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
        {children}
    </button>
);

const LogoCanvas = React.forwardRef<SVGSVGElement, { state: ManualLogoState }>(({ state }, ref) => {
    const { icon, imageIcon, iconColor, iconSize, text, fontFamily, fontSize, textColor, layout } = state;
    const textProps = {
        fontFamily,
        fontSize: `${fontSize}px`,
        fill: textColor,
        dominantBaseline: "middle" as const,
        textAnchor: "middle" as const,
        fontWeight: 500,
    };
    
    const iconElement = imageIcon ? (
      <image href={imageIcon} x="0" y="0" width={iconSize} height={iconSize} />
    ) : (
      <svg x="0" y="0" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icons[icon as keyof typeof icons]}
      </svg>
    );

    let layoutConfig = {
      canvasWidth: 200,
      canvasHeight: 150,
      iconX: 100 - iconSize / 2,
      iconY: 30,
      textX: 100,
      textY: 80 + fontSize/2,
    };
    
    if(layout === 'left'){
        layoutConfig = {
           canvasWidth: 250,
           canvasHeight: 100,
           iconX: 30,
           iconY: 50 - iconSize / 2,
           textX: 80 + (fontSize * text.length / 4),
           textY: 50,
        }
    } else if (layout === 'right') {
         layoutConfig = {
           canvasWidth: 250,
           canvasHeight: 100,
           iconX: 150,
           iconY: 50 - iconSize / 2,
           textX: (fontSize * text.length / 4),
           textY: 50,
        }
    }

    return (
        <svg ref={ref} width={layoutConfig.canvasWidth} height={layoutConfig.canvasHeight} viewBox={`0 0 ${layoutConfig.canvasWidth} ${layoutConfig.canvasHeight}`} xmlns="http://www.w3.org/2000/svg">
            <g transform={`translate(${layoutConfig.iconX}, ${layoutConfig.iconY})`}>
                {iconElement}
            </g>
            <text x={layoutConfig.textX} y={layoutConfig.textY} {...textProps}>
                {sanitizeHTML(text)}
            </text>
        </svg>
    );
});

export default LogoGenerator;