import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const LessonScript = ({ script }) => {
  if (!script) return null;

  return (
    <Card style={styles.card} elevation={1}>
      <Card.Content>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <Text variant="bodyLarge" style={styles.scriptText}>
            {script}
          </Text>
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: '#f8fafc',
    maxHeight: 300,
  },
  scrollView: {
    maxHeight: 250,
  },
  scriptText: {
    lineHeight: 24,
    color: '#374151',
    textAlign: 'justify',
  },
});

export default LessonScript;