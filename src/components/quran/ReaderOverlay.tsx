import { useCallback, useState, useEffect } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReaderStore, TOTAL_PAGES } from "@/store/reader";
import JumpToPageDialog from "@/components/JumpToPageDialog";
import { Image } from "expo-image";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

interface ReaderOverlayProps {
  onJumpToPage: (index: number) => void;
}

export default function ReaderOverlay({ onJumpToPage }: ReaderOverlayProps) {
  const { width } = useWindowDimensions();
  const showOverlay = useReaderStore(useCallback((s) => s.showOverlay, []));
  const currentPageIndex = useReaderStore(
    useCallback((s) => s.currentPageIndex, []),
  );

  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // --- Slider Logic ---
  const sliderWidth = width - 40; // 20 padding on each side
  const progress = useSharedValue(0);

  // Sync slider with current page when not dragging
  useEffect(() => {
    if (!isDraggingState) {
      const ratio = currentPageIndex / Math.max(1, TOTAL_PAGES - 1);
      progress.value = 1 - ratio;
    }
  }, [currentPageIndex, isDraggingState, progress]);

  const handleSliderRelease = useCallback((val: number) => {
    // val is 0..1 from left to right.
    // In RTL, val=1 is page 0, val=0 is max page.
    const ratio = 1 - val;
    const targetPage = Math.round(ratio * (TOTAL_PAGES - 1));
    onJumpToPage(targetPage);
  }, [onJumpToPage]);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(setIsDraggingState)(true);
      const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
      progress.value = clampedX / sliderWidth;
    })
    .onUpdate((e) => {
      const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
      progress.value = clampedX / sliderWidth;
    })
    .onEnd(() => {
      runOnJS(setIsDraggingState)(false);
      runOnJS(handleSliderRelease)(progress.value);
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: progress.value * sliderWidth - 10 }], // -10 to center the 20px thumb
    };
  });

  const animatedTrackStyle = useAnimatedStyle(() => {
    return {
      width: progress.value * sliderWidth,
    };
  });

  if (!showOverlay) return null;

  // Temporary mock data for UI
  const juzText = "الجزء : 1";
  const surahText = "الغلاف";

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: "box-none",
        justifyContent: "flex-end",
      }}
    >
      {/* Bottom Controls */}
      <View
        style={{
          backgroundColor: "rgba(92, 123, 55, 0.95)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        {/* Top Row: Texts */}  
        <View
          style={{
            flexDirection: "row-reverse", // RTL
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>{juzText}</Text>
          <Pressable onPress={() => setShowJumpDialog(true)}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>{currentPageIndex}</Text>
          </Pressable>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>{surahText}</Text>
        </View>

        {/* Middle Row: Controls & Reciter */}
        <View
          style={{
            flexDirection: "row-reverse", // RTL
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {/* Reciter Selector */}
          <Pressable
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#fff",
              borderRadius: 30,
              paddingLeft: 15,
              paddingRight: 5,
              paddingVertical: 5,
              gap: 10,
            }}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }} // Placeholder
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              ياسر القرشي
            </Text>
          </Pressable>

          {/* Playback Controls */}
          <View style={{ flexDirection: "row-reverse", gap: 15, alignItems: "center" }}>
            <Pressable style={{ alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#fff", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 16 }}>▶</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>تشغيل</Text>
            </Pressable>

            <Pressable style={{ alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#fff", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 14 }}>■</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>إيقاف</Text>
            </Pressable>

            <Pressable style={{ alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#fff", alignItems: "center", justifyContent: "center", borderStyle: "dashed" }}>
                <Text style={{ color: "#fff", fontSize: 10 }}>1.0x</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>السرعة</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom Row: Slider */}
        <GestureDetector gesture={panGesture}>
          <View style={{ height: 30, justifyContent: "center" }}>
            <View
              style={{
                height: 30,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: "#fff",
                justifyContent: "center",
                paddingHorizontal: 5,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            >
              {/* Fake Track (Optional) */}
              <Animated.View
                style={[
                  { height: 2 },
                  animatedTrackStyle,
                ]}
              />
              {/* Thumb */}
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#FFD700",
                    left: 0,
                  },
                  animatedThumbStyle,
                ]}
              />
            </View>
          </View>
        </GestureDetector>
      </View>

      <JumpToPageDialog
        visible={showJumpDialog}
        totalPages={TOTAL_PAGES}
        onJump={(index) => {
          onJumpToPage(index);
          setShowJumpDialog(false);
        }}
        onClose={() => setShowJumpDialog(false)}
      />
    </SafeAreaView>
  );
}
