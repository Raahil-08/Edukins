import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { apiService } from './api';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private webAudio: HTMLAudioElement | null = null;

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

      if (Platform.OS === 'web') {
        // For web, use text-to-speech or simulate audio playback
        await this.playWebAudio(lessonId, onProgress, onError);
        return;
      }

      // For mobile platforms
      await this.playMobileAudio(lessonId, onProgress, onError);
      
    } catch (error: any) {
      console.error('Audio playback error:', error);
      onError(error.message || 'Failed to play audio');
    }
  }

  private async playWebAudio(
    lessonId: string,
    onProgress: (progress: string) => void,
    onError: (error: string) => void
  ) {
    try {
      onProgress('Preparing audio...');
      
      // Get lesson content for text-to-speech
      const lesson = await apiService.getLesson(lessonId);
      
      if ('speechSynthesis' in window) {
        onProgress('Loading text-to-speech...');
        
        // Use Web Speech API for text-to-speech
        const utterance = new SpeechSynthesisUtterance(lesson.script);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Find a good voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          this.isPlaying = true;
          onProgress('Playing audio...');
        };

        utterance.onend = () => {
          this.isPlaying = false;
          onProgress('Audio finished');
        };

        utterance.onerror = (event) => {
          this.isPlaying = false;
          onError(`Speech synthesis error: ${event.error}`);
        };

        speechSynthesis.speak(utterance);
        
      } else {
        // Fallback: simulate audio playback
        onProgress('Loading audio...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onProgress('Playing audio...');
        this.isPlaying = true;
        
        // Simulate audio duration based on text length
        const duration = Math.max(5000, lesson.script.length * 50); // ~50ms per character
        
        setTimeout(() => {
          this.isPlaying = false;
          onProgress('Audio finished');
        }, duration);
      }
      
    } catch (error: any) {
      onError('Web audio playback failed: ' + error.message);
    }
  }

  private async playMobileAudio(
    lessonId: string,
    onProgress: (progress: string) => void,
    onError: (error: string) => void
  ) {
    try {
      const fileName = `lesson_${lessonId}_audio.wav`;
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
      throw new Error('Mobile audio playback failed: ' + error.message);
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
    if (Platform.OS === 'web') {
      // Stop web speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      if (this.webAudio) {
        this.webAudio.pause();
        this.webAudio = null;
      }
      this.isPlaying = false;
    } else {
      // Stop mobile audio
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
  }

  async pauseAudio() {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        speechSynthesis.pause();
        this.isPlaying = false;
      }
    } else {
      if (this.sound && this.isPlaying) {
        try {
          await this.sound.pauseAsync();
          this.isPlaying = false;
        } catch (error) {
          console.error('Error pausing audio:', error);
        }
      }
    }
  }

  async resumeAudio() {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        speechSynthesis.resume();
        this.isPlaying = true;
      }
    } else {
      if (this.sound && !this.isPlaying) {
        try {
          await this.sound.playAsync();
          this.isPlaying = true;
        } catch (error) {
          console.error('Error resuming audio:', error);
        }
      }
    }
  }

  getPlaybackStatus() {
    return this.isPlaying;
  }
}

// Export a single instance
export default new AudioService();