/**
 * AuthButtons Component
 * 
 * Example component showing how to use the useAuth hook
 * for sign in and sign out functionality.
 * 
 * Usage:
 * <AuthButtons />
 */

import React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export function AuthButtons() {
  const { user, isLoading, isAuthenticated, signIn, signUp, signOut, error } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Button title="Try Again" onPress={() => { signIn(); }} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.text}>Email: {user.email}</Text>
        {user.firstName && (
          <Text style={styles.text}>Name: {user.firstName} {user.lastName}</Text>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Sign Out" onPress={signOut} color="#ff4444" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CauseConnect</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={() => { signIn(); }} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={() => { signUp(); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 10,
  },
  buttonContainer: {
    marginVertical: 8,
    width: '100%',
    maxWidth: 300,
  },
});
