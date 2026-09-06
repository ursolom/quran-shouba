// components/ReaderOverlay/ProgressBar.tsx
import React, { useState, useEffect } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { colors } from "@/constants/colors";
import { useAudioStore } from "@/store/audio";

interface ProgressBarProps {
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export const ProgressBar = React.memo(({ onSeek }: ProgressBarProps) => {
  const { width } = useWindowDimensions();
  const sliderWidth = width - 40;

  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const downloadProgress = useAudioStore((s) => s.downloadProgress);
  const isLoading = useAudioStore((s) => s.isLoading);

  const progress = useSharedValue(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging && duration > 0) {
      progress.value = Math.min(1, Math.max(0, currentTime / duration));
    }
  }, [currentTime, duration, isDragging, progress]);

  const handleSeekEnd = (ratio: number) => {
    const newTime = Math.min(1, Math.max(0, ratio)) * duration;
    setIsDragging(false);
    onSeek(newTime);
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(setIsDragging)(true);
      progress.value = Math.max(0, Math.min(e.x, sliderWidth)) / sliderWidth;
    })
    .onUpdate((e) => {
      progress.value = Math.max(0, Math.min(e.x, sliderWidth)) / sliderWidth;
    })
    .onEnd(() => {
      runOnJS(handleSeekEnd)(progress.value);
    });

  const progressAnimStyle = useAnimatedStyle(() => ({
    width: progress.value * sliderWidth,
  }));

  const thumbAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * sliderWidth - 10 }],
  }));

  const isDownloading = downloadProgress > 0 && downloadProgress < 1;

  return (
    <View>
      <GestureDetector gesture={panGesture}>
        <View style={{ height: 30, justifyContent: "center" }}>
          <View
            style={{
              height: 30,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: colors.white,
              justifyContent: "center",
              paddingHorizontal: 5,
              backgroundColor: colors.surface,
              overflow: "hidden",
            }}
          >
            {/* شريط تقدم التنزيل (يظهر خلف المسار عند التحميل لأول مرة) */}
            {isDownloading && (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: downloadProgress * sliderWidth,
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                }}
              />
            )}

            {/* شريط تقدم التشغيل */}
            <Reanimated.View
              style={[
                { height: 2, backgroundColor: colors.white, borderRadius: 1 },
                progressAnimStyle,
              ]}
            />

            {/* المقبض */}
            <Reanimated.View
              style={[
                {
                  position: "absolute",
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.gold,
                  left: 0,
                },
                thumbAnimStyle,
              ]}
            />
          </View>
        </View>
      </GestureDetector>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 5,
        }}
      >
        <Text style={{ color: colors.white, fontSize: 12 }}>
          {isDownloading
            ? `جاري التحميل: ${Math.round(downloadProgress * 100)}%`
            : formatTime(currentTime)}
        </Text>
        <Text style={{ color: colors.white, fontSize: 12 }}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
});
