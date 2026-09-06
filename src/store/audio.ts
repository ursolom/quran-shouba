// store/audio.ts
import { defaultReciterId } from "@/data/reciters";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDebouncedSQLiteStorage } from "@/utils/sqliteStorage";

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  selectedReciterId: string;
  isLoading: boolean;
  downloadProgress: number; // من 0 إلى 1

  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: number) => void;
  setReciter: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  setDownloadProgress: (progress: number) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      speed: 1.0,
      selectedReciterId: defaultReciterId,
      isLoading: false,
      downloadProgress: 0,

      setPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setSpeed: (speed) => set({ speed }),
      setReciter: (id) => set({ selectedReciterId: id }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setDownloadProgress: (progress) => set({ downloadProgress: progress }),
      reset: () =>
        set({
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          isLoading: false,
          downloadProgress: 0,
        }),
    }),
    {
      name: "audio-settings",
      storage: createDebouncedSQLiteStorage(),
      partialize: (state) => ({
        selectedReciterId: state.selectedReciterId,
        speed: state.speed,
      }),
    },
  ),
);
