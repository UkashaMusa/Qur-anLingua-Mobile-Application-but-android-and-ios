import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, Download, CloudDownload as DownloadCloud, Volume2, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudio } from '@/hooks/useAudio';

export default function AudioScreen() {
  const colorScheme = useColorScheme();
  const { 
    qaris, 
    playbackState, 
    downloadProgress, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    selectQari, 
    downloadQari, 
    removeQariDownload,
    seekTo,
    setPlaybackSpeed,
    setRepeatMode,
    getSelectedQari 
  } = useAudio();
  
  const styles = createStyles(colorScheme);

  const handlePlayPause = () => {
    if (playbackState?.isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const handleDownload = async (qariId: number) => {
    const qari = qaris.find(q => q.id === qariId);
    if (qari?.isDownloaded) {
      await removeQariDownload(qariId);
    } else {
      await downloadQari(qariId);
    }
  };

  const handleSeek = async (value: number) => {
    await seekTo(value);
  };

  const handleSpeedChange = async (speed: number) => {
    await setPlaybackSpeed(speed);
  };

  const handleRepeatToggle = () => {
    const modes: ('none' | 'verse' | 'surah')[] = ['none', 'verse', 'surah'];
    const currentIndex = modes.indexOf(playbackState?.repeatMode || 'none');
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!playbackState) {
    return <SafeAreaView style={styles.container}><Text>Loading audio...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audio Recitations</Text>
        <Text style={styles.headerSubtitle}>Listen & Learn</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Playback */}
        <View style={styles.currentPlayback}>
          <View style={styles.playbackInfo}>
            <Text style={styles.currentSurah}>
              {playbackState.currentSurah ? `Surah ${playbackState.currentSurah}` : 'No audio playing'}
            </Text>
            <Text style={styles.currentAyah}>
              {playbackState.currentVerse ? `Ayah ${playbackState.currentVerse}` : 'Select a verse to play'}
            </Text>
            <Text style={styles.currentQari}>
              by {getSelectedQari()?.name || 'No Qari selected'}
            </Text>
          </View>

          {/* Playback Speed and Repeat Controls */}
          <View style={styles.playbackOptions}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleSpeedChange(playbackState.playbackSpeed === 1 ? 1.5 : 1)}
            >
              <Text style={styles.optionText}>{playbackState.playbackSpeed}x</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.optionButton, playbackState.repeatMode !== 'none' && styles.activeOption]}
              onPress={handleRepeatToggle}
            >
              <Repeat size={16} color={playbackState.repeatMode !== 'none' ? '#059669' : (colorScheme === 'dark' ? '#9CA3AF' : '#6B7280')} />
              <Text style={[styles.optionText, playbackState.repeatMode !== 'none' && styles.activeOptionText]}>
                {playbackState.repeatMode === 'verse' ? 'Verse' : playbackState.repeatMode === 'surah' ? 'Surah' : 'Off'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(Math.floor(playbackState.currentTime / 1000))}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(Math.floor(playbackState.duration / 1000))}
              </Text>
            </View>
            <Slider
              style={styles.progressSlider}
              value={playbackState.currentTime}
              minimumValue={0}
              maximumValue={playbackState.duration}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#059669"
              maximumTrackTintColor={colorScheme === 'dark' ? '#4B5563' : '#D1D5DB'}
              thumbStyle={{ backgroundColor: '#059669' }}
            />
          </View>

          <View style={styles.playbackControls}>
            <TouchableOpacity style={styles.controlButton}>
              <SkipBack size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              {playbackState.isPlaying ? (
                <Pause size={32} color="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <SkipForward size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Qaris List */}
        <View style={styles.qarisSection}>
          <Text style={styles.sectionTitle}>Select Qari</Text>
          {qaris.map((qari) => {
            const isDownloading = downloadProgress[qari.id] !== undefined;
            const progress = downloadProgress[qari.id] || 0;
            
            return (
            <TouchableOpacity
              key={qari.id}
              style={[
                styles.qariCard,
                playbackState.selectedQari === qari.id && styles.selectedQariCard
              ]}
              onPress={() => selectQari(qari.id)}
            >
              <Image source={{ uri: qari.image }} style={styles.qariImage} />
              <View style={styles.qariInfo}>
                <Text style={styles.qariName}>{qari.name}</Text>
                <Text style={styles.qariCountry}>{qari.country}</Text>
                <View style={styles.qariStatus}>
                  {qari.isDownloaded ? (
                    <View style={styles.downloadedBadge}>
                      <DownloadCloud size={16} color="#059669" />
                      <Text style={styles.downloadedText}>Downloaded</Text>
                    </View>
                  ) : isDownloading ? (
                    <View style={styles.downloadingBadge}>
                      <Text style={styles.downloadingText}>Downloading {progress}%</Text>
                    </View>
                  ) : (
                    <Text style={styles.notDownloadedText}>Online only</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownload(qari.id)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Text style={styles.downloadButtonText}>{progress}%</Text>
                ) : qari.isDownloaded ? (
                  <DownloadCloud size={24} color="#059669" />
                ) : (
                  <Download size={24} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          );
          })}
        </View>

        {/* Download Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Download Settings</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Audio Quality</Text>
            <Text style={styles.settingValue}>High (320 kbps)</Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Download on Wi-Fi Only</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Storage Used</Text>
            <Text style={styles.settingValue}>2.4 GB / 16 GB</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colorScheme: 'light' | 'dark' | null | undefined) {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#F9FAFB',
    },
    header: {
      padding: 20,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    currentPlayback: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    playbackInfo: {
      alignItems: 'center',
      marginBottom: 20,
    },
    currentSurah: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    currentAyah: {
      fontSize: 16,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 4,
    },
    currentQari: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    progressContainer: {
      marginBottom: 20,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    timeText: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    progressSlider: {
      width: '100%',
      height: 40,
    },
    playbackControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
    },
    controlButton: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#059669',
      justifyContent: 'center',
      alignItems: 'center',
    },
    qarisSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 16,
    },
    qariCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    selectedQariCard: {
      borderColor: '#059669',
      borderWidth: 2,
    },
    qariImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
    },
    qariInfo: {
      flex: 1,
    },
    qariName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    qariCountry: {
      fontSize: 14,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 6,
    },
    qariStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    downloadedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    downloadedText: {
      fontSize: 12,
      color: '#059669',
      fontWeight: '500',
    },
    notDownloadedText: {
      fontSize: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    downloadButton: {
      padding: 8,
    },
    playbackOptions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 16,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
      gap: 4,
    },
    activeOption: {
      backgroundColor: '#059669',
    },
    optionText: {
      fontSize: 12,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    activeOptionText: {
      color: '#FFFFFF',
    },
    downloadingBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    downloadingText: {
      fontSize: 12,
      color: '#92400E',
      fontWeight: '500',
    },
    downloadButtonText: {
      fontSize: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    settingsSection: {
      marginBottom: 24,
    },
    settingCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    settingValue: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
  });
}