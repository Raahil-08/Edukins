import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { audioService } from '../services/audioService';

const LessonAudioPlayer = ({ lessonId, token, lesson }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set auth token when component mounts
    if (token) {
      const { apiService } = require('../services/api');
      apiService.setAuthToken(token);
    }

    return () => {
      // Cleanup audio when component unmounts
      audioService.stopAudio();
    };
  }, [token]);

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
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setIsPlaying(false);
      Alert.alert('Error', err.message);
    }
  };

  const getButtonIcon = () => {
    if (isLoading) return null;
    return isPlaying ? 'stop' : 'play-arrow';
  };

  const getButtonText = () => {
    if (isLoading) return loadingText;
    return isPlaying ? 'Stop Audio' : 'Play Audio';
  };

  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.avatarSection}>
          <MaterialIcons name="record-voice-over" size={24} color="#6366f1" />
          <Text variant="titleMedium" style={styles.avatarText}>
            Voice: {lesson?.avatar || 'AI Tutor'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handlePlayAudio}
            disabled={isLoading}
            icon={getButtonIcon()}
            style={[
              styles.playButton,
              isPlaying && styles.stopButton
            ]}
            contentStyle={styles.buttonContent}
          >
            {isLoading && (
              <ActivityIndicator 
                size="small" 
                color="#ffffff" 
                style={styles.loadingIndicator} 
              />
            )}
            {getButtonText()}
          </Button>
        </View>

        {error && (
          <Text variant="bodySmall" style={styles.errorText}>
            {error}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    marginLeft: 8,
    color: '#374151',
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  playButton: {
    minWidth: 160,
    backgroundColor: '#6366f1',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  buttonContent: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LessonAudioPlayer;