import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { BookOpen, Clock, Star } from 'lucide-react-native';

interface Lesson {
  id: string;
  subject: string;
  grade: number;
  topic: string;
  avatar: string;
  duration: string;
  difficulty: string;
}

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
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

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Beginner': '#10b981',
      'Intermediate': '#f59e0b',
      'Advanced': '#ef4444',
    };
    return colors[difficulty] || '#6b7280';
  };

  const handlePress = () => {
    router.push(`/lesson/${lesson.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.subjectBadge, { backgroundColor: getSubjectColor(lesson.subject) }]}>
          <BookOpen size={16} color="#ffffff" />
          <Text style={styles.subjectText}>{lesson.subject}</Text>
        </View>
        <View style={styles.gradeContainer}>
          <Text style={styles.gradeText}>Grade {lesson.grade}</Text>
        </View>
      </View>

      <Text style={styles.topic}>{lesson.topic}</Text>
      <Text style={styles.avatar}>👨‍🏫 {lesson.avatar}</Text>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.metaText}>{lesson.duration}</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(lesson.difficulty) }]}>
          <Star size={12} color="#ffffff" />
          <Text style={styles.difficultyText}>{lesson.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
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
  gradeContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  topic: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  avatar: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
});