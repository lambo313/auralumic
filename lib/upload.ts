export async function uploadFile(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export function isValidFileType(file: File, allowedTypes: string[]) {
  return allowedTypes.includes(file.type);
}

export function isValidFileSize(file: File, maxSize: number) {
  return file.size <= maxSize;
}

// Helper function to format file size
export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Constants for file upload limits
export const FILE_UPLOAD_CONFIG = {
  maxSize: Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB default
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};
