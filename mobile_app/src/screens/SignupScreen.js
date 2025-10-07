import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { theme, spacing } from '../theme';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signUp } = useAuth();

  const handleSignup = async () => {
    const newErrors = {};
    if (!email.includes('@')) newErrors.email = 'Invalid email';
    if (password.length < 8) newErrors.password = 'Password must be 8+ characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const { data, error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else {
      Alert.alert('Success!', 'Check your email to confirm your account.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Title style={styles.title}>Create Account</Title>
            <View style={styles.form}>
              <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" 
                keyboardType="email-address" autoCapitalize="none" style={styles.input} error={!!errors.email} />
              {errors.email && <HelperText type="error">{errors.email}</HelperText>}
              
              <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" 
                secureTextEntry style={styles.input} error={!!errors.password} />
              {errors.password && <HelperText type="error">{errors.password}</HelperText>}
              
              <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} 
                mode="outlined" secureTextEntry style={styles.input} error={!!errors.confirmPassword} />
              {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}

              <Button mode="contained" onPress={handleSignup} loading={loading} style={styles.button}>Sign Up</Button>
              <Button mode="text" onPress={() => navigation.navigate('Login')}>Already have an account? Sign In</Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  content: { alignItems: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: spacing.xl },
  form: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: spacing.lg },
  input: { marginBottom: spacing.sm },
  button: { marginTop: spacing.md },
});
