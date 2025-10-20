import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable is not set. The application will not work without it.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export interface ThumbnailOptions {
  title: string;
  tagline: string;
  background: string;
  logoText: string;
}

const callGenerateImages = async (prompt: string, aspectRatio: '16:9' | '1:1', numberOfImages: number = 1): Promise<string[]> => {
   try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } else {
      throw new Error("No image was generated. The response might have been blocked due to safety policies.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        if (error.message.includes('SAFETY')) {
             throw new Error("The prompt was blocked by safety settings. Please try a different prompt.");
        }
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
}

export const generateThumbnail = async (options: ThumbnailOptions): Promise<string> => {
  const { title, tagline, background, logoText } = options;
  if (!title && !background) {
    throw new Error("Title and background prompt cannot be empty.");
  }

  const prompt = `Create a visually stunning social media thumbnail with a 16:9 aspect ratio. The theme is: "${background}". The main title text, in a bold, modern, and highly visible font, must say: "${title}". ${tagline ? `Include a smaller subtitle below the main title that says: "${tagline}".` : ''} ${logoText ? `In a corner (e.g., top left or top right), add a simple, clean, and professional logo that incorporates the text or initials: "${logoText}".` : ''} The overall composition should be balanced, eye-catching, and suitable for a social media platform like YouTube. Avoid clutter and ensure all text is legible.`;
  
  const images = await callGenerateImages(prompt, '16:9', 1);
  return images[0];
};

export const generateLogo = async (prompt: string): Promise<string> => {
  if (!prompt) {
    throw new Error("Logo prompt cannot be empty.");
  }

  const fullPrompt = `Create a modern, simple, and professional logo with a 1:1 aspect ratio. The logo should be on a clean, solid, or transparent background. The concept is: "${prompt}". The logo must be in a vector-like, graphic style. Avoid photorealism, complex gradients, and excessive detail. The design should be iconic, memorable, and easily scalable.`;
  
  const images = await callGenerateImages(fullPrompt, '1:1', 1);
  return images[0];
};
