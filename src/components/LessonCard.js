import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const LessonCard = ({ lesson }) => {
  if (!lesson) return null;

  const getSubjectIcon = (subject) => {
    const icons = {
      'Science': 'science',
      'Math': 'calculate',
      'English': 'menu-book',
      'History': 'history-edu',
      'Geography': 'public',
    };
    return icons[subject] || 'school';
  };

  const getGradeColor = (grade) => {
    const colors = {
      1: '#f59e0b', 2: '#f59e0b', 3: '#f59e0b',
      4: '#10b981', 5: '#10b981', 6: '#10b981',
      7: '#6366f1', 8: '#6366f1', 9: '#6366f1',
    };
    return colors[grade] || '#6b7280';
  };

  return (
    <Card style={styles.card} elevation={3}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.subjectSection}>
            <MaterialIcons 
              name={getSubjectIcon(lesson.subject)} 
              size={28} 
              color="#6366f1" 
            />
            <Text variant="headlineSmall" style={styles.subject}>
              {lesson.subject}
            </Text>
          </View>
          
          <Chip 
            mode="flat" 
            style={[styles.gradeChip, { backgroundColor: getGradeColor(lesson.grade) }]}
            textStyle={styles.gradeText}
          >
            Grade {lesson.grade}
          </Chip>
        </View>

        <Text variant="titleLarge" style={styles.topic}>
          {lesson.topic}
        </Text>

        <View style={styles.divider} />
        
        <Text variant="labelMedium" style={styles.scriptLabel}>
          LESSON CONTENT
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subject: {
    marginLeft: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  gradeChip: {
    marginLeft: 8,
  },
  gradeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  topic: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  scriptLabel: {
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LessonCard;