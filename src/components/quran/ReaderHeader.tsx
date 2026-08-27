import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReaderStore } from "@/store/reader";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "@/constants/colors";

export default function ReaderHeader() {
  const showOverlay = useReaderStore((s) => s.showOverlay);

  if (!showOverlay) return null;

  const btnStyle = {
    width: 44,
    height: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,

    backgroundColor: `rgba(15, 157, 88, ${colors.opacity.button})`,

    borderRadius: 22,

    elevation: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderStartStartRadius: 0,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  };

  return (
    <SafeAreaView
      edges={["top"]}
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
      }}
    >
      <View
        style={{
          width: "100%",
          backgroundColor: `rgba(92, 123, 55, ${colors.opacity.header})`,

          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",

          paddingHorizontal: 20,
          paddingVertical: 12,

          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Pressable style={btnStyle}>
          <Feather name="menu" size={20} color={colors.white} />
        </Pressable>

        <Pressable style={btnStyle}>
          <Ionicons name="navigate" size={20} color={colors.white} />
        </Pressable>

        <Pressable style={btnStyle}>
          <Feather name="search" size={20} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
