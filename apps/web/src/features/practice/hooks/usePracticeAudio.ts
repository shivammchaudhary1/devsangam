import { PRACTICE_AUDIO } from '../constants/practice-audio.constants';
import {
  readPracticePreferences,
  writePracticePreferences,
} from '../storage/practice-preferences.storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_OM_VOLUME = 0.35;
const DEFAULT_TONE_VOLUME = 0.6;

const TAP_TONE_FREQUENCY = 880;
const TAP_TONE_DURATION_SECONDS = 0.075;
const TAP_TONE_MAX_GAIN = 0.2;
const MIN_GAIN = 0.001;

type UsePracticeAudioOptions = {
  defaultSoundEnabled: boolean;

  preferenceUserId?: string;
};

export function usePracticeAudio({
  defaultSoundEnabled,
  preferenceUserId,
}: UsePracticeAudioOptions) {
  const [initialPreferences] = useState(() =>
    readPracticePreferences(preferenceUserId)
  );

  const [omEnabled, setOmEnabled] = useState(
    () => initialPreferences.omEnabled ?? defaultSoundEnabled
  );

  const [omVolume, setOmVolume] = useState(
    () => initialPreferences.omVolume ?? DEFAULT_OM_VOLUME
  );

  const [toneEnabled, setToneEnabled] = useState(
    () => initialPreferences.toneEnabled ?? defaultSoundEnabled
  );

  const [toneVolume, setToneVolume] = useState(
    () => initialPreferences.toneVolume ?? DEFAULT_TONE_VOLUME
  );

  const omAudioRef = useRef<HTMLAudioElement | null>(null);

  const omStartedRef = useRef(false);

  const toneAudioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audio = new Audio(PRACTICE_AUDIO.om);

    audio.preload = 'auto';

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

  useEffect(() => {
    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = omVolume;
  }, [omVolume]);

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

    omStartedRef.current = true;

    void audio.play().catch(() => {
      omStartedRef.current = false;
    });
  }, [omEnabled, omVolume]);

  const pauseOm = useCallback(() => {
    const audio = omAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
  }, []);

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
      // Optional audio.
    });
  }, [omEnabled, omVolume]);

  const stopOm = useCallback(() => {
    const audio = omAudioRef.current;

    if (audio) {
      audio.pause();

      audio.currentTime = 0;
    }

    omStartedRef.current = false;
  }, []);

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
            // Optional audio.
          });

        return;
      }

      createTone();
    } catch {
      // Optional audio.
    }
  }, [toneEnabled, toneVolume]);

  const toggleOm = useCallback(
    (canResume: boolean) => {
      const nextValue = !omEnabled;

      setOmEnabled(nextValue);

      writePracticePreferences(preferenceUserId, {
        omEnabled: nextValue,
      });

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
        // Optional audio.
      });
    },
    [omEnabled, omVolume, pauseOm, preferenceUserId]
  );

  const toggleTone = useCallback(() => {
    setToneEnabled((current) => {
      const nextValue = !current;

      writePracticePreferences(preferenceUserId, {
        toneEnabled: nextValue,
      });

      return nextValue;
    });
  }, [preferenceUserId]);

  const changeOmVolume = useCallback(
    (value: number) => {
      const normalizedVolume = normalizeVolumePercentage(value);

      setOmVolume(normalizedVolume);

      writePracticePreferences(preferenceUserId, {
        omVolume: normalizedVolume,
      });
    },
    [preferenceUserId]
  );

  const changeToneVolume = useCallback(
    (value: number) => {
      const normalizedVolume = normalizeVolumePercentage(value);

      setToneVolume(normalizedVolume);

      writePracticePreferences(preferenceUserId, {
        toneVolume: normalizedVolume,
      });
    },
    [preferenceUserId]
  );

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
