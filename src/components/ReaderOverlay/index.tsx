// components/ReaderOverlay/index.tsx
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import JumpToPageDialog from "@/components/JumpToPageDialog";
import { colors, withOpacity } from "@/constants/colors";
import { TOTAL_PAGES, useReaderStore } from "@/store/reader";
import { useAudioLogic } from "./useAudioLogic";
import { TopHeader } from "./TopHeader";
import { AudioControls } from "./AudioControls";
import { ProgressBar } from "./ProgressBar";

interface ReaderOverlayProps {
  onJumpToPage: (index: number) => void;
}

export default function ReaderOverlay({ onJumpToPage }: ReaderOverlayProps) {
  const showOverlay = useReaderStore((s) => s.showOverlay);
  const [showJumpDialog, setShowJumpDialog] = useState(false);

  // استدعاء المنطق الداخلي (بدون التسبب في re-renders مستمرة للواجهة)
  const { togglePlay, stopPlayback, changeSpeed, seekTo } = useAudioLogic();

  if (!showOverlay) return null;

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
        <TopHeader onOpenJumpDialog={() => setShowJumpDialog(true)} />

        <AudioControls
          onPlayPause={togglePlay}
          onStop={stopPlayback}
          onChangeSpeed={changeSpeed}
        />

        <ProgressBar onSeek={seekTo} />
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
