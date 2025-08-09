import React from 'react';
import { useMouseClickSound } from '@/hooks/useMouseClickSound';

export function GlobalMouseClickSound() {
  const { mouseClickAudioRef, soundPath } = useMouseClickSound();

  return (
    <audio ref={mouseClickAudioRef} preload="auto">
      <source src={soundPath} type="audio/mpeg" />
      <source src={soundPath} type="audio/mp3" />
    </audio>
  );
}
