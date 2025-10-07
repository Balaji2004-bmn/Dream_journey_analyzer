import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Text, ActivityIndicator, FAB } from 'react-native-paper';
import api from '../config/api';
import { theme, spacing } from '../theme';

export default function MyDreamsScreen({ navigation }) {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const response = await api.get('/dreams');
      setDreams(response.data.dreams || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dreams');
    } finally {
      setLoading(false);
    }
  };

  const renderDream = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('DreamDetail', { dream: item })}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Text numberOfLines={2}>{item.content}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dreams}
        renderItem={renderDream}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No dreams yet. Start by adding one!</Text>}
      />
      <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate('DreamInput')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.md },
  date: { marginTop: spacing.sm, fontSize: 12, color: theme.colors.disabled },
  empty: { textAlign: 'center', marginTop: spacing.xl, color: theme.colors.disabled },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: theme.colors.primary },
});
