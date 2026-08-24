import { PRACTICE_AUDIO } from '../constants/practice-audio.constants';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_OM_VOLUME = 0.35;
const DEFAULT_TONE_VOLUME = 0.6;

const TAP_TONE_FREQUENCY = 880;
const TAP_TONE_DURATION_SECONDS = 0.075;
const TAP_TONE_MAX_GAIN = 0.2;
const MIN_GAIN = 0.001;

type UsePracticeAudioOptions = {
  defaultSoundEnabled: boolean;
};

export function usePracticeAudio({
  defaultSoundEnabled,
}: UsePracticeAudioOptions) {
  /*
   * User-facing audio state.
   */
  const [omEnabled, setOmEnabled] = useState(() => defaultSoundEnabled);

  const [omVolume, setOmVolume] = useState(DEFAULT_OM_VOLUME);

  const [toneEnabled, setToneEnabled] = useState(() => defaultSoundEnabled);

  const [toneVolume, setToneVolume] = useState(DEFAULT_TONE_VOLUME);

  /*
   * Long-running Om audio element.
   */
  const omAudioRef = useRef<HTMLAudioElement | null>(null);

  /*
   * Tracks whether Om has already successfully
   * started during this mounted practice session.
   */
  const omStartedRef = useRef(false);

  /*
   * One reusable Web Audio context for all
   * short chant confirmation tones.
   */
  const toneAudioContextRef = useRef<AudioContext | null>(null);

  /*
   * Create exactly one Om audio element for
   * this mounted practice session.
   */
  useEffect(() => {
    const audio = new Audio(PRACTICE_AUDIO.om);

    audio.preload = 'auto';

    /*
     * The recording can continue for practices
     * longer than the source audio duration.
     */
    audio.loop = true;

    audio.volume = DEFAULT_OM_VOLUME;

    omAudioRef.current = audio;

    return () => {
      audio.pause();

      audio.currentTime = 0;

      omAudioRef.current = null;

      omStartedRef.current = false;

      const toneAudioContext = toneAudioContextRef.current;

      if (toneAudioContext) {
        void toneAudioContext.close();

        toneAudioContextRef.current = null;
      }
    };
  }, []);

  /*
   * Apply Om slider changes immediately
   * without restarting playback.
   */
  useEffect(() => {
    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = omVolume;
  }, [omVolume]);

  /*
   * Start Om only if it has never started.
   *
   * Calling this on every chant is safe because
   * subsequent calls become no-ops.
   */
  const startOm = useCallback(() => {
    if (!omEnabled) {
      return;
    }

    if (omStartedRef.current) {
      return;
    }

    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = omVolume;

    /*
     * Mark started before play() resolves so very
     * rapid chant taps do not repeatedly call play().
     */
    omStartedRef.current = true;

    void audio.play().catch(() => {
      /*
       * Allow another user interaction to try
       * starting the audio if the browser rejected it.
       */
      omStartedRef.current = false;
    });
  }, [omEnabled, omVolume]);

  /*
   * Pause Om while preserving currentTime.
   */
  const pauseOm = useCallback(() => {
    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
  }, []);

  /*
   * Resume Om only if it had previously started.
   *
   * This is used after Pause/Resume, Reset,
   * or enabling Om again.
   */
  const resumeOm = useCallback(() => {
    if (!omEnabled) {
      return;
    }

    if (!omStartedRef.current) {
      return;
    }

    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = omVolume;

    void audio.play().catch(() => {
      /*
       * Keep omStartedRef true because the recording
       * had already started earlier. A later user
       * interaction can attempt resume again.
       */
    });
  }, [omEnabled, omVolume]);

  /*
   * Stop Om permanently for the current practice
   * and reset playback to 0:00.
   */
  const stopOm = useCallback(() => {
    const audio = omAudioRef.current;

    if (audio) {
      audio.pause();

      audio.currentTime = 0;
    }

    omStartedRef.current = false;
  }, []);

  /*
   * Short independent per-chant confirmation tone.
   */
  const playTapTone = useCallback(() => {
    if (!toneEnabled) {
      return;
    }

    if (toneVolume <= 0) {
      return;
    }

    try {
      let audioContext = toneAudioContextRef.current;

      if (!audioContext) {
        audioContext = new AudioContext();

        toneAudioContextRef.current = audioContext;
      }

      const createTone = () => {
        if (!audioContext) {
          return;
        }

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.type = 'sine';

        oscillator.frequency.setValueAtTime(
          TAP_TONE_FREQUENCY,
          audioContext.currentTime
        );

        const gainLevel = Math.max(MIN_GAIN, toneVolume * TAP_TONE_MAX_GAIN);

        gain.gain.setValueAtTime(gainLevel, audioContext.currentTime);

        gain.gain.exponentialRampToValueAtTime(
          MIN_GAIN,
          audioContext.currentTime + TAP_TONE_DURATION_SECONDS
        );

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(audioContext.currentTime + TAP_TONE_DURATION_SECONDS);
      };

      if (audioContext.state === 'suspended') {
        void audioContext
          .resume()
          .then(createTone)
          .catch(() => {
            // Tap tone is optional.
          });

        return;
      }

      createTone();
    } catch {
      // Tap tone is optional.
    }
  }, [toneEnabled, toneVolume]);

  /*
   * Toggle Om independently.
   *
   * If Om is turned off:
   * → pause and preserve playback position.
   *
   * If Om is turned back on:
   * → resume only when the caller allows it
   *   and Om had already started.
   *
   * This lets the practice page prevent audio from
   * resuming while the whole session is paused.
   */
  const toggleOm = useCallback(
    (canResume: boolean) => {
      const nextValue = !omEnabled;

      setOmEnabled(nextValue);

      if (!nextValue) {
        pauseOm();

        return;
      }

      if (!canResume || !omStartedRef.current) {
        return;
      }

      const audio = omAudioRef.current;

      if (!audio) {
        return;
      }

      audio.volume = omVolume;

      void audio.play().catch(() => {
        // Om audio is optional.
      });
    },
    [omEnabled, omVolume, pauseOm]
  );

  const toggleTone = useCallback(() => {
    setToneEnabled((current) => !current);
  }, []);

  /*
   * Volume setters accept the 0–100 value
   * coming directly from the range slider.
   */
  const changeOmVolume = useCallback((value: number) => {
    const normalizedVolume = normalizeVolumePercentage(value);

    setOmVolume(normalizedVolume);
  }, []);

  const changeToneVolume = useCallback((value: number) => {
    const normalizedVolume = normalizeVolumePercentage(value);

    setToneVolume(normalizedVolume);
  }, []);

  return {
    omEnabled,
    omVolume,

    toneEnabled,
    toneVolume,

    startOm,
    pauseOm,
    resumeOm,
    stopOm,

    playTapTone,

    toggleOm,
    toggleTone,

    changeOmVolume,
    changeToneVolume,
  };
}

function normalizeVolumePercentage(value: number) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return safeValue / 100;
}
