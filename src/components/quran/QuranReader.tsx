import { useCallback, useMemo, useRef } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { quranPages } from "@/data/images";
import { useReaderStore, TOTAL_PAGES } from "@/store/reader";
import QuranPage from "./QuranPage";
import ReaderOverlay from "./ReaderOverlay";

interface QuranReaderProps {
  initialPage?: number;
}

export default function QuranReader({ initialPage }: QuranReaderProps) {
  const { width, height } = useWindowDimensions();

  const loaded = useReaderStore(useCallback((s) => s.loaded, []));
  const currentPageIndex = useReaderStore(
    useCallback((s) => s.currentPageIndex, [])
  );
  const goToPage = useReaderStore(useCallback((s) => s.goToPage, []));
  const toggleOverlay = useReaderStore(useCallback((s) => s.toggleOverlay, []));

  const flatListRef = useRef<FlatList>(null);

  const initialScrollIndex = useMemo(() => {
    if (initialPage !== undefined) {
      return Math.max(0, Math.min(initialPage, TOTAL_PAGES - 1));
    }
    if (currentPageIndex > 0) {
      return Math.max(0, Math.min(currentPageIndex, TOTAL_PAGES - 1));
    }
    return 0;
  }, [initialPage, currentPageIndex]);

  const handleJumpToPage = useCallback(
    (targetPageIndex: number) => {
      flatListRef.current?.scrollToIndex({
        index: targetPageIndex,
        animated: false,
      });
      goToPage(targetPageIndex);
    },
    [goToPage],
  );

  const goToPageRef = useRef(goToPage);
  goToPageRef.current = goToPage;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        goToPageRef.current(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width]
  );

  const keyExtractor = useCallback(
    (_: unknown, index: number) => `quran-page-${index}`,
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <QuranPage source={item} width={width} height={height} />
    ),
    [width, height]
  );

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .maxDistance(10)
    .onEnd(() => {
      toggleOverlay();
    })
    .runOnJS(true);

  if (!loaded) {
    return <View className="flex-1 bg-quran-bg" />;
  }

  return (
    <View className="flex-1 bg-quran-bg">
      <GestureDetector gesture={tapGesture}>
        <FlatList
          ref={flatListRef}
          data={quranPages}
          horizontal
          inverted
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          windowSize={7}
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={false}
          decelerationRate="fast"
          disableIntervalMomentum={true}
          initialScrollIndex={initialScrollIndex}
          getItemLayout={getItemLayout}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </GestureDetector>
      <ReaderOverlay onJumpToPage={handleJumpToPage} />
    </View>
  );
}