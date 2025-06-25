import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { BookOpen, Clock, Star, User } from 'lucide-react-native';

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

  const getSubjectImage = (subject: string) => {
    const images: Record<string, string> = {
      'Science': 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Math': 'https://images.pexels.com/photos/6256/mathematics-computation-math-school.jpg?auto=compress&cs=tinysrgb&w=400',
      'English': 'https://images.pexels.com/photos/159581/dictionary-reference-book-learning-meaning-159581.jpeg?auto=compress&cs=tinysrgb&w=400',
      'History': 'https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Geography': 'https://images.pexels.com/photos/335393/pexels-photo-335393.jpeg?auto=compress&cs=tinysrgb&w=400',
    };
    return images[subject] || images['Science'];
  };

  const handlePress = () => {
    router.push(`/lesson/${lesson.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getSubjectImage(lesson.subject) }} 
          style={styles.subjectImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={[styles.subjectBadge, { backgroundColor: getSubjectColor(lesson.subject) }]}>
            <BookOpen size={16} color="#ffffff" />
            <Text style={styles.subjectText}>{lesson.subject}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.topic} numberOfLines={2}>{lesson.topic}</Text>
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeText}>Grade {lesson.grade}</Text>
          </View>
        </View>

        <View style={styles.avatarContainer}>
          <User size={16} color="#6b7280" />
          <Text style={styles.avatar}>{lesson.avatar}</Text>
        </View>

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
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  subjectImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  subjectText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  topic: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
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
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
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
    fontWeight: '500',
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