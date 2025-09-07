import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Qari } from '@/types';

const QARIS: Qari[] = [
  {
    id: 1,
    name: 'Mishary Rashid Alafasy',
    country: 'Kuwait',
    style: 'Hafs',
    image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isDownloaded: false,
  },
  {
    id: 2,
    name: 'Abdul Rahman As-Sudais',
    country: 'Saudi Arabia',
    style: 'Hafs',
    image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isDownloaded: false,
  },
  {
    id: 3,
    name: 'Saad Al-Ghamidi',
    country: 'Saudi Arabia',
    style: 'Hafs',
    image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isDownloaded: false,
  },
  {
    id: 4,
    name: 'Maher Al-Muaiqly',
    country: 'Saudi Arabia',
    style: 'Hafs',
    image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isDownloaded: false,
  },
];

interface PlaybackState {
  isPlaying: boolean;
  currentVerse: number | null;
  currentSurah: number | null;
  currentTime: number;
  duration: number;
  selectedQari: number;
  playbackSpeed: number;
  repeatMode: 'none' | 'verse' | 'surah';
}

class AudioService {
  private static instance: AudioService;
  private sound: Audio.Sound | null = null;
  private playbackState: PlaybackState = {
    isPlaying: false,
    currentVerse: null,
    currentSurah: null,
    currentTime: 0,
    duration: 0,
    selectedQari: 1,
    playbackSpeed: 1.0,
    repeatMode: 'none',
  };
  private listeners: ((state: PlaybackState) => void)[] = [];
  private qaris: Qari[] = [...QARIS];

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async initialize() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    await this.loadQariDownloadStatus();
  }

  private async loadQariDownloadStatus() {
    try {
      const downloadedQaris = await AsyncStorage.getItem('downloaded_qaris');
      if (downloadedQaris) {
        const downloadedIds = JSON.parse(downloadedQaris);
        this.qaris = this.qaris.map(qari => ({
          ...qari,
          isDownloaded: downloadedIds.includes(qari.id),
        }));
      }
    } catch (error) {
      console.error('Error loading Qari download status:', error);
    }
  }

  private async saveQariDownloadStatus() {
    try {
      const downloadedIds = this.qaris.filter(q => q.isDownloaded).map(q => q.id);
      await AsyncStorage.setItem('downloaded_qaris', JSON.stringify(downloadedIds));
    } catch (error) {
      console.error('Error saving Qari download status:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.playbackState));
  }

  subscribe(listener: (state: PlaybackState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getQaris(): Qari[] {
    return this.qaris;
  }

  getPlaybackState(): PlaybackState {
    return { ...this.playbackState };
  }

  async playVerse(surahId: number, verseId: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // In a real app, this would be the actual audio URL
      const audioUrl = this.getAudioUrl(surahId, verseId, this.playbackState.selectedQari);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, rate: this.playbackState.playbackSpeed }
      );

      this.sound = sound;
      
      this.playbackState = {
        ...this.playbackState,
        isPlaying: true,
        currentVerse: verseId,
        currentSurah: surahId,
      };

      // Set up playback status updates
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.playbackState = {
            ...this.playbackState,
            currentTime: status.positionMillis || 0,
            duration: status.durationMillis || 0,
            isPlaying: status.isPlaying || false,
          };
          this.notifyListeners();
        }
      });

      this.notifyListeners();
    } catch (error) {
      console.error('Error playing verse:', error);
    }
  }

  private getAudioUrl(surahId: number, verseId: number, qariId: number): string {
    // Mock audio URL - in a real app, this would be actual audio files
    return `https://www.soundjay.com/misc/sounds/bell-ringing-05.wav`;
  }

  async pauseAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
      this.playbackState.isPlaying = false;
      this.notifyListeners();
    }
  }

  async resumeAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
      this.playbackState.isPlaying = true;
      this.notifyListeners();
    }
  }

  async stopAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
    
    this.playbackState = {
      ...this.playbackState,
      isPlaying: false,
      currentVerse: null,
      currentSurah: null,
      currentTime: 0,
      duration: 0,
    };
    this.notifyListeners();
  }

  async seekTo(position: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(position);
    }
  }

  async setPlaybackSpeed(speed: number): Promise<void> {
    if (this.sound) {
      await this.sound.setRateAsync(speed, true);
    }
    this.playbackState.playbackSpeed = speed;
    this.notifyListeners();
  }

  setRepeatMode(mode: 'none' | 'verse' | 'surah'): void {
    this.playbackState.repeatMode = mode;
    this.notifyListeners();
  }

  selectQari(qariId: number): void {
    this.playbackState.selectedQari = qariId;
    this.notifyListeners();
  }

  async downloadQari(qariId: number, onProgress?: (progress: number) => void): Promise<void> {
    // Simulate download process
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Mark as downloaded
          this.qaris = this.qaris.map(qari =>
            qari.id === qariId ? { ...qari, isDownloaded: true } : qari
          );
          
          this.saveQariDownloadStatus();
          resolve();
        }
      }, 200);
    });
  }

  async removeQariDownload(qariId: number): Promise<void> {
    this.qaris = this.qaris.map(qari =>
      qari.id === qariId ? { ...qari, isDownloaded: false } : qari
    );
    await this.saveQariDownloadStatus();
  }

  getSelectedQari(): Qari | undefined {
    return this.qaris.find(qari => qari.id === this.playbackState.selectedQari);
  }
}

export default AudioService;