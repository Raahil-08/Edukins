import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Play, Volume2, User, Sparkles, Mic } from 'lucide-react-native';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  accent: string;
  personality: string;
  color: string;
  preview: string;
  ttsVoiceId: string; // For backend TTS service
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'professor-nova',
    name: 'Professor Nova',
    description: 'Wise and enthusiastic science teacher',
    gender: 'female',
    accent: 'American',
    personality: 'Encouraging, knowledgeable, patient',
    color: '#10b981',
    preview: 'Hello! I\'m Professor Nova, and I love making learning exciting and easy to understand!',
    ttsVoiceId: 'en-US-AriaNeural'
  },
  {
    id: 'math-wizard',
    name: 'Math Wizard',
    description: 'Friendly mathematician who makes numbers fun',
    gender: 'male',
    accent: 'British',
    personality: 'Playful, logical, supportive',
    color: '#f59e0b',
    preview: 'Greetings! I\'m the Math Wizard, ready to unlock the magical world of learning with you!',
    ttsVoiceId: 'en-GB-RyanNeural'
  },
  {
    id: 'story-teller',
    name: 'Story Teller',
    description: 'Creative narrator with a love for literature',
    gender: 'female',
    accent: 'Australian',
    personality: 'Imaginative, expressive, inspiring',
    color: '#6366f1',
    preview: 'Welcome, young learner! I\'m here to guide you through amazing adventures in education!',
    ttsVoiceId: 'en-AU-NatashaNeural'
  },
  {
    id: 'time-traveler',
    name: 'Time Traveler',
    description: 'Adventurous guide from across the ages',
    gender: 'male',
    accent: 'American',
    personality: 'Adventurous, wise, captivating',
    color: '#ef4444',
    preview: 'Greetings from across time! I\'m your guide, ready to explore knowledge together!',
    ttsVoiceId: 'en-US-DavisNeural'
  },
  {
    id: 'explorer-guide',
    name: 'Explorer Guide',
    description: 'World traveler passionate about discovery',
    gender: 'female',
    accent: 'Canadian',
    personality: 'Curious, energetic, worldly',
    color: '#8b5cf6',
    preview: 'Hello, fellow explorer! I\'m your guide to discovering the wonders of learning!',
    ttsVoiceId: 'en-CA-ClaraNeural'
  },
  {
    id: 'lab-assistant',
    name: 'Lab Assistant',
    description: 'Young scientist excited about discoveries',
    gender: 'male',
    accent: 'American',
    personality: 'Enthusiastic, precise, friendly',
    color: '#06b6d4',
    preview: 'Hey there! I\'m your Lab Assistant, and I can\'t wait to explore amazing discoveries!',
    ttsVoiceId: 'en-US-AndrewNeural'
  },
];

