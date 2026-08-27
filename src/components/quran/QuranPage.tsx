import { memo } from "react";
import { View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";

interface QuranPageProps {
  source: number;
}

function QuranPage({ source }: QuranPageProps) {
  const { width, height } = useWindowDimensions();

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

export default memo(
  QuranPage,
  (prevProps, nextProps) => prevProps.source === nextProps.source,
);
