import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import api from '../config/api';
import { theme, spacing } from '../theme';

export default function DreamInputScreen({ navigation }) {
  const [dreamText, setDreamText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) {
      Alert.alert('Error', 'Please enter your dream');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/dreams/generate', { dream_text: dreamText });
      navigation.navigate('Results', { result: response.data });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to analyze dream');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Tell Us Your Dream</Title>
        <TextInput
          label="Dream Description"
          value={dreamText}
          onChangeText={setDreamText}
          mode="outlined"
          multiline
          numberOfLines={10}
          style={styles.input}
          placeholder="Describe your dream in detail..."
        />
        <Button mode="contained" onPress={handleAnalyze} loading={loading} disabled={loading} style={styles.button}>
          Analyze Dream
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, marginBottom: spacing.lg, color: theme.colors.primary },
  input: { marginBottom: spacing.lg, minHeight: 200 },
  button: { marginTop: spacing.md },
});
