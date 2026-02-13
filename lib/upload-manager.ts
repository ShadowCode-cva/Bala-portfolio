/**
 * Handles chunked file uploads with progress tracking
 */

export interface UploadProgress {
  fileName: string;
  bytesUploaded: number;
  totalBytes: number;
  percentComplete: number;
  uploadSpeed: number;
  timeRemaining: number;
  status: 'pending' | 'uploading' | 'complete' | 'error' | 'paused';
  error?: string;
}

export interface UploadConfig {
  chunkSize: number;
  maxRetries: number;
  onProgress: (progress: UploadProgress) => void;
}

const DEFAULT_CONFIG: UploadConfig = {
  chunkSize: 5 * 1024 * 1024,
  maxRetries: 3,
  onProgress: () => {}
};

export async function uploadFileChunked(
  file: File,
  endpoint: string,
  config: Partial<UploadConfig> = {}
): Promise<{ success: boolean; path?: string; error?: string }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const totalChunks = Math.ceil(file.size / finalConfig.chunkSize);
  let uploadedBytes = 0;
  const startTime = Date.now();

  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * finalConfig.chunkSize;
      const end = Math.min(start + finalConfig.chunkSize, file.size);
      const chunk = file.slice(start, end);

      let lastError;
      for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
        try {
          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('chunkIndex', chunkIndex.toString());
          formData.append('totalChunks', totalChunks.toString());
          formData.append('fileName', file.name);

          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
          }

          uploadedBytes = end;
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const uploadSpeed = uploadedBytes / elapsedSeconds;
          const remainingBytes = file.size - uploadedBytes;
          const timeRemaining = remainingBytes / uploadSpeed;

          finalConfig.onProgress({
            fileName: file.name,
            bytesUploaded: uploadedBytes,
            totalBytes: file.size,
            percentComplete: Math.round((uploadedBytes / file.size) * 100),
            uploadSpeed,
            timeRemaining,
            status: 'uploading'
          });

          break;
        } catch (error) {
          lastError = error;
          if (attempt < finalConfig.maxRetries - 1) {
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          }
        }
      }

      if (lastError && uploadedBytes < end) {
        throw new Error(`Failed to upload chunk ${chunkIndex + 1}/${totalChunks}`);
      }
    }

    finalConfig.onProgress({
      fileName: file.name,
      bytesUploaded: file.size,
      totalBytes: file.size,
      percentComplete: 100,
      uploadSpeed: file.size / ((Date.now() - startTime) / 1000),
      timeRemaining: 0,
      status: 'complete'
    });

    return { success: true };
  } catch (error) {
    finalConfig.onProgress({
      fileName: file.name,
      bytesUploaded: uploadedBytes,
      totalBytes: file.size,
      percentComplete: Math.round((uploadedBytes / file.size) * 100),
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'error',
      error: (error as Error).message
    });

    return {
      success: false,
      error: (error as Error).message
    };
  }
}

export function validateFileBeforeUpload(
  file: File,
  isVideo: boolean
): { valid: boolean; error?: string } {
  const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
  const allowedTypes = isVideo
    ? ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
    : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    const sizeGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);
    const maxGB = (maxSize / (1024 * 1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${sizeGB}GB). Maximum is ${maxGB}GB.`
    };
  }

  const isCorrectType = allowedTypes.includes(file.type) || 
    file.type.startsWith(isVideo ? 'video/' : 'image/');
  
  if (!isCorrectType) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed: ${isVideo ? 'MP4, WebM, MOV' : 'JPG, PNG, GIF, WebP'}`
    };
  }

  return { valid: true };
}