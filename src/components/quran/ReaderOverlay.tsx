// // components/ReaderOverlay.tsx
// import JumpToPageDialog from "@/components/JumpToPageDialog";
// import { colors, withOpacity } from "@/constants/colors";
// import { TOTAL_PAGES, useReaderStore } from "@/store/reader";
// import { useAudioStore } from "@/store/audio";
// import { getPageMetadata } from "@/data/metadata";
// import { useEffect, useState, useMemo, useRef } from "react";
// import {
//   Animated as RNAnimated,
//   Pressable,
//   Text,
//   useWindowDimensions,
//   View,
// } from "react-native";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import Reanimated, {
//   runOnJS,
//   useAnimatedStyle,
//   useSharedValue,
// } from "react-native-reanimated";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   createAudioPlayer,
//   setAudioModeAsync,
//   type AudioPlayer,
// } from "expo-audio";
// import { reciters } from "@/data/reciters";

// interface ReaderOverlayProps {
//   onJumpToPage: (index: number) => void;
// }

// export default function ReaderOverlay({ onJumpToPage }: ReaderOverlayProps) {
//   const { width } = useWindowDimensions();

//   // === Zustand stores ===
//   const showOverlay = useReaderStore((s) => s.showOverlay);
//   const currentPageIndex = useReaderStore((s) => s.currentPageIndex);
//   const goToPage = useReaderStore((s) => s.goToPage);

//   const {
//     isPlaying,
//     currentTime,
//     duration,
//     speed,
//     selectedReciterId,
//     isLoading,
//     setPlaying,
//     setCurrentTime,
//     setDuration,
//     setSpeed,
//     setIsLoading,
//   } = useAudioStore();

//   // === Local state ===
//   const [showJumpDialog, setShowJumpDialog] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);

//   // === Player ref (expo-audio) ===
//   const playerRef = useRef<AudioPlayer | null>(null);

//   // Refs mirroring store values for use inside effects without re-triggering them
//   const isPlayingRef = useRef(isPlaying);
//   isPlayingRef.current = isPlaying;
//   const speedRef = useRef(speed);
//   speedRef.current = speed;

//   // Shared value: readable/writable from both UI (gesture worklets) and JS (status listener) threads
//   const isSeeking = useSharedValue(false);

//   // === Slider (Reanimated) ===
//   const sliderWidth = width - 40;
//   const progress = useSharedValue(0);

//   // Rotation animation (React Native Animated)
//   const rotationAnim = useRef(new RNAnimated.Value(0)).current;
//   useEffect(() => {
//     if (isPlaying) {
//       RNAnimated.loop(
//         RNAnimated.timing(rotationAnim, {
//           toValue: 1,
//           duration: 4000,
//           useNativeDriver: true,
//         })
//       ).start();
//     } else {
//       rotationAnim.stopAnimation();
//       rotationAnim.setValue(0);
//     }
//   }, [isPlaying, rotationAnim]);

//   const rotate = rotationAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });

//   // Allow playback while the device is in silent mode (iOS)
//   useEffect(() => {
//     setAudioModeAsync({ playsInSilentMode: true });
//   }, []);

//   // === Audio URL builder ===
//   const getAudioUrl = (pageIndex: number, reciterId: string) => {
//     const reciter = reciters.find((r) => r.id === reciterId);
//     if (!reciter) return null;
//     const pageNumber = pageIndex + 1;
//     const pageStr = reciter.padded
//       ? String(pageNumber).padStart(3, "0")
//       : String(pageNumber);
//     return `${reciter.baseUrl}${pageStr}.ogg`;
//   };

//   // === (Re)create the player when page or reciter changes ===
//   useEffect(() => {
//     const url = getAudioUrl(currentPageIndex, selectedReciterId);
//     if (!url) return;

//     setIsLoading(true);
//     let newPlayer: AudioPlayer | null = null;

//     try {
//       newPlayer = createAudioPlayer({ uri: url });
//       playerRef.current = newPlayer;

//       // Times in expo-audio are in SECONDS (unlike expo-av which used millis)
//       newPlayer.addListener("playbackStatusUpdate", (status) => {
//         if (status.duration > 0) {
//           setDuration(status.duration);
//         }
//         if (!isSeeking.value) {
//           setCurrentTime(status.currentTime);
//         }
//         setIsLoading(status.isBuffering);

//         // Auto-advance to the next page when the current one finishes
//         if (status.didJustFinish) {
//           const nextPage = currentPageIndex + 1;
//           if (nextPage < TOTAL_PAGES) {
//             goToPage(nextPage);
//           } else {
//             setPlaying(false);
//           }
//         }
//       });

//       // Apply persisted playback speed
//       newPlayer.shouldCorrectPitch = true;
//       newPlayer.setPlaybackRate(speedRef.current);

