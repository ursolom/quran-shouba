// components/ReaderOverlay/useAudioLogic.ts

import { useCallback, useEffect, useRef } from "react";

import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";

import { useAudioStore } from "@/store/audio";
import {
  TOTAL_PAGES,
  useReaderStore,
} from "@/store/reader";
import { reciters } from "@/data/reciters";
import { getOrDownloadAudio } from "@/utils/audioCache";

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

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
    });
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

  const releasePlayer = useCallback(() => {
    if (!playerRef.current) {
      playingPageRef.current = null;
      return;
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
   *
   * This function does NOTHING until explicitly called.
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
   * Create local player.
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
              return;
            }

            /**
             * If the reader stayed on the same page:
             *
             * Page 8 audio finished
             * → go to Page 9
             *
             * If the user manually moved to another page:
             *
             * Audio Page 8
             * Reader Page 9
             * → continue with Page 9
             */
            const readerPage =
              currentPageRef.current;

            const nextPage =
              readerPage !== finishedPage
                ? readerPage
                : finishedPage + 1;

            if (nextPage >= TOTAL_PAGES) {
              setPlaying(false);
              isPlayingRef.current = false;
              return;
            }

            goToPage(nextPage);

            /**
             * Continue playback automatically.
             */
            void playSpecificPageRef.current(
              nextPage,
            );
          }
        },
      );

      return player;
    },
    [
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
   * IMPORTANT:
   *
   * Page changes while playing:
   *
   * - DON'T stop old audio
   * - DON'T replace old player
   * - DOWNLOAD NEW PAGE in background
   */
  useEffect(() => {
    if (!isPlayingRef.current) {
      return;
    }

    /**
     * Already playing this page.
     */
    if (
      playingPageRef.current === currentPageIndex
    ) {
      return;
    }

    let cancelled = false;

    const preload = async () => {
      try {
        /**
         * Don't set isLoading here.
         *
         * Current audio must keep playing normally.
         */
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
     */
    player.play();

    isPlayingRef.current = true;
    setPlaying(true);
  }, [
    currentPageIndex,
    playSpecificPage,
    setPlaying,
  ]);

  /**
   * STOP
   *
   * Completely stops and removes the player.
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