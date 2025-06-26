import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Sparkles, BookOpen, Clock, User, RefreshCw, Brain, Zap, Cpu, Database } from 'lucide-react-native';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface GeneratedLesson {
  id: string;
  topic: string;
  grade: number;
  content: string;
  estimatedDuration: string;
  difficulty: string;
  keyPoints: string[];
  generatedAt: string;
  wordCount?: number;
  avatar?: string;
}

export default function GenerateLessonScreen() {
  const { topic, grade } = useLocalSearchParams<{ topic: string; grade: string }>();
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const generationSteps = [
    { icon: Brain, text: 'Analyzing your topic...', color: '#10b981' },
    { icon: Database, text: 'Accessing AI knowledge base...', color: '#f59e0b' },
    { icon: Cpu, text: 'Generating personalized content...', color: '#6366f1' },
    { icon: BookOpen, text: 'Structuring the lesson...', color: '#8b5cf6' },
    { icon: Sparkles, text: 'Adding finishing touches...', color: '#ec4899' },
  ];

  useEffect(() => {
    if (topic && grade) {
      generateLesson();
    }
  }, [topic, grade]);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationStep(prev => {
          if (prev < generationSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const generateLesson = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationStep(0);
      
      // Call API to generate lesson with AI
      console.log('Generating lesson for:', { topic, grade });
      const generatedLesson = await apiService.generateLesson(topic!, parseInt(grade!));
      console.log('Generated lesson:', generatedLesson);
      
      setLesson(generatedLesson);
      
    } catch (err: any) {
      console.error('Failed to generate lesson:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleContinueToVoiceSelection = () => {
    if (lesson) {
      router.push({
        pathname: '/voice-selection',
        params: {
          lessonId: lesson.id,
          topic: lesson.topic,
          content: lesson.content,
          grade: lesson.grade.toString(),
        }
      });
    }
  };

  const handleRegenerateLesson = () => {
    generateLesson();
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Generating Lesson</Text>
        </View>
        <LoadingSpinner message="AI is creating your personalized lesson..." />
        <View style={styles.generatingInfo}>
          <View style={styles.brainIcon}>
            <Brain size={40} color="#6366f1" />
          </View>
          <Text style={styles.generatingTitle}>Creating Your AI Lesson</Text>
          <Text style={styles.generatingSubtitle}>
            Our AI is crafting a personalized lesson about "{topic}" for Grade {grade}
          </Text>
          <View style={styles.processingSteps}>
            {generationSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index <= generationStep;
              const isCompleted = index < generationStep;
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.stepItem,
                    isActive && styles.stepItemActive,
                    isCompleted && styles.stepItemCompleted
                  ]}
                >
                  <View style={[
                    styles.stepIconContainer,
                    { backgroundColor: isActive ? `${step.color}20` : '#f3f4f6' }
                  ]}>
                    <StepIcon 
                      size={16} 
                      color={isActive ? step.color : '#9ca3af'} 
                    />
                  </View>
                  <Text style={[
                    styles.stepText,
                    isActive && { color: step.color, fontWeight: '600' }
                  ]}>
                    {step.text}
                  </Text>
                  {isCompleted && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          
          <View style={styles.aiInfo}>
            <Text style={styles.aiInfoText}>
              🤖 Powered by advanced AI technology
            </Text>
            <Text style={styles.aiInfoText}>
              📚 Generating grade-appropriate content
            </Text>
            <Text style={styles.aiInfoText}>
              ⚡ Personalizing for your learning style
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generation Failed</Text>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Brain size={32} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Oops! AI Generation Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRegenerateLesson}>
            <RefreshCw size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Generated Lesson</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.lessonHeader}>
          <View style={styles.successBadge}>
            <Sparkles size={16} color="#10b981" />
            <Text style={styles.successText}>AI Generated</Text>
          </View>
          
          <Text style={styles.lessonTopic}>{lesson.topic}</Text>
          
          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <BookOpen size={16} color="#6b7280" />
              <Text style={styles.metaText}>Grade {lesson.grade}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.metaText}>{lesson.estimatedDuration}</Text>
            </View>
            <View style={styles.metaItem}>
              <User size={16} color="#6b7280" />
              <Text style={styles.metaText}>{lesson.difficulty}</Text>
            </View>
            {lesson.wordCount && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>{lesson.wordCount} words</Text>
              </View>
            )}
          </View>
          
          <View style={styles.generationInfo}>
            <Text style={styles.generationInfoText}>
              Generated on {new Date(lesson.generatedAt).toLocaleDateString()} at {new Date(lesson.generatedAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <View style={styles.keyPointsSection}>
            <Text style={styles.sectionTitle}>Key Learning Points</Text>
            {lesson.keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPoint}>
                <View style={styles.keyPointBullet}>
                  <Text style={styles.keyPointNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>AI Generated Lesson Content</Text>
          <ScrollView style={styles.contentScroll} nestedScrollEnabled={true}>
            <Text style={styles.contentText}>{lesson.content}</Text>
          </ScrollView>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerateLesson}>
            <RefreshCw size={20} color="#6366f1" />
            <Text style={styles.regenerateButtonText}>Generate New Lesson</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinueToVoiceSelection}>
            <Sparkles size={20} color="#ffffff" />
            <Text style={styles.continueButtonText}>Choose Voice & Generate Audio</Text>
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
  generatingInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generatingTitle: {
    fontSize: 26,
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
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 280,
  },
  stepItemActive: {
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepItemCompleted: {
    backgroundColor: '#f0fdf4',
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  aiInfo: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  aiInfoText: {
    fontSize: 12,
    color: '#0369a1',
    textAlign: 'center',
    fontWeight: '500',
  },
  lessonHeader: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  successText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lessonTopic: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 36,
  },
  lessonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  generationInfo: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  generationInfoText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  keyPointsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  keyPointBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  keyPointNumber: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  contentSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
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
  contentScroll: {
    maxHeight: 300,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'justify',
  },
  actionsSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  regenerateButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});