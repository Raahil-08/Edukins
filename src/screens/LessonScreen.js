import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Alert,
  RefreshControl 
} from 'react-native';
import { 
  Text, 
  ActivityIndicator, 
  Button,
  Appbar,
  Snackbar 
} from 'react-native-paper';
import { apiService } from '../services/api';
import LessonCard from '../components/LessonCard';
import LessonScript from '../components/LessonScript';
import LessonAudioPlayer from '../components/LessonAudioPlayer';

const LessonScreen = () => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  // Demo values - in a real app, these would come from navigation params or auth context
  const DEMO_LESSON_ID = 4;
  const DEMO_JWT_TOKEN = "demo.jwt.token";

  useEffect(() => {
    loadLesson();
  }, []);

  const loadLesson = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      // Set auth token
      apiService.setAuthToken(DEMO_JWT_TOKEN);
      
      // Fetch lesson data
      const lessonData = await apiService.getLesson(DEMO_LESSON_ID);
      setLesson(lessonData);
      
    } catch (err) {
      console.error('Failed to load lesson:', err);
      setError(err.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    loadLesson();
  };

  const onRefresh = () => {
    loadLesson(true);
  };

  if (loading && !lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Edukins" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading lesson...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Edukins" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Oops! Something went wrong
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
          <Button 
            mode="contained" 
            onPress={handleRetry}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Edukins" subtitle="Interactive Learning" />
      </Appbar.Header>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
          />
        }
      >
        {lesson && (
          <>
            <LessonCard lesson={lesson} />
            <LessonScript script={lesson.script} />
            <LessonAudioPlayer 
              lessonId={lesson.id} 
              token={DEMO_JWT_TOKEN}
              lesson={lesson}
            />
          </>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Retry',
          onPress: handleRetry,
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  errorTitle: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366f1',
  },
});

export default LessonScreen;