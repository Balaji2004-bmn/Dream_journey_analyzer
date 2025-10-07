import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, Card, Chip } from 'react-native-paper';
import { theme, spacing } from '../theme';

export default function DreamDetailScreen({ route }) {
  const { dream } = route.params || {};
  const analysis = dream?.analysis || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>{dream?.title}</Title>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Dream Content</Text>
            <Text>{dream?.content}</Text>
          </Card.Content>
        </Card>

        {analysis.keywords && analysis.keywords.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Keywords</Text>
              <View style={styles.chipContainer}>
                {analysis.keywords.map((keyword, idx) => (
                  <Chip key={idx} style={styles.chip}>{keyword}</Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {analysis.emotions && analysis.emotions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Emotions</Text>
              {analysis.emotions.map((emotion, idx) => (
                <Text key={idx}>• {emotion.emotion}: {emotion.intensity}%</Text>
              ))}
            </Card.Content>
          </Card>
        )}

        {dream?.video_url && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Video</Text>
              <Text>Video available</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, marginBottom: spacing.lg, color: theme.colors.primary },
  card: { marginBottom: spacing.md },
  label: { fontWeight: 'bold', marginBottom: spacing.sm, fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  chip: { marginRight: spacing.sm, marginBottom: spacing.sm },
});
