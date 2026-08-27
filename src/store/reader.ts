import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SQLite from "expo-sqlite";
import { quranPages } from "@/data/images";

export const TOTAL_PAGES = quranPages.length;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("quran_settings.db").then(
      async (d) => {
        await d.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);
        return d;
      },
    );
  }
  return dbPromise;
}

function createDebouncedSQLiteStorage() {
  const baseStorage = createJSONStorage(() => ({
    getItem: async (name: string): Promise<string | null> => {
      try {
        const database = await getDb();
        const row = await database.getFirstAsync<{ value: string }>(
          "SELECT value FROM settings WHERE key = ?",
          [name],
        );
        return row ? row.value : null;
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      // The actual write is debounced; we schedule it.
      scheduleWrite(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        const database = await getDb();
        await database.runAsync("DELETE FROM settings WHERE key = ?", [name]);
      } catch (error) {
        console.warn("Failed to remove reader state:", error);
      }
    },
  }));

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingKey: string | null = null;
  let pendingValue: string | null = null;

  const scheduleWrite = (key: string, value: string) => {
    pendingKey = key;
    pendingValue = value;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      if (pendingKey && pendingValue !== null) {
        try {
          const database = await getDb();
          await database.runAsync(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            [pendingKey, pendingValue],
          );
        } catch (error) {
          console.warn("Failed to save reader state:", error);
        } finally {
          pendingKey = null;
          pendingValue = null;
          debounceTimer = null;
        }
      }
    }, 500);
  };

  return baseStorage;
}

interface PersistedData {
  currentPageIndex: number;
  bookmarks: number[];
}

interface ReaderState extends PersistedData {
  loaded: boolean;
  showOverlay: boolean;
  goToPage: (pageNumber: number) => void;
  toggleBookmark: (pageNumber: number) => void;
  toggleOverlay: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      currentPageIndex: 0,
      bookmarks: [],
      loaded: false,
      showOverlay: true,

      goToPage: (pageNumber: number) => {
        const index = Math.max(0, Math.min(pageNumber, TOTAL_PAGES - 1));
        set({ currentPageIndex: index });
      },

      toggleBookmark: (pageNumber: number) => {
        set((state) => {
          const next = state.bookmarks.includes(pageNumber)
            ? state.bookmarks.filter((p) => p !== pageNumber)
            : [...state.bookmarks, pageNumber];
          return { bookmarks: next };
        });
      },

      toggleOverlay: () => {
        set((state) => ({ showOverlay: !state.showOverlay }));
      },
    }),
    {
      name: "quran-reader",
      storage: createDebouncedSQLiteStorage(),
      partialize: (state): PersistedData => ({
        currentPageIndex: state.currentPageIndex,
        bookmarks: state.bookmarks,
      }),
      onRehydrateStorage: () => {
        return () => {
          useReaderStore.setState({ loaded: true });
        };
      },
    },
  ),
);
