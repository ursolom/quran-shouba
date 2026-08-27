import JumpToPageDialog from "@/components/JumpToPageDialog";
import { colors, withOpacity } from "@/constants/colors";
import { TOTAL_PAGES, useReaderStore } from "@/store/reader";
import { getPageMetadata } from "@/data/metadata";
import { Image } from "expo-image";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { SafeAreaView } from "react-native-safe-area-context";

interface ReaderOverlayProps {
  onJumpToPage: (index: number) => void;
}

export default function ReaderOverlay({ onJumpToPage }: ReaderOverlayProps) {
  const { width } = useWindowDimensions();

  const showOverlay = useReaderStore((s) => s.showOverlay);
  const currentPageIndex = useReaderStore((s) => s.currentPageIndex);

  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sliderWidth = width - 40;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!isDragging) {
      const ratio = currentPageIndex / Math.max(1, TOTAL_PAGES - 1);
      progress.value = 1 - ratio;
    }
  }, [currentPageIndex, isDragging]);

  const handleSliderRelease = useCallback(
    (val: number) => {
      const ratio = 1 - val;
      const targetPage = Math.round(ratio * (TOTAL_PAGES - 1));
      onJumpToPage(targetPage);
    },
    [onJumpToPage],
  );

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(setIsDragging)(true);
      const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
      progress.value = clampedX / sliderWidth;
    })
    .onUpdate((e) => {
      const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
      progress.value = clampedX / sliderWidth;
    })
    .onEnd(() => {
      runOnJS(setIsDragging)(false);
      runOnJS(handleSliderRelease)(progress.value);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: progress.value * sliderWidth - 10,
      },
    ],
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    width: progress.value * sliderWidth,
  }));

  const { surahName, juzNumber } = useMemo(
    () => getPageMetadata(currentPageIndex),
    [currentPageIndex],
  );

  if (!showOverlay) return null;

  const juzText = juzNumber === 0 ? "" : `الجزء : ${juzNumber}`;
  const surahText = juzNumber === 0 ? surahName : `سورة ${surahName}`;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          backgroundColor: withOpacity(colors.primary, 0.95),
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
        style={{
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
          <Text
            style={{
              color: colors.white,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {juzText}
          </Text>

          <Pressable onPress={() => setShowJumpDialog(true)}>
            <Text
              style={{
                color: colors.white,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {currentPageIndex}
            </Text>
          </Pressable>

          <Text
            style={{
              color: colors.white,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {surahText}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Pressable
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.white,
              borderRadius: 30,
              paddingLeft: 15,
              paddingRight: 5,
              paddingVertical: 5,
              gap: 10,
            }}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            />

            <Text
              style={{
                color: colors.white,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              ياسر القرشي
            </Text>
</Pressable>

            <View
              style={{
                flexDirection: "row-reverse",
                gap: 15,
                alignItems: "center",
              }}
            >
              <Pressable
                style={{
                  alignItems: "center",
                }}
              >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.white,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="play" size={18} color={colors.white} />
              </View>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                تشغيل
              </Text>
            </Pressable>

            <Pressable
              style={{
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.white,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="stop" size={17} color={colors.white} />
              </View>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                إيقاف
              </Text>
            </Pressable>

            <Pressable
              style={{
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.white,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={18}
                  color={colors.white}
                />
              </View>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                السرعة
              </Text>
            </Pressable>
          </View>
        </View>

        <GestureDetector gesture={panGesture}>
          <View
            style={{
              height: 30,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                height: 30,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: colors.white,
                justifyContent: "center",
                paddingHorizontal: 5,
                backgroundColor: colors.surface,
              }}
            >
              <Animated.View
                style={[
                  {
                    height: 2,
                    backgroundColor: colors.white,
                    borderRadius: 1,
                  },
                  animatedTrackStyle,
                ]}
              />

              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: colors.gold,
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