//       // Resume playback if it was playing before the page/reciter change
//       if (isPlayingRef.current) {
//         newPlayer.play();
//       }
//     } catch (error) {
//       console.warn("Failed to load audio:", error);
//     } finally {
//       setIsLoading(false);
//     }

//     return () => {
//       if (newPlayer && playerRef.current === newPlayer) {
//         playerRef.current = null;
//         newPlayer.remove();
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentPageIndex, selectedReciterId]);

//   // Release the player on unmount
//   useEffect(() => {
//     return () => {
//       playerRef.current?.remove();
//       playerRef.current = null;
//     };
//   }, []);

//   // === Update slider when not dragging ===
//   useEffect(() => {
//     if (!isDragging && duration > 0) {
//       progress.value = Math.min(1, Math.max(0, currentTime / duration));
//     }
//   }, [currentTime, duration, isDragging, progress]);

//   // === Seek (called from the gesture via runOnJS, runs on JS thread) ===
//   const handleSeekEnd = (ratio: number) => {
//     const dur = useAudioStore.getState().duration;
//     const newTime = Math.min(1, Math.max(0, ratio)) * dur;
//     isSeeking.value = false;
//     setIsDragging(false);
//     setCurrentTime(newTime);
//     playerRef.current?.seekTo(newTime);
//   };

//   // === Play / Pause ===
//   const togglePlay = () => {
//     const player = playerRef.current;
//     if (!player) return;
//     if (isPlaying) {
//       player.pause();
//       setPlaying(false);
//     } else {
//       player.play();
//       setPlaying(true);
//     }
//   };

//   // === Stop ===
//   const stopPlayback = () => {
//     const player = playerRef.current;
//     if (!player) return;
//     player.pause();
//     player.seekTo(0);
//     setPlaying(false);
//     setCurrentTime(0);
//   };

//   // === Speed change ===
//   const changeSpeed = (newSpeed: number) => {
//     setSpeed(newSpeed);
//     const player = playerRef.current;
//     if (player) {
//       player.shouldCorrectPitch = true;
//       player.setPlaybackRate(newSpeed);
//     }
//   };

//   // === Slider gesture ===
//   const panGesture = Gesture.Pan()
//     .onBegin((e) => {
//       isSeeking.value = true;
//       runOnJS(setIsDragging)(true);
//       const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
//       progress.value = clampedX / sliderWidth;
//     })
//     .onUpdate((e) => {
//       const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
//       progress.value = clampedX / sliderWidth;
//     })
//     .onEnd(() => {
//       runOnJS(handleSeekEnd)(progress.value);
//     });

//   // === Animated slider styles (Reanimated shared values) ===
//   const progressAnimStyle = useAnimatedStyle(() => ({
//     width: progress.value * sliderWidth,
//   }));

//   const thumbAnimStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: progress.value * sliderWidth - 10 }],
//   }));

//   // === Format time ===
//   const formatTime = (seconds: number) => {
//     if (!seconds || isNaN(seconds)) return "0:00";
//     const min = Math.floor(seconds / 60);
//     const sec = Math.floor(seconds % 60);
//     return `${min}:${sec.toString().padStart(2, "0")}`;
//   };

//   // === Metadata ===
//   const { surahName, juzNumber } = useMemo(
//     () => getPageMetadata(currentPageIndex),
//     [currentPageIndex]
//   );

//   const currentReciter =
//     reciters.find((r) => r.id === selectedReciterId) || reciters[0];

//   // === Render ===
//   if (!showOverlay) return null;

//   const juzText = juzNumber === 0 ? "" : `الجزء : ${juzNumber}`;
//   const surahText = juzNumber === 0 ? surahName : `سورة ${surahName}`;

//   return (
//     <SafeAreaView
//       edges={["top", "bottom"]}
//       pointerEvents="box-none"
//       style={{
//         position: "absolute",
//         top: 0,
//         bottom: 0,
//         left: 0,
//         right: 0,
//         justifyContent: "flex-end",
//       }}
//     >
//       <View
//         style={{
//           backgroundColor: withOpacity(colors.primary, 0.95),
//           borderTopLeftRadius: 20,
//           borderTopRightRadius: 20,
//           paddingHorizontal: 20,
//           paddingVertical: 15,
//           borderWidth: 1,
//           borderColor: colors.border,
//         }}
//       >
//         {/* Top row: Juz, Page, Surah */}
//         <View
//           style={{
//             flexDirection: "row-reverse",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 15,
//           }}
//         >
//           <Text
//             style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}
//           >
//             {juzText}
//           </Text>
//           <Pressable onPress={() => setShowJumpDialog(true)}>
//             <Text
//               style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}
//             >
//               {currentPageIndex + 1}
//             </Text>
//           </Pressable>
//           <Text
//             style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}
//           >
//             {surahText}
//           </Text>
//         </View>

