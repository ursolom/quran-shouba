import { useCallback, useMemo, useRef } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { quranPages } from "@/data/images";
import { useReaderStore, TOTAL_PAGES } from "@/store/reader";
import QuranPage from "./QuranPage";
import ReaderOverlay from "./ReaderOverlay";
import ReaderHeader from "./ReaderHeader";

interface QuranReaderProps {
  initialPage?: number;
}

export default function QuranReader({ initialPage }: QuranReaderProps) {
  const { width } = useWindowDimensions();

  const loaded = useReaderStore(useCallback((s) => s.loaded, []));
  const currentPageIndex = useReaderStore(
    useCallback((s) => s.currentPageIndex, []),
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

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      if (pageNumber !== currentPageIndex) {
        goToPage(pageNumber);
      }
    },
    [currentPageIndex, goToPage],
  );

  const handleJumpToPage = useCallback(
    (targetPageIndex: number) => {
      const roundedWidth = Math.round(width);
      const offset = targetPageIndex * roundedWidth;
      flatListRef.current?.scrollToOffset({ offset, animated: false });
      goToPage(targetPageIndex);
    },
    [goToPage, width],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => {
      const roundedWidth = Math.round(width);
      return {
        length: roundedWidth,
        offset: roundedWidth * index,
        index,
      };
    },
    [width],
  );

  const keyExtractor = useCallback(
    (_: unknown, index: number) => `quran-page-${index}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => <QuranPage source={item} />,
    [],
  );

  const handleMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / Math.round(width),
      );
      handlePageChange(index);
    },
    [width, handlePageChange],
  );

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .maxDistance(10)
    .onEnd(() => {
      toggleOverlay();
    })
    .runOnJS(true);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
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
          onMomentumScrollEnd={handleMomentumScrollEnd}
        />
      </GestureDetector>

      <ReaderHeader />
      <ReaderOverlay onJumpToPage={handleJumpToPage} />
    </View>
  );
}
