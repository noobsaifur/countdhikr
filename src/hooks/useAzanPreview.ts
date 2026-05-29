import { useRef, useState, useCallback, useEffect } from 'react';
import { AZAN_SOUNDS } from '@/types/dhikr';

export function useAzanPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const playPreview = useCallback((url?: string | null) => {
    const azanUrl = url || AZAN_SOUNDS[0].url;
    
    // Stop current if playing different sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      try {
        audioRef.current.load();
      } catch (e) {
        // Ignore load interruption
      }
    }

    // Create new audio element
    audioRef.current = new Audio(azanUrl);
    audioRef.current.volume = 0.5;
    setIsLoading(true); // Start buffering
    setCurrentUrl(azanUrl); // Set immediately to enable instant spinner loading UX!
    
    audioRef.current.oncanplay = () => {
      setIsLoading(false);
    };
    
    audioRef.current.onplay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setCurrentUrl(azanUrl);
    };
    
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentUrl(null);
    };
    
    audioRef.current.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentUrl(null);
      console.error('Failed to play azan preview');
    };

    // Play with user interaction context
    audioRef.current.play().catch((err) => {
      console.error('Azan preview play failed:', err);
      setIsPlaying(false);
      setIsLoading(false);
    });
  }, []);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      try {
        audioRef.current.load();
      } catch (e) {
        // Ignore load interruption errors
      }
      audioRef.current = null;
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentUrl(null);
    }
  }, []);

  const togglePreview = useCallback((url?: string | null) => {
    const azanUrl = url || AZAN_SOUNDS[0].url;
    
    if (isPlaying && currentUrl === azanUrl) {
      stopPreview();
    } else {
      playPreview(azanUrl);
    }
  }, [isPlaying, currentUrl, playPreview, stopPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        try {
          audioRef.current.load();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isPlaying,
    isLoading,
    currentUrl,
    playPreview,
    stopPreview,
    togglePreview,
  };
}
