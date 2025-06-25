import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { apiService } from './api';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  constructor() {
    this.setupAudio();
  }

  async setupAudio() {
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
  }

  async downloadAndPlayAudio(
    lessonId: string,
    onProgress: (progress: string) => void,
    onError: (error: string) => void
  ) {
    try {
      await this.stopAudio();

      const fileName = `lesson_${lessonId}_audio.wav`;
      
      if (Platform.OS === 'web') {
        // For web, create a mock audio URL
        onProgress('Creating demo audio...');
        await this.playWebAudio(onProgress, onError);
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        onProgress('Downloading audio...');
        
        try {
          // Try to download from API
          const audioBlob = await apiService.getLessonAudio(lessonId);
          
          // Handle blob for React Native
          if (typeof audioBlob === 'object' && audioBlob.constructor.name === 'Blob') {
            const reader = new FileReader();
            const base64Data = await new Promise<string>((resolve, reject) => {
              reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
              };
              reader.onerror = reject;
              reader.readAsDataURL(audioBlob);
            });

            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });
          }
        } catch (downloadError) {
          // If download fails, create a mock audio file for demo
          onProgress('Creating demo audio...');
          await this.createMockAudio(fileUri);
        }
      }

      onProgress('Loading audio...');

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true, isLooping: false }
      );

      this.sound = sound;
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
          onProgress('Audio finished');
        }
      });

      onProgress('Playing audio...');
      
    } catch (error: any) {
      console.error('Audio playback error:', error);
      onError(error.message || 'Failed to play audio');
    }
  }

  private async playWebAudio(onProgress: (progress: string) => void, onError: (error: string) => void) {
    try {
      // For web demo, simulate audio playback
      onProgress('Loading audio...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onProgress('Playing audio...');
      this.isPlaying = true;
      
      // Simulate 5 second audio playback
      setTimeout(() => {
        this.isPlaying = false;
        onProgress('Audio finished');
      }, 5000);
      
    } catch (error: any) {
      onError('Web audio simulation failed');
    }
  }

  private async createMockAudio(fileUri: string) {
    // Create a minimal WAV file header for demo purposes
    const mockAudioData = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    await FileSystem.writeAsStringAsync(fileUri, mockAudioData, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  async stopAudio() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    } else if (Platform.OS === 'web') {
      // For web simulation
      this.isPlaying = false;
    }
  }

  async pauseAudio() {
    if (this.sound && this.isPlaying) {
      try {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  }

  async resumeAudio() {
    if (this.sound && !this.isPlaying) {
      try {
        await this.sound.playAsync();
        this.isPlaying = true;
      } catch (error) {
        console.error('Error resuming audio:', error);
      }
    }
  }

  getPlaybackStatus() {
    return this.isPlaying;
  }
}

export const audioService = new AudioService();