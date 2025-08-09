import { useRef, useEffect } from 'react';
import mouseClickSoundFile from '@/sound/mouseclik.mp3';

export const useMouseClickSound = () => {
  const mouseClickAudioRef = useRef<HTMLAudioElement>(null);

  const playMouseClickSound = () => {
    if (mouseClickAudioRef.current) {
      mouseClickAudioRef.current.currentTime = 0;
      mouseClickAudioRef.current.play().catch(error => {
        console.log('Mouse click sound play failed:', error);
      });
    }
  };

  useEffect(() => {
    // Setup volume
    if (mouseClickAudioRef.current) {
      mouseClickAudioRef.current.volume = 0.4;
    }

    // Add global mouse click listener
    const handleGlobalMouseClick = (event: MouseEvent) => {
      // Play click sound on any click anywhere on the page
      playMouseClickSound();
    };

    document.addEventListener('click', handleGlobalMouseClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleGlobalMouseClick);
    };
  }, []);

  return {
    playMouseClickSound,
    mouseClickAudioRef,
    soundPath: mouseClickSoundFile
  };
};
