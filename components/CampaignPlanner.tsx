import React, { useState, useCallback } from 'react';
import { ToastMessage } from './Dashboard';
import { CampaignIdea, generateMarketingCampaignIdeas, generateCampaignBanner } from '../services/geminiService';
import ImageCanvas from './ImageCanvas';
import LoadingSpinner from './LoadingSpinner';

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

interface CampaignPlannerProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

type AspectRatio = '16:9' | '1:1' | '9:16' | '4:3' | '3:4';

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500";
const AspectRatioButton: React.FC<{ label: string; value: AspectRatio; isActive: boolean; onClick: (val: AspectRatio) => void }> = ({ label, value, isActive, onClick }) => (
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


const CampaignPlanner: React.FC<CampaignPlannerProps> = ({ addToast }) => {
    const [productDescription, setProductDescription] = useState('');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [campaignIdeas, setCampaignIdeas] = useState<CampaignIdea[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

    const [selectedCampaign, setSelectedCampaign] = useState<CampaignIdea | null>(null);
    const [isLoadingBanner, setIsLoadingBanner] = useState(false);
    const [generatedBannerUrl, setGeneratedBannerUrl] = useState<string | null>(null);
    const [watermarkedBannerUrl, setWatermarkedBannerUrl] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState('');
    const [bannerAspectRatio, setBannerAspectRatio] = useState<AspectRatio>('16:9');

    const handleGenerateCampaigns = useCallback(async () => {
        if (!productDescription.trim()) {
            addToast('Please describe your product or service first.', 'error');
            return;
        }
        setIsLoadingCampaigns(true);
        setCampaignIdeas([]);
        setSelectedCampaign(null);
        setGeneratedBannerUrl(null);
        setWatermarkedBannerUrl(null);
        setWatermarkText('');
        const fileInput = document.getElementById('referenceImage') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
        try {
            const ideas = await generateMarketingCampaignIdeas(productDescription);
            setCampaignIdeas(ideas);
            addToast('Campaign ideas generated successfully!', 'success');
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to generate ideas', 'error');
        } finally {
            setIsLoadingCampaigns(false);
        }
    }, [productDescription, addToast]);

    const handleGenerateBanner = useCallback(async (campaign: CampaignIdea) => {
        setSelectedCampaign(campaign);
        setIsLoadingBanner(true);
        setGeneratedBannerUrl(null);
        setWatermarkedBannerUrl(null);
        setWatermarkText('');
        try {
            const url = await generateCampaignBanner(campaign, productDescription, bannerAspectRatio, referenceImage ?? undefined);
            setGeneratedBannerUrl(url);
            addToast('Banner generated successfully!', 'success');
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to generate banner', 'error');
        } finally {
            setIsLoadingBanner(false);
        }
    }, [productDescription, bannerAspectRatio, addToast, referenceImage]);

    const handleApplyWatermark = () => {
        if (!generatedBannerUrl || !watermarkText.trim()) {
            addToast('Please generate a banner and enter watermark text.', 'error');
            return;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = generatedBannerUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx!.drawImage(img, 0, 0);
            
            ctx!.font = 'bold 32px Inter';
            ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx!.textAlign = 'right';
            ctx!.textBaseline = 'bottom';
            
            ctx!.fillText(sanitizeHTML(watermarkText), canvas.width - 20, canvas.height - 20);
            setWatermarkedBannerUrl(canvas.toDataURL('image/jpeg'));
            addToast('Watermark applied!', 'success');
        };
    };

    const openUniquenessCheck = (url: string | null) => {
        if (!url) return;
        const searchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`;
        window.open(searchUrl, '_blank');
    };


    return (
        <div className="w-full h-full flex flex-col items-center p-1 animate-fade-in">
            <header className="mb-8 text-center">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    AI Marketing Campaign <span className="text-purple-500">Planner</span>
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                    Generate complete campaign ideas, target audiences, channel strategies, and visual banners—all powered by AI.
                </p>
            </header>

            <div className="w-full max-w-4xl space-y-8">
                {/* Step 1: Product Description */}
                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold mb-1">1. Describe Your Product or Service</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Provide a clear description to help the AI understand your offering.</p>
                    <div className="space-y-4">
                        <textarea
                            value={productDescription}
                            onChange={e => setProductDescription(e.target.value)}
                            className={`${formInputClasses} resize-none`}
                            rows={3}
                            placeholder="e.g., An eco-friendly subscription box for indoor plants, delivered monthly."
                            disabled={isLoadingCampaigns}
                        />
                        <div>
                            <label htmlFor="referenceImage" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Reference Image (Optional)</label>
                            <label htmlFor="referenceImage" className={`flex items-center justify-center w-full p-3 rounded-lg border-2 border-dashed focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-200 cursor-pointer ${referenceImage ? 'border-purple-500/50 bg-purple-500/10' : 'border-gray-300 dark:border-gray-700 hover:border-purple-500/50'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-2a2 2 0 012-2h12a2 2 0 012 2v2m-6-12h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{sanitizeHTML(referenceImage?.name) || 'Click to upload an image'}</span>
                            </label>
                            <input id="referenceImage" type="file" accept="image/*" className="hidden" onChange={e => setReferenceImage(e.target.files ? e.target.files[0] : null)} />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Provide an image to inspire the banner or have it edited by the AI.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateCampaigns}
                        disabled={isLoadingCampaigns || !productDescription.trim()}
                        className="w-full sm:w-auto mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center h-12 shadow-lg shadow-purple-500/20"
                    >
                        {isLoadingCampaigns ? <LoadingSpinner /> : 'Generate Campaign Ideas'}
                    </button>
                </div>

                {/* Step 2: Campaign Ideas */}
                {campaignIdeas.length > 0 && (
                    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">2. Choose a Campaign & Generate Banners</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {campaignIdeas.map((idea, index) => (
                                <div key={index} className={`p-4 rounded-lg border flex flex-col ${selectedCampaign?.name === idea.name ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{sanitizeHTML(idea.name)}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2"><strong>Goal:</strong> {sanitizeHTML(idea.goal)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2"><strong>Audience:</strong> {sanitizeHTML(idea.targetAudience)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4"><strong>Channels:</strong> {sanitizeHTML(idea.channels)}</p>
                                    <button
                                        onClick={() => handleGenerateBanner(idea)}
                                        disabled={isLoadingBanner}
                                        className="mt-auto w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                                    >
                                        {selectedCampaign?.name === idea.name && isLoadingBanner ? 'Generating...' : 'Generate Banner'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Step 3: Banner Generation */}
                {selectedCampaign && (
                     <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 animate-fade-in">
                         <h3 className="text-xl font-bold mb-4">3. Your Generated Banner</h3>
                         <div className="flex flex-col items-center">
                            <div className="flex flex-wrap justify-center items-center gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                                <AspectRatioButton label="Wide (16:9)" value="16:9" isActive={bannerAspectRatio === '16:9'} onClick={setBannerAspectRatio} />
                                <AspectRatioButton label="Square (1:1)" value="1:1" isActive={bannerAspectRatio === '1:1'} onClick={setBannerAspectRatio} />
                                <AspectRatioButton label="Story (9:16)" value="9:16" isActive={bannerAspectRatio === '9:16'} onClick={setBannerAspectRatio} />
                                <AspectRatioButton label="Portrait (3:4)" value="3:4" isActive={bannerAspectRatio === '3:4'} onClick={setBannerAspectRatio} />
                                <AspectRatioButton label="Landscape (4:3)" value="4:3" isActive={bannerAspectRatio === '4:3'} onClick={setBannerAspectRatio} />
                            </div>
                             <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">Select an aspect ratio and click "Generate Banner" on a campaign above. The AI will use the campaign details to create a visual.</p>

                            <ImageCanvas isLoading={isLoadingBanner} imageUrl={watermarkedBannerUrl || generatedBannerUrl} aspectRatio={bannerAspectRatio} />
                            
                            {generatedBannerUrl && (
                                <>
                                <div className="w-full max-w-xl mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Watermark</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="e.g., YourBrand.com" className={formInputClasses} />
                                            <button onClick={handleApplyWatermark} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Apply</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Intellectual Property</label>
                                        <button onClick={() => openUniquenessCheck(watermarkedBannerUrl || generatedBannerUrl)} className="w-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                            Check Uniqueness (Google Lens)
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">This is not legal advice. The uniqueness check is a tool to help you research similar images.</p>
                                    </div>
                                </div>
                                <a
                                    href={watermarkedBannerUrl || generatedBannerUrl}
                                    download={`${sanitizeHTML(selectedCampaign.name).replace(/\s+/g, '_')}-banner.jpeg`}
                                    className="block w-full max-w-xl text-center mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Download Banner
                                </a>
                                </>
                            )}
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default CampaignPlanner;