//         {/* Audio controls row */}
//         <View
//           style={{
//             flexDirection: "row-reverse",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 20,
//           }}
//         >
//           {/* Reciter info with rotating image */}
//           <Pressable
//             style={{
//               flexDirection: "row-reverse",
//               alignItems: "center",
//               borderWidth: 1,
//               borderColor: colors.white,
//               borderRadius: 30,
//               paddingLeft: 15,
//               paddingRight: 5,
//               paddingVertical: 5,
//               gap: 10,
//             }}
//           >
//             <RNAnimated.Image
//               source={
//                 typeof currentReciter.image === "number"
//                   ? currentReciter.image
//                   : currentReciter.image
//                     ? { uri: currentReciter.image }
//                     : require("@/assets/drawable/qari1.png")
//               }
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 transform: [{ rotate }],
//               }}
//             />
//             <Text
//               style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}
//             >
//               {currentReciter.name}
//             </Text>
//           </Pressable>

//           {/* Control buttons */}
//           <View
//             style={{
//               flexDirection: "row-reverse",
//               gap: 15,
//               alignItems: "center",
//             }}
//           >
//             {/* Play / Pause */}
//             <Pressable onPress={togglePlay} disabled={isLoading}>
//               <View
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: 18,
//                   borderWidth: 1,
//                   borderColor: colors.white,
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Ionicons
//                   name={isPlaying ? "pause" : "play"}
//                   size={18}
//                   color={colors.white}
//                 />
//               </View>
//               <Text style={{ color: colors.white, fontSize: 12, marginTop: 4 }}>
//                 {isPlaying ? "إيقاف" : "تشغيل"}
//               </Text>
//             </Pressable>

//             {/* Stop */}
//             <Pressable onPress={stopPlayback}>
//               <View
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: 18,
//                   borderWidth: 1,
//                   borderColor: colors.white,
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Ionicons name="stop" size={17} color={colors.white} />
//               </View>
//               <Text style={{ color: colors.white, fontSize: 12, marginTop: 4 }}>
//                 إيقاف
//               </Text>
//             </Pressable>

//             {/* Speed */}
//             <Pressable
//               onPress={() => {
//                 const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
//                 const currentIdx = speeds.indexOf(speed);
//                 const nextIdx = (currentIdx + 1) % speeds.length;
//                 changeSpeed(speeds[nextIdx]);
//               }}
//             >
//               <View
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: 18,
//                   borderWidth: 1,
//                   borderColor: colors.white,
//                   borderStyle: "dashed",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Ionicons
//                   name="speedometer-outline"
//                   size={18}
//                   color={colors.white}
//                 />
//               </View>
//               <Text style={{ color: colors.white, fontSize: 12, marginTop: 4 }}>
//                 {speed}x
//               </Text>
//             </Pressable>
//           </View>
//         </View>

//         {/* Custom progress slider with gesture */}
//         <GestureDetector gesture={panGesture}>
//           <View
//             style={{
//               height: 30,
//               justifyContent: "center",
//             }}
//           >
//             <View
//               style={{
//                 height: 30,
//                 borderRadius: 15,
//                 borderWidth: 1,
//                 borderColor: colors.white,
//                 justifyContent: "center",
//                 paddingHorizontal: 5,
//                 backgroundColor: colors.surface,
//               }}
//             >
//               {/* Progress track */}
//               <Reanimated.View
//                 style={[
//                   {
//                     height: 2,
//                     backgroundColor: colors.white,
//                     borderRadius: 1,
//                   },
//                   progressAnimStyle,
//                 ]}
//               />

//               {/* Thumb */}
//               <Reanimated.View
//                 style={[
//                   {
//                     position: "absolute",
//                     width: 20,
//                     height: 20,
//                     borderRadius: 10,
//                     backgroundColor: colors.gold,
//                     left: 0,
//                   },
//                   thumbAnimStyle,
//                 ]}
//               />
//             </View>
//           </View>
//         </GestureDetector>

//         {/* Time display */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginTop: 5,
//           }}
//         >
//           <Text style={{ color: colors.white, fontSize: 12 }}>
//             {formatTime(currentTime)}
//           </Text>
//           <Text style={{ color: colors.white, fontSize: 12 }}>
//             {formatTime(duration)}
//           </Text>
//         </View>
//       </View>

//       <JumpToPageDialog
//         visible={showJumpDialog}
//         totalPages={TOTAL_PAGES}
//         onJump={(index) => {
//           onJumpToPage(index);
//           setShowJumpDialog(false);
//         }}
//         onClose={() => setShowJumpDialog(false)}
//       />
//     </SafeAreaView>
//   );
// }