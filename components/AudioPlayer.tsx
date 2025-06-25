import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Play, Pause, Square, Volume2 } from 'lucide-react-native';
import { audioService } from '@/services/audioService';

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
      <View style={styles.avatarSection}>
        <Volume2 size={24} color="#6366f1" />
        <Text style={styles.avatarText}>Voice: {avatar}</Text>
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
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  playButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
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
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});