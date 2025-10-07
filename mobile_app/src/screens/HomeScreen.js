import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Title, Text, Card } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { theme, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Welcome, {user?.email?.split('@')[0]}!</Title>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Start Your Journey</Text>
            <Text>Analyze your dreams with AI and generate stunning videos</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => navigation.navigate('DreamInput')}>
              New Dream
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>My Dreams</Text>
            <Text>View and manage your dream collection</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="outlined" onPress={() => navigation.navigate('MyDreams')}>
              View Dreams
            </Button>
          </Card.Actions>
        </Card>

        <Button mode="text" onPress={signOut} style={styles.signOutButton}>Sign Out</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 28, marginBottom: spacing.lg, color: theme.colors.primary },
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.sm },
  signOutButton: { marginTop: spacing.lg },
});
