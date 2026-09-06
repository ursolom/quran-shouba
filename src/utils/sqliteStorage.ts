// utils/sqliteStorage.ts
import * as SQLite from "expo-sqlite";
import { createJSONStorage } from "zustand/middleware";

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

export function createDebouncedSQLiteStorage() {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingKey: string | null = null;
  let pendingValue: string | null = null;

  const scheduleWrite = (key: string, value: string) => {
    pendingKey = key;
    pendingValue = value;
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      if (pendingKey && pendingValue !== null) {
        try {
          const database = await getDb();
          await database.runAsync(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            [pendingKey, pendingValue],
          );
        } catch (error) {
          console.warn("Failed to save state to SQLite:", error);
        } finally {
          pendingKey = null;
          pendingValue = null;
          debounceTimer = null;
        }
      }
    }, 500);
  };

  return createJSONStorage(() => ({
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
      scheduleWrite(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        const database = await getDb();
        await database.runAsync("DELETE FROM settings WHERE key = ?", [name]);
      } catch (error) {
        console.warn("Failed to remove state from SQLite:", error);
      }
    },
  }));
}
