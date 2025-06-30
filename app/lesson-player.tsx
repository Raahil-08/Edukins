import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Play, Square, Volume2, RotateCcw, Download } from 'lucide-react-native';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

declare global {
  interface Window {
    currentAudio?: HTMLAudioElement;
    currentUtterance?: SpeechSynthesisUtterance;
  }
}

export default function LessonPlayerScreen() {
  const { 
    lessonId, topic, content, grade,
    voiceId, voiceName, ttsVoiceId 
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
  const [progress, setProgress] = useState(0); // NEW: progress state
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    };
  }, [audioUrl]);

  const generateAudio = async () => {
    try {
      setIsGeneratingAudio(true);
      setError(null);
      setGenerationProgress('Connecting to TTS service...');
      const audioBlob = await apiService.generateTTS(content!, ttsVoiceId!);
      setGenerationProgress('Processing audio...');
      const url = URL.createObjectURL(audioBlob);
      setAudioBlob(audioBlob);
      setAudioUrl(url);
      setAudioGenerated(true);
      setGenerationProgress('Audio ready!');
    } catch (err: any) {
      console.error('Failed to generate audio:', err);
      setError(err.message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayAudio = async () => {
  if (isPlaying) {
    stopAudio();
    return;
  }

  if (!audioGenerated) {
    Alert.alert('Generate Audio First', 'Please generate the audio before playing.');
    return;
  }

  setIsPlaying(true);

  if (audioUrl) {
    const audio = new Audio(audioUrl);

    audio.ontimeupdate = () => {
      setProgress(audio.duration > 0 ? audio.currentTime / audio.duration : 0);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(1);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setProgress(0);
      setError('Failed to play audio');
    };

    // Store reference globally so stop/restart can control it
    window.currentAudio = audio;

    try {
      await audio.play();
    } catch (err) {
      setIsPlaying(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Failed to play audio: ',errorMessage);
    }
  } else if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(content!);
    utterance.rate = 0.9;
    utterance.pitch = voiceId?.includes('female') ? 1.1 : 0.9;
    utterance.volume = 0.8;

    utterance.onstart = () => setProgress(0);
    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(1);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setError('Speech synthesis failed');
    };

    window.currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  }
};


  const stopAudio = () => {
  if (window.currentAudio) {
    window.currentAudio.pause();
    window.currentAudio.currentTime = 0;
  } else if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  setIsPlaying(false);
  setProgress(0);
};

  const handleRestart = () => {
  stopAudio();
  setTimeout(() => {
    handlePlayAudio();
  }, 500);
  };


  const getPlayButtonIcon = () => (isPlaying ? Square : Play);
  const getPlayButtonText = () => isPlaying ? 'Stop Audio' : 'Play Audio';
  const getPlayButtonColor = () => isPlaying ? '#ef4444' : '#10b981';
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
          <Text style={styles.topic}>{topic}</Text>
          <Text style={styles.gradeText}>Grade {grade}</Text>
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

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  scrollContainer: { paddingBottom: 32 },
  lessonHeader: { backgroundColor: '#ffffff', padding: 24, marginBottom: 16 },
  topic: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  gradeText: { fontSize: 14, fontWeight: '600', color: '#6366f1' },
  playerSection: {
    backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 16,
    borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  playerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  playerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginLeft: 12 },
  generateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 16,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  generateButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  playerControls: { gap: 12 },
  playButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  playButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 12 },
  restartButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6',
    borderWidth: 1, borderColor: '#d1d5db',
  },
  restartButtonText: { color: '#6366f1', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  progressBarContainer: {
    height: 8, width: '100%', backgroundColor: '#e5e7eb',
    borderRadius: 4, overflow: 'hidden', marginTop: 16,
  },
  progressBar: { height: '100%', backgroundColor: '#10b981' },
  errorContainer: { marginTop: 16, padding: 12, backgroundColor: '#fef2f2', borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center', fontWeight: '500' },
  contentSection: {
    backgroundColor: '#ffffff', marginHorizontal: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  contentTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  contentScroll: { maxHeight: 400 },
  contentText: { fontSize: 16, lineHeight: 24, color: '#374151', textAlign: 'justify' },
});
