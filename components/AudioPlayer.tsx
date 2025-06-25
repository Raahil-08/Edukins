import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Play, Pause, Square, Volume2 } from 'lucide-react-native';
import audioService from '@/services/audioService';

interface AudioPlayerProps {
  lessonId: string;
  avatar: string;
}

export default function AudioPlayer({ lessonId, avatar }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioService.stopAudio();
    };
  }, []);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      await audioService.stopAudio();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingText('Preparing audio...');

    try {
      await audioService.downloadAndPlayAudio(
        lessonId,
        (progress) => {
          setLoadingText(progress);
          if (progress === 'Playing audio...') {
            setIsLoading(false);
            setIsPlaying(true);
          }
          if (progress === 'Audio finished') {
            setIsPlaying(false);
          }
        },
        (errorMessage) => {
          setError(errorMessage);
          setIsLoading(false);
          setIsPlaying(false);
          Alert.alert('Audio Error', errorMessage);
        }
      );
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      setIsPlaying(false);
      Alert.alert('Error', err.message);
    }
  };

  const getButtonIcon = () => {
    if (isLoading) return null;
    return isPlaying ? Square : Play;
  };

  const getButtonText = () => {
    if (isLoading) return loadingText;
    return isPlaying ? 'Stop Audio' : 'Play Audio';
  };

  const ButtonIcon = getButtonIcon();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={styles.iconContainer}>
            <Volume2 size={24} color="#6366f1" />
          </View>
          <View>
            <Text style={styles.avatarTitle}>Voice Narrator</Text>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.playButton,
          isPlaying && styles.stopButton,
          isLoading && styles.loadingButton
        ]}
        onPress={handlePlayAudio}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {ButtonIcon && <ButtonIcon size={20} color="#ffffff" />}
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </View>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    marginBottom: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  playButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  loadingButton: {
    backgroundColor: '#9ca3af',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});