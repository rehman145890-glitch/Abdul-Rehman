import { GoogleGenAI, Modality, Type } from "@google/genai";

const getAi = () => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable is not set. Please select an API key.");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}


export interface ThumbnailOptions {
  title: string;
  tagline: string;
  background: string;
  logoText: string;
}

export interface CampaignIdea {
    name: string;
    goal: string;
    targetAudience: string;
    channels: string;
}


const handleApiError = (error: unknown) => {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('Requested entity was not found')) {
            window.dispatchEvent(new Event('apiKeyError'));
            throw new Error('Your API key is invalid. Please select a new one.');
        }
        if (error.message.includes('SAFETY')) {
             throw new Error("The prompt was blocked by safety settings. Please try a different prompt.");
        }
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the API.");
}

export const generateThumbnail = async (options: ThumbnailOptions, aspectRatio: '16:9' | '1:1' | '9:16', referenceImage?: File): Promise<string> => {
  const { title, tagline, background, logoText } = options;
  const ai = getAi();
  
  const textPrompt = `CRITICAL LEGAL INSTRUCTION: Generate a completely unique, novel, and original visual design for a social media thumbnail with a ${aspectRatio} aspect ratio. The design MUST NOT bear any resemblance whatsoever to existing copyrighted material, well-known characters, or company trademarks. It must be a new artistic creation, fully owned by the user.
  
  Theme: "${background}".
  Main Title Text (must be prominent, bold, modern, and highly visible): "${title}".
  ${tagline ? `Subtitle Text (smaller, below the main title): "${tagline}".` : ''}
  ${logoText ? `Logo Element: In a corner, include a simple, clean, professional logo icon incorporating the text or initials: "${logoText}".` : ''}
  
  The overall composition must be balanced, professional, and eye-catching for platforms like YouTube. Ensure all text is perfectly legible and the style is modern. The final output must be an original work with no legal encumbrances.`;
  
  try {
    if (referenceImage) {
      // Image editing with gemini-2.5-flash-image
      const imagePart = await fileToGenerativePart(referenceImage);
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
              parts: [
                  imagePart,
                  { text: `Edit this image based on the following instructions, maintaining a ${aspectRatio} aspect ratio. The final output must be a new, unique, and original creation, and MUST NOT resemble any existing copyrights or trademarks. Instructions: ${textPrompt}` },
              ],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
      });
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
      }
      throw new Error("Image editing failed to produce an image.");

    } else {
      // Text-to-image generation with imagen
      if (!title && !background) throw new Error("Title and background prompt cannot be empty.");
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: textPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });
      if (response.generatedImages && response.generatedImages.length > 0) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      } else {
        throw new Error("No image was generated. The response might have been blocked.");
      }
    }
  } catch (error) {
    handleApiError(error);
    // This line is for TypeScript's benefit, as handleApiError always throws.
    throw new Error("Image generation failed.");
  }
};

export const generateLogo = async (prompt: string, referenceImage?: File): Promise<string> => {
  if (!prompt.trim() && !referenceImage) {
    throw new Error("Logo prompt or reference image cannot be empty.");
  }
  const ai = getAi();
  
  try {
     if (referenceImage) {
        const imagePart = await fileToGenerativePart(referenceImage);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: `CRITICAL LEGAL INSTRUCTION: Transform this image into a completely unique and original logo with a 1:1 aspect ratio. The final design must be a new creation and MUST NOT bear any resemblance to existing company logos, trademarks, or copyrighted artwork. The concept is: "${prompt}". The logo must be in a modern, simple, vector-like, graphic style. Avoid photorealism.` },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("Logo editing failed to produce an image.");

     } else {
        const fullPrompt = `CRITICAL LEGAL INSTRUCTION: Generate a completely unique, novel, and professional logo with a 1:1 aspect ratio. The logo MUST NOT resemble any existing company logos, trademarks, or copyrighted artwork. It must be a new artistic creation, fully owned by the user.
        
        The logo should be on a clean, solid background.
        The concept is: "${prompt}".
        The required style is modern, simple, vector-like, and graphic. Avoid photorealism, complex gradients, and excessive detail. The design must be iconic, memorable, and easily scalable.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        } else {
            throw new Error("No logo was generated. The response might have been blocked.");
        }
     }
  } catch (error) {
    handleApiError(error);
    throw new Error("Logo generation failed.");
  }
};

export const generateLeanCanvasSuggestions = async (section: string, businessIdea: string): Promise<string[]> => {
    if (!businessIdea.trim()) throw new Error("Please describe your business idea first.");
    const ai = getAi();
    const prompt = `My business idea is: "${businessIdea}". Please provide 3 concise, actionable suggestions for the "${section}" section of a Lean Canvas. Present them as a simple list.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.split('\n').map(s => s.replace(/^- \d+\. /, '').trim()).filter(s => s);
    } catch(error) {
        handleApiError(error);
        throw new Error("Failed to get suggestions.");
    }
};

export const generateCampaignBanner = async (campaign: CampaignIdea, productDescription: string, aspectRatio: '16:9' | '1:1' | '9:16' | '4:3' | '3:4', referenceImage?: File): Promise<string> => {
    const ai = getAi();
    
    const textPrompt = `CRITICAL LEGAL INSTRUCTION: Create a completely unique and original marketing banner for a social media campaign, with a ${aspectRatio} aspect ratio. The design MUST be novel and MUST NOT infringe on any existing copyrights, trademarks, or intellectual property. It must be a new creation, fully owned by the user.

    Product Description: "${productDescription}".
    Campaign Name: "${campaign.name}".
    Campaign Goal: "${campaign.goal}".
    Target Audience: "${campaign.targetAudience}".
    Primary Channels: "${campaign.channels}".

    The banner must prominently feature the campaign name: "${campaign.name}". The design should be modern, professional, eye-catching, and appropriate for the target audience. The composition must be clean, balanced, and effective for digital advertising. Ensure all text is highly legible. The final image must be an original creation with no legal encumbrances.`;

    try {
        if (referenceImage) {
            const imagePart = await fileToGenerativePart(referenceImage);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        imagePart,
                        { text: `Edit this image into a professional marketing banner, maintaining a ${aspectRatio} aspect ratio. The final design must be a new, unique creation and MUST NOT resemble any existing copyrights or trademarks. Use the following campaign details for inspiration and content: ${textPrompt}` },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            throw new Error("Banner editing failed to produce an image.");

        } else {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: textPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });
            if (response.generatedImages && response.generatedImages.length > 0) {
                return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
            } else {
                throw new Error("No banner was generated. The response might have been blocked by safety settings.");
            }
        }
    } catch (error) {
        handleApiError(error);
        // This line is for TypeScript's benefit, as handleApiError always throws.
        throw new Error("Banner generation failed.");
    }
};

export const generateMarketingCampaignIdeas = async (productDescription: string): Promise<CampaignIdea[]> => {
    if (!productDescription.trim()) throw new Error("Please describe your product or service first.");
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 3 distinct marketing campaign ideas for a product described as: "${productDescription}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        campaigns: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    goal: { type: Type.STRING },
                                    targetAudience: { type: Type.STRING },
                                    channels: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json.campaigns;
    } catch(error) {
        handleApiError(error);
        throw new Error("Failed to generate campaign ideas.");
    }
};