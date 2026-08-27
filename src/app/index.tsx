import QuranReader from "@/components/quran/QuranReader";
import ReaderHeader from "@/components/quran/ReaderHeader";
import "@/global.css";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-quran-bg">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ReaderHeader />

      <QuranReader />
    </SafeAreaView>
  );
}
