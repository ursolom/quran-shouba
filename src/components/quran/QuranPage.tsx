import { memo } from "react";
import { View } from "react-native";
import { Image } from "expo-image";

interface QuranPageProps {
  source: number;
  width: number;
  height: number;
}

function QuranPage({ source, width, height }: QuranPageProps) {
  return (
    <View style={{ width, height }}>
      <Image
        source={source}
        style={{ width, height }}
        contentFit="fill"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey={source.toString()}
      />
    </View>
  );
}

export default memo(QuranPage);
