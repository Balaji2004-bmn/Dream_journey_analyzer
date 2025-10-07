import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, Card, Button } from 'react-native-paper';
import { theme, spacing } from '../theme';

export default function ResultsScreen({ route, navigation }) {
  const { result } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>{result?.title || 'Dream Analysis'}</Title>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Story</Text>
            <Text>{result?.story || 'No story available'}</Text>
          </Card.Content>
        </Card>

        {result?.video_url && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Video Generated</Text>
              <Text>Video URL: {result.video_url}</Text>
            </Card.Content>
          </Card>
        )}

        <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.button}>
          Back to Home
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, marginBottom: spacing.lg, color: theme.colors.primary },
  card: { marginBottom: spacing.md },
  label: { fontWeight: 'bold', marginBottom: spacing.sm },
  button: { marginTop: spacing.md },
});
