import { useCallback } from "react";
import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReaderStore } from "@/store/reader";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

export default function ReaderHeader() {
  const showOverlay = useReaderStore(useCallback((s) => s.showOverlay, []));

  if (!showOverlay) return null;

  const btnStyle = {
    backgroundColor: "#0F9D587A", // bright green matching screenshot
    width: 44,
    height: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    // Leaf shape
    borderTopLeftRadius: 2,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        pointerEvents: "box-none",
      }}
    >
      <View
        style={{
          flexDirection: "row-reverse", // RTL
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      >
        {/* Right (Menu) */}
        <Pressable style={btnStyle}>
          <Feather name="menu" size={20} color="#fff" />
        </Pressable>

        {/* Middle (Navigate) */}
        <Pressable style={btnStyle}>
          <Ionicons
            name="navigate"
            size={20}
            color="#fff"
            style={{ transform: [{ rotate: "45deg" }, { translateX: -2 }] }}
          />
        </Pressable>

        {/* Left (Search) */}
        <Pressable style={btnStyle}>
          <Feather name="search" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
