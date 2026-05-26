import { useRef, useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Check if running in Capacitor native environment
const isNative = (): boolean => {
  const cap = (window as { Capacitor?: object }).Capacitor;
  return typeof cap !== 'undefined' && (cap as { isNativePlatform?: () => boolean }).isNativePlatform?.();
};

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const w = window as unknown as { webkitAudioContext: typeof AudioContext };
      audioContextRef.current = new (window.AudioContext || w.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playClickSound = useCallback(() => {
    try {
      const audioCtx = getAudioContext();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }, [getAudioContext]);

  const vibrate = useCallback((pattern: number | number[] = 30, intensity: 'light' | 'medium' | 'strong' = 'medium') => {
    if (isNative()) {
      try {
        if (Array.isArray(pattern)) {
          // Use Haptics notification for pattern-based vibrations (e.g., target reached)
          Haptics.vibrate({ duration: pattern.reduce((a, b) => a + b, 0) });
        } else {
          // Use Haptics impact for single vibrations
          let impactStyle: ImpactStyle;
          switch (intensity) {
            case 'light':
              impactStyle = ImpactStyle.Light;
              break;
            case 'strong':
              impactStyle = ImpactStyle.Heavy;
              break;
            case 'medium':
            default:
              impactStyle = ImpactStyle.Medium;
              break;
          }
          Haptics.impact({ style: impactStyle });
        }
      } catch (e) {
        console.error('Failed to use Haptics:', e);
        // Fallback to navigator.vibrate if Haptics fails for some reason
        if ('vibrate' in navigator) {
          navigator.vibrate(pattern);
        }
      }
    } else if ('vibrate' in navigator) {
      // Web fallback with intensity adjustment
      const multiplier = intensity === 'light' ? 0.5 : intensity === 'strong' ? 2 : 1;
      
      if (Array.isArray(pattern)) {
        navigator.vibrate(pattern.map(p => Math.round(p * multiplier)));
      } else {
        navigator.vibrate(Math.round(pattern * multiplier));
      }
    }
  }, []);

  return { playClickSound, vibrate };
}
