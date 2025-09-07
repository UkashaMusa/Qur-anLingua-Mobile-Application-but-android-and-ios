import { useState, useEffect } from 'react';
import { Qari } from '@/types';
import AudioService from '@/services/AudioService';

export function useAudio() {
  const [qaris, setQaris] = useState<Qari[]>([]);
  const [playbackState, setPlaybackState] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    const setupAudio = async () => {
      try {
        cleanup = await initializeAudio();
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };
    
    setupAudio();
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const initializeAudio = async () => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.initialize();
      
      setQaris(audioService.getQaris());
      setPlaybackState(audioService.getPlaybackState());
      
      // Subscribe to playback state changes
      const unsubscribe = audioService.subscribe((state) => {
        setPlaybackState(state);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing audio:', error);
      return () => {}; // Return no-op cleanup function
    }
  };

  const playVerse = async (surahId: number, verseId: number) => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.playVerse(surahId, verseId);
    } catch (error) {
      console.error('Error playing verse:', error);
    }
  };

  const pauseAudio = async () => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.pauseAudio();
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const resumeAudio = async () => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.resumeAudio();
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.stopAudio();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const seekTo = async (position: number) => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.seekTo(position);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const setPlaybackSpeed = async (speed: number) => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.setPlaybackSpeed(speed);
    } catch (error) {
      console.error('Error setting playback speed:', error);
    }
  };

  const setRepeatMode = (mode: 'none' | 'verse' | 'surah') => {
    const audioService = AudioService.getInstance();
    audioService.setRepeatMode(mode);
  };

  const selectQari = async (qariId: number) => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.selectQari(qariId);
    } catch (error) {
      console.error('Error selecting Qari:', error);
    }
  };

  const downloadQari = async (qariId: number) => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.downloadQari(qariId);
    } catch (error) {
      console.error('Error downloading Qari:', error);
    }
  };

  const removeQariDownload = async (qariId: number) => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.removeQariDownload(qariId);
    } catch (error) {
      console.error('Error removing Qari download:', error);
    }
  };

  const getSelectedQari = (): Qari | undefined => {
    const audioService = AudioService.getInstance();
    return audioService.getSelectedQari();
  };

  return {
    qaris,
    playbackState,
    downloadProgress,
    playVerse,
    pauseAudio,
    resumeAudio,
    stopAudio,
    selectQari,
    downloadQari,
    removeQariDownload,
    seekTo,
    setPlaybackSpeed,
    setRepeatMode,
    getSelectedQari,
  };
}