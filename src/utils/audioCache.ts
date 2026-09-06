// utils/audioCache.ts

import * as FileSystem from "expo-file-system/legacy";

const AUDIO_DIR = `${FileSystem.documentDirectory}quran_audio/`;

/**
 * Make sure the audio directory exists.
 */
export async function ensureAudioDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, {
      intermediates: true,
    });
  }
}

/**
 * Download the audio file only if it doesn't already exist.
 *
 * Important:
 * This function is NOT called automatically.
 * It only runs when the user presses Play.
 */
export async function getOrDownloadAudio(
  remoteUrl: string,
  fileName: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  await ensureAudioDirectory();

  const localUri = `${AUDIO_DIR}${fileName}`;

  const fileInfo = await FileSystem.getInfoAsync(localUri);

  /**
   * File already exists on device.
   * Do not download again.
   */
  if (fileInfo.exists && !fileInfo.isDirectory) {
    onProgress?.(1);
    return localUri;
  }

  onProgress?.(0);

  const downloadResumable = FileSystem.createDownloadResumable(
    remoteUrl,
    localUri,
    {},
    (downloadProgress) => {
      const total =
        downloadProgress.totalBytesExpectedToWrite;

      if (total > 0) {
        const progress =
          downloadProgress.totalBytesWritten / total;

        onProgress?.(progress);
      }
    },
  );

  try {
    const result = await downloadResumable.downloadAsync();

    if (!result?.uri) {
      throw new Error("Failed to download audio file");
    }

    onProgress?.(1);

    return result.uri;
  } catch (error) {
    /**
     * Delete incomplete/corrupted file.
     */
    try {
      const info = await FileSystem.getInfoAsync(localUri);

      if (info.exists) {
        await FileSystem.deleteAsync(localUri, {
          idempotent: true,
        });
      }
    } catch {
      // Ignore cleanup errors.
    }

    throw error;
  }
}

/**
 * Check whether a file is already cached.
 */
export async function isAudioCached(
  fileName: string,
): Promise<boolean> {
  await ensureAudioDirectory();

  const localUri = `${AUDIO_DIR}${fileName}`;

  const fileInfo = await FileSystem.getInfoAsync(localUri);

  return fileInfo.exists && !fileInfo.isDirectory;
}

/**
 * Get local URI if cached.
 */
export async function getCachedAudioUri(
  fileName: string,
): Promise<string | null> {
  await ensureAudioDirectory();

  const localUri = `${AUDIO_DIR}${fileName}`;

  const fileInfo = await FileSystem.getInfoAsync(localUri);

  if (fileInfo.exists && !fileInfo.isDirectory) {
    return localUri;
  }

  return null;
}

/**
 * Delete one cached audio file.
 */
export async function deleteCachedAudio(
  fileName: string,
): Promise<void> {
  await ensureAudioDirectory();

  const localUri = `${AUDIO_DIR}${fileName}`;

  await FileSystem.deleteAsync(localUri, {
    idempotent: true,
  });
}

/**
 * Delete the entire Quran audio cache.
 */
export async function clearAudioCache(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);

  if (dirInfo.exists) {
    await FileSystem.deleteAsync(AUDIO_DIR, {
      idempotent: true,
    });
  }
}