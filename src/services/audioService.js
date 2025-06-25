import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { apiService } from './api';

class AudioService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
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

  async downloadAndPlayAudio(lessonId, onProgress, onError) {
    try {
      // Stop any currently playing audio
      await this.stopAudio();

      // Generate file path
      const fileName = `lesson_${lessonId}_audio.mp3`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      let audioUri = fileUri;
      
      if (!fileInfo.exists) {
        onProgress('Downloading audio...');
        
        // Download audio from API
        const audioBlob = await apiService.getLessonAudio(lessonId);
        
        // Convert blob to base64 for React Native
        const reader = new FileReader();
        const base64Data = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        // Save to local file system
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      onProgress('Loading audio...');

      // Load and play audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, isLooping: false }
      );

      this.sound = sound;
      this.isPlaying = true;

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.isPlaying = false;
          onProgress('Audio finished');
        }
      });

      onProgress('Playing audio...');
      
    } catch (error) {
      console.error('Audio playback error:', error);
      onError(error.message);
    }
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