import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { BookOpen, Sparkles, Send, Lightbulb, Globe, Calculator, Atom, Clock, Brain, Palette } from 'lucide-react-native';

const SUBJECT_SUGGESTIONS = [
  { 
    name: 'Science', 
    icon: Atom, 
    color: '#10b981', 
    topics: ['Solar System', 'Chemical Reactions', 'Human Body', 'Plants & Animals', 'Weather & Climate', 'Forces & Motion'] 
  },
  { 
    name: 'Math', 
    icon: Calculator, 
    color: '#f59e0b', 
    topics: ['Fractions', 'Geometry', 'Algebra', 'Statistics', 'Multiplication', 'Problem Solving'] 
  },
  { 
    name: 'History', 
    icon: Clock, 
    color: '#ef4444', 
    topics: ['Ancient Egypt', 'World Wars', 'Renaissance', 'Industrial Revolution', 'American History', 'Medieval Times'] 
  },
  { 
    name: 'Geography', 
    icon: Globe, 
    color: '#8b5cf6', 
    topics: ['Continents', 'Climate', 'Countries', 'Natural Disasters', 'Oceans', 'Mountains'] 
  },
  { 
    name: 'English', 
    icon: BookOpen, 
    color: '#6366f1', 
    topics: ['Creative Writing', 'Grammar', 'Reading Comprehension', 'Poetry', 'Storytelling', 'Vocabulary'] 
  },
  { 
    name: 'Art', 
    icon: Palette, 
    color: '#ec4899', 
    topics: ['Drawing Basics', 'Color Theory', 'Famous Artists', 'Art History', 'Painting Techniques', 'Sculpture'] 
  },
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

    if (studyTopic.trim().length < 3) {
      Alert.alert('Topic Too Short', 'Please enter at least 3 characters for your topic.');
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
          <IconComponent size={28} color={subject.color} />
        </View>
        <Text style={styles.subjectName}>{subject.name}</Text>
        <View style={styles.topicsContainer}>
          {subject.topics.map((topic: string, topicIndex: number) => (
            <TouchableOpacity
              key={topicIndex}
              style={[styles.topicChip, { borderColor: subject.color }]}
              onPress={() => handleSuggestionPress(topic)}
              activeOpacity={0.7}
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
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Hello, {user?.name || 'Student'}! 👋</Text>
            <Text style={styles.subtitle}>What would you like to learn today?</Text>
          </View>
          
          <View style={styles.sparkleContainer}>
            <Brain size={32} color="#6366f1" />
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
              returnKeyType="done"
              blurOnSubmit={true}
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
                  activeOpacity={0.7}
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
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <Sparkles size={20} color="#ffffff" />
            ) : (
              <Send size={20} color="#ffffff" />
            )}
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating AI Lesson...' : 'Generate AI Lesson'}
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
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureText}>AI-generated content tailored to your grade level</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎭</Text>
              <Text style={styles.featureText}>Multiple AI teacher personalities with unique voices</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔊</Text>
              <Text style={styles.featureText}>High-quality text-to-speech audio narration</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureText}>Comprehensive explanations with key learning points</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>Personalized learning experience for every student</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>Instant lesson generation on any topic</Text>
            </View>
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
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  sparkleContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    lineHeight: 22,
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
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: 44,
    alignItems: 'center',
  },
  gradeButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  subjectsGrid: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});