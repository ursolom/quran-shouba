import { useEffect, useCallback, useRef, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Carousel, type CarouselRef } from "react-native-reanimated-carousel";
import { quranPages } from "@/data/images";
import { usePageStorage } from "@/hooks/usePageStorage";
import { type AnimationPreset, animations } from "@/utils/animations";
import PageCounter from "./PageCounter";
import JumpToPageDialog from "./JumpToPageDialog";

// Only mount 7 slides at a time — constant memory regardless of total count
const RENDER_WINDOW_SIZE = 7;

interface QuranPageCarouselProps {
  initialPage?: number;
  pageAnimation?: AnimationPreset;
}

export default function QuranPageCarousel({
  initialPage,
  pageAnimation = "normal",
}: QuranPageCarouselProps) {
  const { width, height } = useWindowDimensions();
  const {
    lastPage,
    bookmarks,
    loaded,
    saveLastPage,
    toggleBookmark,
  } = usePageStorage();

  const [showOverlay, setShowOverlay] = useState(true);
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const carouselRef = useRef<CarouselRef>(null);

  useEffect(() => {
    if (loaded && initialPage === undefined && lastPage > 0) {
      carouselRef.current?.scrollTo({ index: lastPage, animated: false });
      setCurrentPage(lastPage);
    }
  }, [loaded, lastPage, initialPage]);

  const handleSnapToItem = useCallback(
    (index: number) => {
      setCurrentPage(index);
      saveLastPage(index);
    },
    [saveLastPage],
  );

  const handleJumpToPage = useCallback((page: number) => {
    const index = Math.max(0, Math.min(page, quranPages.length - 1));
    carouselRef.current?.scrollTo({ index, animated: true });
    setShowJumpDialog(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof quranPages)[number] }) => (
      <Image
        source={item}
        style={{ width, height }}
        contentFit="fill"
        cachePolicy="memory-disk"
        transition={200}
        priority="high"
      />
    ),
    [width, height],
  );

  const isBookmarked = bookmarks.includes(currentPage);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

  const preset = animations[pageAnimation];

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setShowOverlay((prev) => !prev)}
      >
        <Carousel
          ref={carouselRef}
          loop={false}
          style={{ width, height }}
          data={quranPages}
          defaultIndex={initialPage ?? 0}
          renderItem={renderItem}
          onSnapToItem={handleSnapToItem}
          renderWindowSize={RENDER_WINDOW_SIZE}
          // تم مسح سطر animation={{ type: "spring"... }} من هنا
          {...preset}
        />
      </Pressable>

      {showOverlay && (
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            flexDirection: "row", 
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Pressable onPress={() => toggleBookmark(currentPage)}>
            <Text
              style={{
                color: isBookmarked ? "#FFD700" : "#fff",
                fontSize: 28,
              }}
            >
              {isBookmarked ? "\u2605" : "\u2606"}
            </Text>
          </Pressable>

          <PageCounter
            currentPage={currentPage}
            totalPages={quranPages.length}
          />

          <Pressable onPress={() => setShowJumpDialog(true)}>
            <Text style={{ color: "#fff", fontSize: 22 }}>
              {"\u21C4"}
            </Text>
          </Pressable>
        </View>
      )}

      <JumpToPageDialog
        visible={showJumpDialog}
        totalPages={quranPages.length}
        onJump={handleJumpToPage}
        onClose={() => setShowJumpDialog(false)}
      />
    </View>
  );
}