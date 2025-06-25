import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { BookOpen, Sparkles, Send, Lightbulb, Globe, Calculator, Atom, Clock } from 'lucide-react-native';

const SUBJECT_SUGGESTIONS = [
  { name: 'Science', icon: Atom, color: '#10b981', topics: ['Solar System', 'Chemical Reactions', 'Human Body', 'Plants & Animals'] },
  { name: 'Math', icon: Calculator, color: '#f59e0b', topics: ['Fractions', 'Geometry', 'Algebra', 'Statistics'] },
  { name: 'History', icon: Clock, color: '#ef4444', topics: ['Ancient Egypt', 'World Wars', 'Renaissance', 'Industrial Revolution'] },
  { name: 'Geography', icon: Globe, color: '#8b5cf6', topics: ['Continents', 'Climate', 'Countries', 'Natural Disasters'] },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [studyTopic, setStudyTopic] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLesson = async () => {
    if (!studyTopic.trim()) {
      Alert.alert('Missing Topic', 'Please enter what you want to study!');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Navigate to lesson generation screen with parameters
      router.push({
        pathname: '/generate-lesson',
        params: {
          topic: studyTopic.trim(),
          grade: selectedGrade.toString(),
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate lesson. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionPress = (topic: string) => {
    setStudyTopic(topic);
  };

  const renderSubjectCard = (subject: any, index: number) => {
    const IconComponent = subject.icon;
    
    return (
      <View key={index} style={styles.subjectCard}>
        <View style={[styles.subjectIcon, { backgroundColor: `${subject.color}20` }]}>
          <IconComponent size={24} color={subject.color} />
        </View>
        <Text style={styles.subjectName}>{subject.name}</Text>
        <View style={styles.topicsContainer}>
          {subject.topics.map((topic: string, topicIndex: number) => (
            <TouchableOpacity
              key={topicIndex}
              style={[styles.topicChip, { borderColor: subject.color }]}
              onPress={() => handleSuggestionPress(topic)}
            >
              <Text style={[styles.topicText, { color: subject.color }]}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Hello, {user?.name || 'Student'}! 👋</Text>
            <Text style={styles.subtitle}>What would you like to learn today?</Text>
          </View>
          
          <View style={styles.sparkleContainer}>
            <Sparkles size={32} color="#6366f1" />
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <BookOpen size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter any topic you want to study..."
              placeholderTextColor="#9ca3af"
              value={studyTopic}
              onChangeText={setStudyTopic}
              multiline
              maxLength={200}
            />
          </View>
          
          <View style={styles.gradeSelector}>
            <Text style={styles.gradeLabel}>Grade Level:</Text>
            <View style={styles.gradeButtons}>
              {[3, 4, 5, 6, 7, 8].map((grade) => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.gradeButton,
                    selectedGrade === grade && styles.gradeButtonActive
                  ]}
                  onPress={() => setSelectedGrade(grade)}
                >
                  <Text style={[
                    styles.gradeButtonText,
                    selectedGrade === grade && styles.gradeButtonTextActive
                  ]}>
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              (!studyTopic.trim() || isGenerating) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateLesson}
            disabled={!studyTopic.trim() || isGenerating}
          >
            <Send size={20} color="#ffffff" />
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating Lesson...' : 'Generate AI Lesson'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.suggestionsSection}>
          <View style={styles.suggestionsHeader}>
            <Lightbulb size={20} color="#f59e0b" />
            <Text style={styles.suggestionsTitle}>Popular Topics</Text>
          </View>
          
          <View style={styles.subjectsGrid}>
            {SUBJECT_SUGGESTIONS.map(renderSubjectCard)}
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>✨ What makes our lessons special?</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>🤖 AI-generated content tailored to your grade</Text>
            <Text style={styles.featureItem}>🎭 Multiple voice options for audio playback</Text>
            <Text style={styles.featureItem}>📚 Comprehensive explanations with examples</Text>
            <Text style={styles.featureItem}>🎯 Personalized learning experience</Text>
          </View>
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
  scrollContainer: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  sparkleContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  gradeSelector: {
    marginBottom: 24,
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  gradeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  gradeButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  gradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  gradeButtonTextActive: {
    color: '#ffffff',
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
  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  suggestionsSection: {
    padding: 20,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  subjectsGrid: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: '#ffffff',
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
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  topicText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});