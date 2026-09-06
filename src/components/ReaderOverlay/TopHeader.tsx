// components/ReaderOverlay/TopHeader.tsx
import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { colors } from "@/constants/colors";
import { useReaderStore } from "@/store/reader";
import { getPageMetadata } from "@/data/metadata";

interface TopHeaderProps {
  onOpenJumpDialog: () => void;
}

export const TopHeader = React.memo(({ onOpenJumpDialog }: TopHeaderProps) => {
  const currentPageIndex = useReaderStore((s) => s.currentPageIndex);
  
  const { surahName, juzNumber } = useMemo(() => getPageMetadata(currentPageIndex), [currentPageIndex]);
  const juzText = juzNumber === 0 ? "" : `الجزء : ${juzNumber}`;
  const surahText = juzNumber === 0 ? surahName : `سورة ${surahName}`;

  return (
    <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
      <Text style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}>{juzText}</Text>
      <Pressable onPress={onOpenJumpDialog}>
        <Text style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}>{currentPageIndex + 1}</Text>
      </Pressable>
      <Text style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}>{surahText}</Text>
    </View>
  );
});