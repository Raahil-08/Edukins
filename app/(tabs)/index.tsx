import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import LessonCard from '@/components/LessonCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Lesson {
  id: string;
  subject: string;
  grade: number;
  topic: string;
  avatar: string;
  duration: string;
  difficulty: string;
}

export default function LessonsScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      console.log('User authenticated, loading lessons...');
      loadLessons();
    }
  }, [authLoading, user]);

  const loadLessons = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      console.log('Fetching lessons from API...');
      
      const lessonsData = await apiService.getLessons();
      console.log('Lessons loaded:', lessonsData.length, 'lessons');
      
      setLessons(lessonsData);
      
    } catch (err: any) {
      console.error('Failed to load lessons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('Refreshing lessons...');
    loadLessons(true);
  };

  // Show loading only during initial auth
  if (authLoading) {
    return <LoadingSpinner message="Initializing app..." />;
  }

  // Show loading only during initial lesson load
  if (loading && lessons.length === 0) {
    return <LoadingSpinner message="Loading lessons..." />;
  }

  if (error && lessons.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Don't worry! The app is working in demo mode.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderLesson = ({ item }: { item: Lesson }) => (
    <LessonCard lesson={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back, {user?.name || 'Student'}!</Text>
        <Text style={styles.subtitle}>Ready to learn something new today?</Text>
        {error && (
          <View style={styles.demoNotice}>
            <Text style={styles.demoText}>📱 Running in demo mode</Text>
          </View>
        )}
      </View>

      <FlatList
        data={lessons}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  demoNotice: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  demoText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 8,
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
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '600',
  },
});