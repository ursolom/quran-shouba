import "@/global.css";
import { StatusBar, View } from "react-native";
import QuranPageCarousel from "@/components/QuranPageCarousel";

export default function App() {
  return (
    <View className="flex-1 bg-quran-bg">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <QuranPageCarousel />
    </View>
  );
}