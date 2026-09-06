// import React, { useEffect, useRef, useState } from "react";
// import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
// import Slider from "@react-native-community/slider";
// import { useAudioStore } from "@/store/audio";
// import { useReaderStore } from "@/store/reader";
// import { Audio } from "expo-av";
// import { Sound } from "expo-av/build/Audio";
// import { defaultReciterId, reciters } from "@/data/reciters";

// export default function AudioPlayer() {
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
//     setReciter,
//     setIsLoading,
//   } = useAudioStore();

//   const currentPageIndex = useReaderStore((state) => state.currentPageIndex);
//   const totalPages = useReaderStore((state) => state.totalPages); // if you export TOTAL_PAGES

//   const [sound, setSound] = useState<Sound | null>(null);
//   const [isSeeking, setIsSeeking] = useState(false);
//   const rotationAnim = useRef(new Animated.Value(0)).current;

//   // Rotation animation when playing
//   useEffect(() => {
//     if (isPlaying) {
//       Animated.loop(
//         Animated.timing(rotationAnim, {
//           toValue: 1,
//           duration: 4000,
//           useNativeDriver: true,
//         }),
//       ).start();
//     } else {
//       rotationAnim.stopAnimation();
//       rotationAnim.setValue(0);
//     }
//   }, [isPlaying]);

//   const rotate = rotationAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });

//   // Build audio URL for current page and selected reciter
//   const getAudioUrl = (pageIndex: number, reciterId: string) => {
//     const reciter = reciters.find((r) => r.id === reciterId);
//     if (!reciter) return null;
//     const pageNumber = pageIndex + 1; // convert zero-based to 1-based
//     const pageStr = reciter.padded
//       ? String(pageNumber).padStart(3, "0")
//       : String(pageNumber);
//     return `${reciter.baseUrl}${pageStr}.ogg`;
//   };

//   // Load audio when page or reciter changes
//   useEffect(() => {
//     const loadAudio = async () => {
//       const url = getAudioUrl(currentPageIndex, selectedReciterId);
//       if (!url) return;

//       setIsLoading(true);
//       try {
//         // Unload previous sound
//         if (sound) {
//           await sound.unloadAsync();
//           setSound(null);
//         }

//         const { sound: newSound } = await Audio.Sound.createAsync(
//           { uri: url },
//           { shouldPlay: false, progressUpdateIntervalMillis: 500 },
//         );
//         setSound(newSound);

//         // Set duration once loaded
//         const status = await newSound.getStatusAsync();
//         if (status.isLoaded) {
//           setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
//         }

//         // If it was playing before, start playing
//         if (isPlaying) {
//           await newSound.playAsync();
//         }

//         // Listen to progress updates
//         newSound.setOnPlaybackStatusUpdate((status) => {
//           if (status.isLoaded) {
//             if (!isSeeking) {
//               setCurrentTime(status.positionMillis / 1000);
//             }
//             if (status.didJustFinish) {
//               // Auto-advance to next page when audio ends
//               const nextPage = currentPageIndex + 1;
//               if (nextPage < totalPages) {
//                 useReaderStore.getState().goToPage(nextPage);
//               } else {
//                 setPlaying(false);
//               }
//             }
//           }
//         });
//       } catch (error) {
//         console.warn("Failed to load audio:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadAudio();

//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, [currentPageIndex, selectedReciterId]);

//   // Play/Pause toggle
//   const togglePlay = async () => {
//     if (!sound) return;
//     if (isPlaying) {
//       await sound.pauseAsync();
//       setPlaying(false);
//     } else {
//       await sound.playAsync();
//       setPlaying(true);
//     }
//   };

//   // Seek slider
//   const handleSlidingComplete = async (value: number) => {
//     setIsSeeking(false);
//     if (sound) {
//       await sound.setPositionAsync(value * 1000);
//       setCurrentTime(value);
//     }
//   };

//   const handleSlidingStart = () => setIsSeeking(true);

//   // Speed change
//   const changeSpeed = async (newSpeed: number) => {
//     setSpeed(newSpeed);
//     if (sound) {
//       await sound.setRateAsync(newSpeed, true);
//     }
//   };

//   // Reciter selection (simple placeholder – you can make a dropdown)
//   const changeReciter = (reciterId: string) => {
//     setReciter(reciterId);
//     // The useEffect above will reload audio
//   };

//   const formatTime = (seconds: number) => {
//     const min = Math.floor(seconds / 60);
//     const sec = Math.floor(seconds % 60);
//     return `${min}:${sec.toString().padStart(2, "0")}`;
//   };

//   // If no reciter selected or no audio loaded, show placeholder
//   const currentReciter =
//     reciters.find((r) => r.id === selectedReciterId) || reciters[0];

//   return (
//     <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 rounded-t-2xl">
//       {/* Reciter info & image */}
//       <View className="flex-row items-center mb-2">
//         <Animated.Image
//           source={
//             currentReciter.image
//               ? { uri: currentReciter.image }
//               : require("@/assets/reciter-placeholder.png")
//           }
//           style={{
//             width: 50,
//             height: 50,
//             borderRadius: 25,
//             transform: [{ rotate }],
//           }}
//         />
//         <Text className="text-white ml-3 font-bold">{currentReciter.name}</Text>
//         {/* Reciter switcher (simplified) – you can replace with a dropdown */}
//         <TouchableOpacity
//           onPress={() =>
//             changeReciter(
//               reciters.find((r) => r.id !== selectedReciterId)?.id ||
//                 defaultReciterId,
//             )
//           }
//           className="ml-auto bg-gray-600 px-2 py-1 rounded"
//         >
//           <Text className="text-white text-xs">Switch</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Progress slider */}
//       <View className="flex-row items-center">
//         <Text className="text-white text-xs mr-2">
//           {formatTime(currentTime)}
//         </Text>
//         <Slider
//           style={{ flex: 1, height: 40 }}
//           minimumValue={0}
//           maximumValue={duration || 1}
//           value={currentTime}
//           onSlidingStart={handleSlidingStart}
//           onSlidingComplete={handleSlidingComplete}
//           minimumTrackTintColor="#FFFFFF"
//           maximumTrackTintColor="#888888"
//           thumbTintColor="#FFFFFF"
//           disabled={isLoading}
//         />
//         <Text className="text-white text-xs ml-2">{formatTime(duration)}</Text>
//       </View>

//       {/* Controls: Play/Pause, Speed */}
//       <View className="flex-row justify-center items-center mt-2">
//         <TouchableOpacity
//           onPress={togglePlay}
//           disabled={isLoading}
//           className="mr-6"
//         >
//           <Text className="text-white text-3xl">{isPlaying ? "⏸" : "▶️"}</Text>
//         </TouchableOpacity>

//         {/* Speed control: cycle through speeds */}
//         <TouchableOpacity
//           onPress={() => {
//             const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
//             const currentIdx = speeds.indexOf(speed);
//             const nextIdx = (currentIdx + 1) % speeds.length;
//             changeSpeed(speeds[nextIdx]);
//           }}
//           className="bg-gray-600 px-3 py-1 rounded"
//         >
//           <Text className="text-white">{speed}x</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
