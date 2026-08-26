import { useEffect, useState, useCallback, useRef } from "react";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("quran_settings.db");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }
  return db;
}

export function usePageStorage() {
  const [lastPage, setLastPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const bookmarksRef = useRef<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const database = await getDb();

        const lastPageRow = await database.getFirstAsync<{ value: string }>(
          "SELECT value FROM settings WHERE key = ?",
          ["lastPage"]
        );
        if (lastPageRow) {
          setLastPage(parseInt(lastPageRow.value, 10));
        }

        const bookmarksRow = await database.getFirstAsync<{ value: string }>(
          "SELECT value FROM settings WHERE key = ?",
          ["bookmarks"]
        );
        if (bookmarksRow) {
          const parsed = JSON.parse(bookmarksRow.value);
          setBookmarks(parsed);
          bookmarksRef.current = parsed;
        }
      } catch (error) {
        console.warn("Failed to load page storage:", error);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const saveLastPage = useCallback(async (page: number) => {
    setLastPage(page);
    try {
      const database = await getDb();
      await database.runAsync(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        ["lastPage", String(page)]
      );
    } catch (error) {
      console.warn("Failed to save last page:", error);
    }
  }, []);

  const toggleBookmark = useCallback(async (page: number) => {
    const current = bookmarksRef.current;
    const next = current.includes(page)
      ? current.filter((p) => p !== page)
      : [...current, page];

    bookmarksRef.current = next;
    setBookmarks(next);

    try {
      const database = await getDb();
      await database.runAsync(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        ["bookmarks", JSON.stringify(next)]
      );
    } catch (error) {
      console.warn("Failed to save bookmark:", error);
    }
  }, []);

  return { lastPage, bookmarks, loaded, saveLastPage, toggleBookmark };
}
