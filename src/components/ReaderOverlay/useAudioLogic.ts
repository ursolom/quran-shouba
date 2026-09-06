import { useCallback, useEffect, useRef } from "react";

import {
  createAudioPlayer,
  setAudioModeAsync,
  requestNotificationPermissionsAsync,
  type AudioPlayer,
  type AudioMetadata,
} from "expo-audio";

import { useAudioStore } from "@/store/audio";
import {
  TOTAL_PAGES,
  useReaderStore,
} from "@/store/reader";
import { reciters } from "@/data/reciters";
import { getOrDownloadAudio } from "@/utils/audioCache";
import { getPageMetadata } from "@/data/metadata";

export function useAudioLogic() {
  const playerRef = useRef<AudioPlayer | null>(null);

  const currentPageRef = useRef(0);
  const playingPageRef = useRef<number | null>(null);

  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);

  const currentPageIndex = useReaderStore(
    (state) => state.currentPageIndex,
  );

  const goToPage = useReaderStore(
    (state) => state.goToPage,
  );

  const {
    isPlaying,
    speed,
    selectedReciterId,

    setPlaying,
    setCurrentTime,
    setDuration,
    setSpeed,
    setIsLoading,
    setDownloadProgress,
  } = useAudioStore();

  useEffect(() => {
    currentPageRef.current = currentPageIndex;
  }, [currentPageIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  /**
   * Configure audio session for background playback
   * and request notification permission on Android.
   */
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });

    void requestNotificationPermissionsAsync().catch(() => {});
  }, []);

  const getAudioDetails = useCallback(
    (pageIndex: number, reciterId: string) => {
      const reciter = reciters.find(
        (item) => item.id === reciterId,
      );

      if (!reciter) {
        return null;
      }

      const pageNumber = pageIndex + 1;

      const pageStr = reciter.padded
        ? String(pageNumber).padStart(3, "0")
        : String(pageNumber);

      return {
        remoteUrl: `${reciter.baseUrl}${pageStr}.ogg`,
        fileName: `${reciter.id}_${pageStr}.ogg`,
      };
    },
    [],
  );

  /**
   * Build lock screen metadata from page index and reciter.
   */
  const buildMetadata = useCallback(
    (pageIndex: number): AudioMetadata => {
      const reciter =
        reciters.find((r) => r.id === selectedReciterId) ||
        reciters[0];

      const { surahName } = getPageMetadata(pageIndex);

      return {
        title: `سورة ${surahName} - الصفحة ${pageIndex + 1}`,
        artist: reciter.name,
        albumTitle: "القرآن الكريم",
        artworkUrl: reciter.image || undefined,
      };
    },
    [selectedReciterId],
  );

  const releasePlayer = useCallback(() => {
    if (!playerRef.current) {
      playingPageRef.current = null;
      return;
    }

    try {
      playerRef.current.clearLockScreenControls();
    } catch {
      // Ignore.
    }

    try {
      playerRef.current.release();
    } catch {
      // Ignore cleanup errors.
    }

    playerRef.current = null;
    playingPageRef.current = null;
  }, []);

  /**
   * Download/check local cache.
   */
  const prepareAudio = useCallback(
    async (
      pageIndex: number,
      showProgress = false,
    ): Promise<string> => {
      const details = getAudioDetails(
        pageIndex,
        selectedReciterId,
      );

      if (!details) {
        throw new Error("Reciter not found");
      }

      if (showProgress) {
        setDownloadProgress(0);
      }

      const localUri = await getOrDownloadAudio(
        details.remoteUrl,
        details.fileName,
        (progress) => {
          if (showProgress) {
            setDownloadProgress(progress);
          }
        },
      );

      return localUri;
    },
    [
      getAudioDetails,
      selectedReciterId,
      setDownloadProgress,
    ],
  );

  /**
   * Ref used to avoid circular callback dependency.
   */
  const playSpecificPageRef =
    useRef<(pageIndex: number) => Promise<void>>(
      async () => {},
    );

  /**
   * Create local player with lock screen controls.
   */
  const createLocalPlayer = useCallback(
    (
      localUri: string,
      pageIndex: number,
    ) => {
      releasePlayer();

      const player = createAudioPlayer({
        uri: localUri,
      });

      playerRef.current = player;
      playingPageRef.current = pageIndex;

      player.shouldCorrectPitch = true;
      player.setPlaybackRate(speedRef.current);

      /**
       * Activate lock screen controls with metadata.
       */
      player.setActiveForLockScreen(
        true,
        buildMetadata(pageIndex),
      );

      player.addListener(
        "playbackStatusUpdate",
        (status) => {
          if (playerRef.current !== player) {
            return;
          }

          if (status.duration > 0) {
            setDuration(status.duration);
          }

          setCurrentTime(status.currentTime);

          if (status.isBuffering) {
            setIsLoading(true);
          }

          if (!status.isBuffering && !status.didJustFinish) {
            setIsLoading(false);
          }

          /**
           * Current audio finished.
           */
          if (status.didJustFinish) {
            setIsLoading(false);

            const finishedPage =
              playingPageRef.current;

            if (finishedPage === null) {
              setPlaying(false);
              isPlayingRef.current = false;
              player.clearLockScreenControls();
              return;
            }

            const readerPage =
              currentPageRef.current;

            const nextPage =
              readerPage !== finishedPage
                ? readerPage
                : finishedPage + 1;

            if (nextPage >= TOTAL_PAGES) {
              setPlaying(false);
              isPlayingRef.current = false;
              player.clearLockScreenControls();
              return;
            }

            goToPage(nextPage);

            /**
             * Update lock screen metadata for the new page
             * before playback continues.
             */
            player.updateLockScreenMetadata(
              buildMetadata(nextPage),
            );

            void playSpecificPageRef.current(
              nextPage,
            );
          }
        },
      );

      return player;
    },
    [
      buildMetadata,
      goToPage,
      releasePlayer,
      setCurrentTime,
      setDuration,
      setIsLoading,
      setPlaying,
    ],
  );

  /**
   * Actually prepare + play a page.
   */
  const playSpecificPage = useCallback(
    async (pageIndex: number) => {
      try {
        setIsLoading(true);

        const localUri = await prepareAudio(
          pageIndex,
          true,
        );

        /**
         * If the user stopped while the file was
         * downloading, don't start playback.
         */
        if (!isPlayingRef.current) {
          return;
        }

        const player = createLocalPlayer(
          localUri,
          pageIndex,
        );

        player.play();

        setPlaying(true);
        isPlayingRef.current = true;
      } catch (error) {
        console.warn(
          "Failed to load/download audio:",
          error,
        );

        setPlaying(false);
        isPlayingRef.current = false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      createLocalPlayer,
      prepareAudio,
      setIsLoading,
      setPlaying,
    ],
  );

  useEffect(() => {
    playSpecificPageRef.current =
      playSpecificPage;
  }, [playSpecificPage]);

  /**
   * Page changes while playing:
   * preload next page in background.
   */
  useEffect(() => {
    if (!isPlayingRef.current) {
      return;
    }

    if (
      playingPageRef.current === currentPageIndex
    ) {
      return;
    }

    let cancelled = false;

    const preload = async () => {
      try {
        await prepareAudio(
          currentPageIndex,
          true,
        );

        if (!cancelled) {
          setDownloadProgress(1);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "Failed to preload page audio:",
            error,
          );
        }
      }
    };

    void preload();

    return () => {
      cancelled = true;
    };
  }, [
    currentPageIndex,
    prepareAudio,
    setDownloadProgress,
  ]);

  /**
   * Update lock screen metadata when page or reciter
   * changes while playing (without restarting audio).
   */
  useEffect(() => {
    if (!isPlayingRef.current) {
      return;
    }

    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.updateLockScreenMetadata(
      buildMetadata(currentPageIndex),
    );
  }, [currentPageIndex, buildMetadata]);

  /**
   * If NOT playing and user changes page,
   * old paused player should not follow them.
   */
  useEffect(() => {
    if (isPlayingRef.current) {
      return;
    }

    if (
      playingPageRef.current !== null &&
      playingPageRef.current !== currentPageIndex
    ) {
      releasePlayer();

      setCurrentTime(0);
      setDuration(0);
      setDownloadProgress(0);
    }
  }, [
    currentPageIndex,
    releasePlayer,
    setCurrentTime,
    setDuration,
    setDownloadProgress,
  ]);

  /**
   * PLAY / PAUSE
   */
  const togglePlay = useCallback(async () => {
    const player = playerRef.current;

    /**
     * No player:
     * first Play → download/check cache → play.
     */
    if (!player) {
      isPlayingRef.current = true;

      await playSpecificPage(
        currentPageIndex,
      );

      return;
    }

    /**
     * PAUSE
     */
    if (isPlayingRef.current) {
      player.pause();

      isPlayingRef.current = false;
      setPlaying(false);

      return;
    }

    /**
     * RESUME
     *
     * Re-activate lock screen with fresh metadata.
     */
    player.setActiveForLockScreen(
      true,
      buildMetadata(currentPageIndex),
    );

    player.play();

    isPlayingRef.current = true;
    setPlaying(true);
  }, [
    buildMetadata,
    currentPageIndex,
    playSpecificPage,
    setPlaying,
  ]);

  /**
   * STOP
   *
   * Completely stops, removes player, and clears
   * lock screen controls.
   */
  const stopPlayback = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.seekTo(0);
      } catch {
        // Ignore errors.
      }
    }

    releasePlayer();

    isPlayingRef.current = false;

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setDownloadProgress(0);
    setIsLoading(false);
  }, [
    releasePlayer,
    setCurrentTime,
    setDuration,
    setDownloadProgress,
    setIsLoading,
    setPlaying,
  ]);

  /**
   * SPEED
   */
  const changeSpeed = useCallback(
    (newSpeed: number) => {
      speedRef.current = newSpeed;

      setSpeed(newSpeed);

      const player = playerRef.current;

      if (!player) {
        return;
      }

      player.shouldCorrectPitch = true;
      player.setPlaybackRate(newSpeed);
    },
    [setSpeed],
  );

  /**
   * SEEK
   */
  const seekTo = useCallback(
    (timeInSeconds: number) => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      player.seekTo(timeInSeconds);
      setCurrentTime(timeInSeconds);
    },
    [setCurrentTime],
  );

  /**
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      releasePlayer();
    };
  }, [releasePlayer]);

  return {
    togglePlay,
    stopPlayback,
    changeSpeed,
    seekTo,
  };
}
