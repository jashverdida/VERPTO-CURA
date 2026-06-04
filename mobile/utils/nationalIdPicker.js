import * as ImagePicker from 'expo-image-picker';

export const pickNationalIDImage = async (side) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        base64: asset.base64,
        fileName: `national_id_${side}_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      };
    }
    return null;
  } catch (error) {
    console.error(`Error picking National ID ${side} image:`, error);
    throw error;
  }
};

export const validateImageData = (imageData) => {
  if (!imageData) return false;
  if (!imageData.uri) return false;
  if (!imageData.base64) return false;
  return true;
};

export const getImagePreviewSize = () => ({
  width: 80,
  height: 80,
});
