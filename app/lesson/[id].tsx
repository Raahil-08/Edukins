import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, BookOpen, User } from 'lucide-react-native';
import { apiService } from '@/services/api';
import AudioPlayer from '@/components/AudioPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LessonDetail {
  id: string;
  subject: string;
  grade: number;
  topic: string;
  avatar: string;
  script: string;
  duration: string;
  difficulty: string;
}

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      const lessonData = await apiService.getLesson(id!);
      setLesson(lessonData);
    } catch (err: any) {
      console.error('Failed to load lesson:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Science': '#10b981',
      'Math': '#f59e0b',
      'English': '#6366f1',
      'History': '#ef4444',
      'Geography': '#8b5cf6',
    };
    return colors[subject] || '#6b7280';
  };

  if (loading) {
    return <LoadingSpinner message="Loading lesson..." />;
  }

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
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
        <Text style={styles.headerTitle}>Lesson Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.lessonHeader}>
          <View style={styles.subjectContainer}>
            <View style={[styles.subjectBadge, { backgroundColor: getSubjectColor(lesson.subject) }]}>
              <BookOpen size={16} color="#ffffff" />
              <Text style={styles.subjectText}>{lesson.subject}</Text>
            </View>
            <Text style={styles.gradeText}>Grade {lesson.grade}</Text>
          </View>
          <Text style={styles.topic}>{lesson.topic}</Text>
          <View style={styles.avatarContainer}>
            <User size={20} color="#6366f1" />
            <Text style={styles.avatarText}>Taught by {lesson.avatar}</Text>
          </View>
        </View>

        <View style={styles.scriptContainer}>
          <Text style={styles.scriptTitle}>Lesson Content</Text>
          <ScrollView style={styles.scriptScroll} nestedScrollEnabled={true}>
            <Text style={styles.scriptText}>{lesson.script}</Text>
          </ScrollView>
        </View>

        <AudioPlayer lessonId={lesson.id} avatar={lesson.avatar} />
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
  lessonHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  subjectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subjectText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topic: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  scriptContainer: {
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scriptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  scriptScroll: {
    maxHeight: 300,
  },
  scriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'justify',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  },
});