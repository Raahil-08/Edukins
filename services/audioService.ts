import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { apiService } from './api';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  constructor() {
    this.setupAudio();
  }

  async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
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
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        onProgress('Downloading audio...');
        
        try {
          // Try to download from API
          const audioBlob = await apiService.getLessonAudio(lessonId);
          
          // For web platform, handle blob differently
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

  private async createMockAudio(fileUri: string) {
    // Create a minimal WAV file header for demo purposes
    // This is a very basic implementation for demonstration
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