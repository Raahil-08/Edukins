import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, BookOpen, User, Play, Square, Volume2, RotateCcw, Download, Mic } from 'lucide-react-native';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LessonPlayerScreen() {
  const { 
    lessonId, 
    topic, 
    content, 
    grade,
    voiceId, 
    voiceName, 
    ttsVoiceId 
  } = useLocalSearchParams<{
    lessonId: string;
    topic: string;
    content: string;
    grade: string;
    voiceId: string;
    voiceName: string;
    ttsVoiceId: string;
  }>();

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');

  useEffect(() => {
    return () => {
      // Cleanup audio when component unmounts
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [audioUrl]);

  const generateAudio = async () => {
    try {
      setIsGeneratingAudio(true);
      setError(null);
      setGenerationProgress('Connecting to TTS service...');

      // Try to generate audio using backend TTS service
      try {
        const audioBlob = await apiService.generateTTS(content!, ttsVoiceId!);
        
        setGenerationProgress('Processing audio...');
        
        // Create audio URL from blob
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        setAudioGenerated(true);
        setGenerationProgress('Audio ready!');
        
      } catch (ttsError: any) {
        if (ttsError.message === 'TTS_FALLBACK_TO_BROWSER') {
          // Fallback to browser TTS
          setGenerationProgress('Using browser text-to-speech...');
          setAudioGenerated(true);
        } else {
          throw ttsError;
        }
      }
      
    } catch (err: any) {
      console.error('Failed to generate audio:', err);
      setError(err.message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      // Stop audio
      if (audioUrl) {
        // Stop HTML5 audio
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      } else {
        // Stop speech synthesis
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      }
      setIsPlaying(false);
      return;
    }

    if (!audioGenerated) {
      Alert.alert('Generate Audio First', 'Please generate the audio before playing.');
      return;
    }

    setIsPlaying(true);

    if (audioUrl) {
      // Play generated audio file
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Failed to play audio');
      };
      audio.play().catch(err => {
        setIsPlaying(false);
        setError('Failed to play audio: ' + err.message);
      });
    } else {
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(content!);
        utterance.rate = 0.9;
        utterance.pitch = voiceId?.includes('female') ? 1.1 : 0.9;
        utterance.volume = 0.8;

        // Find appropriate voice based on selection
        const voices = speechSynthesis.getVoices();
        let preferredVoice = voices[0];

        if (voiceId?.includes('british')) {
          preferredVoice = voices.find(v => 
            v.lang.startsWith('en-GB') || v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('british')
          ) || voices[0];
        } else if (voiceId?.includes('australian')) {
          preferredVoice = voices.find(v => 
            v.lang.startsWith('en-AU') || v.name.toLowerCase().includes('au') || v.name.toLowerCase().includes('australian')
          ) || voices[0];
        } else if (voiceId?.includes('canadian')) {
          preferredVoice = voices.find(v => 
            v.lang.startsWith('en-CA') || v.name.toLowerCase().includes('ca') || v.name.toLowerCase().includes('canadian')
          ) || voices[0];
        } else {
          preferredVoice = voices.find(v => 
            v.lang.startsWith('en-US') && v.name.includes('Google')
          ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
        }

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setIsPlaying(false);
          setError('Speech synthesis failed');
        };

        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleRestart = () => {
    if (isPlaying) {
      if (audioUrl) {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      } else {
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      }
      setIsPlaying(false);
    }
    // Restart the audio
    setTimeout(() => {
      handlePlayAudio();
    }, 500);
  };

  const getPlayButtonIcon = () => {
    return isPlaying ? Square : Play;
  };

  const getPlayButtonText = () => {
    if (isPlaying) {
      return audioUrl ? 'Stop Audio' : 'Stop Reading';
    }
    return audioUrl ? 'Play Audio' : 'Read Aloud';
  };

  const getPlayButtonColor = () => {
    return isPlaying ? '#ef4444' : '#10b981';
  };

  const PlayButtonIcon = getPlayButtonIcon();

  if (isGeneratingAudio) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generating Audio</Text>
        </View>
        <LoadingSpinner message={generationProgress} />
        <View style={styles.generatingInfo}>
          <View style={styles.micIcon}>
            <Mic size={32} color="#6366f1" />
          </View>
          <Text style={styles.generatingTitle}>Creating Your Audio</Text>
          <Text style={styles.generatingSubtitle}>
            Generating high-quality audio with {voiceName} voice...
          </Text>
          <View style={styles.processingSteps}>
            <Text style={styles.stepText}>🎤 Processing text content...</Text>
            <Text style={styles.stepText}>🔊 Generating natural speech...</Text>
            <Text style={styles.stepText}>✨ Optimizing audio quality...</Text>
            <Text style={styles.stepText}>📱 Preparing for playback...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lesson Player</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.lessonHeader}>
          <View style={styles.topicSection}>
            <BookOpen size={24} color="#6366f1" />
            <Text style={styles.topic}>{topic}</Text>
          </View>
          
          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <User size={20} color="#6b7280" />
              <Text style={styles.metaText}>Narrated by {voiceName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.gradeText}>Grade {grade}</Text>
            </View>
          </View>
        </View>

        <View style={styles.playerSection}>
          <View style={styles.playerHeader}>
            <Volume2 size={24} color="#6366f1" />
            <Text style={styles.playerTitle}>Audio Player</Text>
          </View>

          {!audioGenerated ? (
            <TouchableOpacity style={styles.generateButton} onPress={generateAudio}>
              <Download size={20} color="#ffffff" />
              <Text style={styles.generateButtonText}>Generate Audio</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.playerControls}>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: getPlayButtonColor() }]}
                onPress={handlePlayAudio}
              >
                <PlayButtonIcon size={24} color="#ffffff" />
                <Text style={styles.playButtonText}>{getPlayButtonText()}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                <RotateCcw size={20} color="#6366f1" />
                <Text style={styles.restartButtonText}>Restart</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              🎧 Put on headphones for the best learning experience
            </Text>
            <Text style={styles.infoText}>
              📖 Follow along with the text below while listening
            </Text>
            {audioGenerated && !audioUrl && (
              <Text style={styles.infoText}>
                🔊 Using browser text-to-speech technology
              </Text>
            )}
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Lesson Content</Text>
          <ScrollView style={styles.contentScroll} nestedScrollEnabled={true}>
            <Text style={styles.contentText}>{content}</Text>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  generatingInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  micIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  generatingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  generatingSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  processingSteps: {
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  lessonHeader: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  topicSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  topic: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  metaSection: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playerSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  playerControls: {
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  restartButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
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
  infoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    color: '#0369a1',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  contentSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  contentScroll: {
    maxHeight: 400,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'justify',
  },
});