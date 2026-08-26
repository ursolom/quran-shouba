import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider
        databaseName="qoran.db"
        assetSource={{
          assetId: require("../../assets/database/quran.db"),
        }}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