export default function VoiceSelectionScreen() {
  const { lessonId, topic, content, grade } = useLocalSearchParams<{ 
    lessonId: string; 
    topic: string; 
    content: string;
    grade: string;
  }>();
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const handleVoicePreview = async (voice: VoiceOption) => {
    if (previewingVoice === voice.id) {
      // Stop preview
      setPreviewingVoice(null);
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      return;
    }

    setPreviewingVoice(voice.id);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(voice.preview);
      utterance.rate = 0.9;
      utterance.pitch = voice.gender === 'female' ? 1.1 : 0.9;
      utterance.volume = 0.8;

      // Find appropriate voice
      const voices = speechSynthesis.getVoices();
      let preferredVoice = voices[0];

      if (voice.accent === 'British') {
        preferredVoice = voices.find(v => 
          v.lang.startsWith('en-GB') || v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('british')
        ) || voices[0];
      } else if (voice.accent === 'Australian') {
        preferredVoice = voices.find(v => 
          v.lang.startsWith('en-AU') || v.name.toLowerCase().includes('au') || v.name.toLowerCase().includes('australian')
        ) || voices[0];
      } else if (voice.accent === 'Canadian') {
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

      utterance.onend = () => {
        setPreviewingVoice(null);
      };

      utterance.onerror = () => {
        setPreviewingVoice(null);
        Alert.alert('Preview Error', 'Could not preview this voice');
      };

      speechSynthesis.speak(utterance);
    } else {
      // Simulate preview for non-web platforms
      setTimeout(() => {
        setPreviewingVoice(null);
        Alert.alert('Voice Preview', `This is how ${voice.name} would sound!`);
      }, 2000);
    }
  };

  const handleStartLesson = () => {
    if (!selectedVoice) {
      Alert.alert('Select Voice', 'Please choose a voice for your lesson!');
      return;
    }

    router.push({
      pathname: '/lesson-player',
      params: {
        lessonId: lessonId!,
        topic: topic!,
        content: content!,
        grade: grade!,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        ttsVoiceId: selectedVoice.ttsVoiceId,
      }
    });
  };

  const renderVoiceCard = (voice: VoiceOption) => {
    const isSelected = selectedVoice?.id === voice.id;
    const isPreviewing = previewingVoice === voice.id;

    return (
      <TouchableOpacity
        key={voice.id}
        style={[
          styles.voiceCard,
          isSelected && styles.voiceCardSelected,
          { borderColor: isSelected ? voice.color : '#e5e7eb' }
        ]}
        onPress={() => setSelectedVoice(voice)}
      >
        <View style={styles.voiceHeader}>
          <View style={[styles.voiceAvatar, { backgroundColor: `${voice.color}20` }]}>
            <User size={24} color={voice.color} />
          </View>
          <View style={styles.voiceInfo}>
            <Text style={styles.voiceName}>{voice.name}</Text>
            <Text style={styles.voiceDescription}>{voice.description}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.previewButton,
              isPreviewing && styles.previewButtonActive,
              { backgroundColor: isPreviewing ? voice.color : `${voice.color}20` }
            ]}
            onPress={() => handleVoicePreview(voice)}
          >
            {isPreviewing ? (
              <Volume2 size={16} color="#ffffff" />
            ) : (
              <Play size={16} color={voice.color} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.voiceDetails}>
          <View style={styles.voiceAttribute}>
            <Text style={styles.attributeLabel}>Gender:</Text>
            <Text style={styles.attributeValue}>{voice.gender}</Text>
          </View>
          <View style={styles.voiceAttribute}>
            <Text style={styles.attributeLabel}>Accent:</Text>
            <Text style={styles.attributeValue}>{voice.accent}</Text>
          </View>
          <View style={styles.voiceAttribute}>
            <Text style={styles.attributeLabel}>Style:</Text>
            <Text style={styles.attributeValue}>{voice.personality}</Text>
          </View>
        </View>

        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: voice.color }]}>
            <Sparkles size={12} color="#ffffff" />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Voice</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.introSection}>
          <View style={styles.volumeIcon}>
            <Mic size={32} color="#6366f1" />
          </View>
          <Text style={styles.introTitle}>Select Your AI Teacher</Text>
          <Text style={styles.introSubtitle}>
            Choose the voice that will guide you through your lesson about "{topic}"
          </Text>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonInfoText}>Grade {grade} • AI Generated Content</Text>
          </View>
        </View>

        <View style={styles.voicesSection}>
          <Text style={styles.sectionTitle}>Available Voices</Text>
          <Text style={styles.sectionSubtitle}>Tap to select, then tap the play button to preview</Text>
          
          <View style={styles.voicesGrid}>
            {VOICE_OPTIONS.map(renderVoiceCard)}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.startButton,
              !selectedVoice && styles.startButtonDisabled,
              selectedVoice && { backgroundColor: selectedVoice.color }
            ]}
            onPress={handleStartLesson}
            disabled={!selectedVoice}
          >
            <Mic size={20} color="#ffffff" />
            <Text style={styles.startButtonText}>Generate Audio & Start Learning</Text>
          </TouchableOpacity>
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
  introSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  volumeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  lessonInfo: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lessonInfoText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
  },
  voicesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  voicesGrid: {
    gap: 16,
  },
  voiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  voiceCardSelected: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  voiceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  previewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceDetails: {
    gap: 8,
  },
  voiceAttribute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attributeLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  attributeValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});