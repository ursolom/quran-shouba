import "@/global.css";
import { StatusBar, View } from "react-native";
import QuranReader from "@/components/quran/QuranReader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-quran-bg">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <QuranReader />
    </SafeAreaView>
  );
}
