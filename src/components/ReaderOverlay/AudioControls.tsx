// components/ReaderOverlay/AudioControls.tsx
import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { colors } from "@/constants/colors";
import { useAudioStore } from "@/store/audio";
import { reciters } from "@/data/reciters";

interface AudioControlsProps {
  onPlayPause: () => void;
  onStop: () => void;
  onChangeSpeed: (speed: number) => void;
}

export const AudioControls = React.memo(
  ({ onPlayPause, onStop, onChangeSpeed }: AudioControlsProps) => {
    const { isPlaying, speed, isLoading, selectedReciterId } = useAudioStore();
    const currentReciter =
      reciters.find((r) => r.id === selectedReciterId) || reciters[0];

    const rotation = useSharedValue(0);

    useEffect(() => {
      if (isPlaying) {
        rotation.value = withRepeat(
          withTiming(360, { duration: 4000, easing: Easing.linear }),
          -1, 
        );
      } else {
        cancelAnimation(rotation);
      }
    }, [isPlaying]);

    const animatedImgStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
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
          <Reanimated.Image
            source={
              currentReciter.image
                ? { uri: currentReciter.image }
                : { uri: "https://i.pravatar.cc/100" }
            }
            style={[
              { width: 40, height: 40, borderRadius: 20 },
              animatedImgStyle,
            ]}
          />
          <Text
            style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}
          >
            {currentReciter.name}
          </Text>
        </Pressable>

        <View
          style={{
            flexDirection: "row-reverse",
            gap: 15,
            alignItems: "center",
          }}
        >
          <Pressable onPress={onPlayPause} style={{ alignItems: "center" }}>
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
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={18}
                color={colors.white}
              />
            </View>
            <Text style={{ color: colors.white, fontSize: 12, marginTop: 4 }}>
              {isPlaying ? "إيقاف" : "تشغيل"}
            </Text>
          </Pressable>

          <Pressable onPress={onStop} style={{ alignItems: "center" }}>
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
            <Text style={{ color: colors.white, fontSize: 12, marginTop: 4 }}>
              إيقاف
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
              onChangeSpeed(
                speeds[(speeds.indexOf(speed) + 1) % speeds.length],
              );
            }}
            style={{ alignItems: "center" }}
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
            <Text style={{ color: colors.white, fontSize: 12, marginTop: 4 }}>
              {speed}x
            </Text>
          </Pressable>
        </View>
      </View>
    );
  },
);
