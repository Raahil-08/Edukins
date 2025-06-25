import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import LessonScreen from './src/screens/LessonScreen';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <LessonScreen />
    </PaperProvider>
  );
}