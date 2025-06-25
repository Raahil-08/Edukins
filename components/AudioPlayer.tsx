import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Play, Pause, Square, Volume2, Mic } from 'lucide-react-native';
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
      setLoadingText('');
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
            setLoadingText('');
          }
        },
        (errorMessage) => {
          setError(errorMessage);
          setIsLoading(false);
          setIsPlaying(false);
          setLoadingText('');
          
          // Show user-friendly error message
          if (Platform.OS === 'web') {
            Alert.alert(
              'Audio Feature', 
              'This lesson will be read aloud using text-to-speech. Make sure your device volume is turned up!'
            );
          } else {
            Alert.alert('Audio Error', errorMessage);
          }
        }
      );
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      setIsPlaying(false);
      setLoadingText('');
      Alert.alert('Error', err.message);
    }
  };

  const getButtonIcon = () => {
    if (isLoading) return Mic;
    return isPlaying ? Square : Play;
  };

  const getButtonText = () => {
    if (isLoading) return loadingText;
    if (isPlaying) {
      return Platform.OS === 'web' ? 'Stop Reading' : 'Stop Audio';
    }
    return Platform.OS === 'web' ? 'Read Aloud' : 'Play Audio';
  };

  const getButtonColor = () => {
    if (isLoading) return '#9ca3af';
    if (isPlaying) return '#ef4444';
    return '#6366f1';
  };

  const ButtonIcon = getButtonIcon();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${getButtonColor()}20` }]}>
            <Volume2 size={24} color={getButtonColor()} />
          </View>
          <View>
            <Text style={styles.avatarTitle}>
              {Platform.OS === 'web' ? 'Text-to-Speech' : 'Voice Narrator'}
            </Text>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: getButtonColor() }
        ]}
        onPress={handlePlayAudio}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <ButtonIcon size={20} color="#ffffff" />
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'web' && !error && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 This lesson will be read aloud using your browser's text-to-speech feature
          </Text>
        </View>
      )}

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
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    color: '#0369a1',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
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