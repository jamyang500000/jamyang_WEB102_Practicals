import supabase from '@/lib/supabase';

// Generate a unique file name to avoid collisions in the bucket
function generateUniqueFileName(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const ext = originalName.includes('.')
    ? originalName.substring(originalName.lastIndexOf('.'))
    : '';
  return `${timestamp}-${random}${ext}`;
}

const uploadService = {
  /**
   * Upload a file directly from the browser to a Supabase Storage bucket.
   * @param {string} bucketName  'videos' or 'thumbnails'
   * @param {File}   file        The File object from <input type="file" />
   * @param {string} [userId]    Optional user id to namespace the file path (e.g. user-12/...)
   * @returns {{ publicUrl: string, storagePath: string }}
   */
  async uploadToCloud(bucketName, file, userId = null) {
    if (!file) {
      throw new Error('No file provided to uploadToCloud');
    }

    const fileName = generateUniqueFileName(file.name);
    const storagePath = userId ? `user-${userId}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) {
      console.error(`Supabase upload error (${bucketName}):`, error);
      throw new Error(error.message || `Failed to upload to ${bucketName}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      publicUrl: urlData.publicUrl,
      storagePath: data.path,
    };
  },
};

export default uploadService;
