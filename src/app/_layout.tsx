import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import "@/global.css";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="qoran.db"
      assetSource={{
        assetId: require("../../assets/database/quran.db"),
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </SQLiteProvider>
  );
}
