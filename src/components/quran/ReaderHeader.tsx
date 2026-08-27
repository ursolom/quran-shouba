import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReaderStore } from "@/store/reader";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

export default function ReaderHeader() {
  const showOverlay = useReaderStore(useCallback((s) => s.showOverlay, []));

  if (!showOverlay) return null;

  return (
    <SafeAreaView
      edges={["top"]}
      className="absolute top-0 left-0 right-0 bg-quran-bg border-b border-white/20 px-5 py-4"
      style={{ backgroundColor: "rgba(92, 123, 55, 0.95)" }}
      pointerEvents="box-none"
    >
      <View className="flex-row-reverse justify-between items-center bg-[#0F9D587A] rounded-b-2xl border border-white/20 px-4 py-3">
        {/* Right (Menu) */}
        <Pressable className="w-11 h-11 items-center justify-center bg-[#0F9D587A] rounded-t-sm rounded-b-2xl">
          <Feather name="menu" size={20} color="#fff" />
        </Pressable>

        {/* Middle (Navigate) */}
        <Pressable className="w-11 h-11 items-center justify-center bg-[#0F9D587A] rounded-t-sm rounded-b-2xl">
          <Ionicons
            name="navigate"
            size={20}
            color="#fff"
            style={{ transform: [{ rotate: "45deg" }, { translateX: -2 }] }}
          />
        </Pressable>

        {/* Left (Search) */}
        <Pressable className="w-11 h-11 items-center justify-center bg-[#0F9D587A] rounded-t-sm rounded-b-2xl">
          <Feather name="search" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
