import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'national-ids';

export const uploadNationalIDImages = async (frontImage, backImage) => {
  try {
    if (!frontImage || !backImage) {
      throw new Error('Both front and back images are required');
    }

    console.log('Starting National ID upload process...');

    // Upload front image
    console.log('Uploading front image:', frontImage.fileName);
    const frontUrl = await uploadImageToStorage(frontImage);

    // Upload back image
    console.log('Uploading back image:', backImage.fileName);
    const backUrl = await uploadImageToStorage(backImage);

    console.log('Both images uploaded successfully');
    return {
      national_id_front_url: frontUrl,
      national_id_back_url: backUrl,
    };
  } catch (error) {
    console.error('Error uploading National ID images:', error);
    throw error;
  }
};

const uploadImageToStorage = async (imageData) => {
  try {
    if (!imageData.base64) {
      throw new Error('Base64 data is missing from image');
    }

    console.log(`Preparing image upload: ${imageData.fileName}`);

    // Upload base64 string directly to Supabase (React Native compatible)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(imageData.fileName, imageData.base64, {
        contentType: imageData.mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`Upload failed for ${imageData.fileName}:`, error);
      throw new Error(`Failed to upload ${imageData.fileName}: ${error.message}`);
    }

    console.log(`Upload successful, path: ${data.path}`);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    const publicUrl = urlData.publicUrl;
    console.log(`Public URL: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading image:`, error);
    throw error;
  }
};

export const deleteNationalIDImage = async (fileName) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting National ID image:', error);
    throw error;
  }
};
