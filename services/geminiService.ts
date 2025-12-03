
import { supabase } from './supabaseClient';

export const generateHairstyle = async (prompt: string, image: File): Promise<string> => {
  try {
    // Convert file to base64
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    const base64Image = await base64EncodedDataPromise;

    // Call the secure Edge Function
    const { data, error } = await supabase.functions.invoke('generate-hairstyle', {
      body: {
        prompt,
        image: base64Image
      }
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw new Error(error.message || 'Failed to generate hairstyle');
    }

    if (!data || !data.image) {
      throw new Error('No image returned from server');
    }

    return data.image;

  } catch (error) {
    console.error("Error generating hairstyle:", error);
    throw new Error("Failed to generate AI hairstyle preview. Please try again.");
  }
};