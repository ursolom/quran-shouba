// constants/reciters.ts

export interface Reciter {
  id: string;
  name: string;
  baseUrl: string;
  // true: page numbers are zero-padded to 3 digits (001–604)
  // false: page numbers are plain numbers (1–604)
  padded: boolean;
  image?: string; // URL for the reciter's photo
}

export const reciters: Reciter[] = [
  {
    id: "qari_1",
    name: "Abd Elrasheed Sofy",
    baseUrl:
      "https://archive.org/download/abd-alrasheed--soofy-rewayt-sho3bah-3n-3aasem---604-part-full-quran-604-page--/",
    padded: false,
    image: "https://i.pravatar.cc/100",
  },
];

// Default reciter for initial testing
export const defaultReciterId = reciters[0].id;
