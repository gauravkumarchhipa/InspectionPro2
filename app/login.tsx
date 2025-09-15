import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { User, Lock, Eye, EyeOff, Shield, Smartphone } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  username: string;
  password: string;
}

export default function LoginScreen() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo credentials - in production, this would be a real API call
      const validCredentials = [
        { username: 'inspector1', password: 'demo123', name: 'Sarah Johnson', role: 'Senior Environmental Inspector' },
        { username: 'inspector2', password: 'demo123', name: 'Mike Chen', role: 'Safety Inspector' },
        { username: 'admin', password: 'admin123', name: 'Admin User', role: 'Administrator' },
        { username: 'demo', password: 'demo', name: 'Demo Inspector', role: 'Field Inspector' },
      ];

      const user = validCredentials.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (user) {
        // Store user session
        const userSession = {
          id: Date.now().toString(),
          username: user.username,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString(),
          isAuthenticated: true,
        };

        await AsyncStorage.setItem('user_session', JSON.stringify(userSession));
        
        if (rememberMe) {
          await AsyncStorage.setItem('remember_credentials', JSON.stringify({
            username: credentials.username,
            rememberMe: true,
          }));
        }

        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid username or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRememberedCredentials = async () => {
    try {
      const remembered = await AsyncStorage.getItem('remember_credentials');
      if (remembered) {
        const { username } = JSON.parse(remembered);
        setCredentials(prev => ({ ...prev, username }));
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading remembered credentials:', error);
    }
  };

  React.useEffect(() => {
    loadRememberedCredentials();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield size={48} color="#007AFF" />
            </View>
            <Text style={styles.appTitle}>InspectionPro</Text>
            <Text style={styles.appSubtitle}>Field Inspection Management</Text>
          </View>

          <View style={styles.loginForm}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.instructionText}>Sign in to access your inspection dashboard</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username or Employee ID"
                  value={credentials.username}
                  onChangeText={(text) => setCredentials(prev => ({ ...prev, username: text }))}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={credentials.password}
                  onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#8E8E93" />
                  ) : (
                    <Eye size={20} color="#8E8E93" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>Username: <Text style={styles.demoBold}>demo</Text></Text>
              <Text style={styles.demoText}>Password: <Text style={styles.demoBold}>demo</Text></Text>
              <Text style={styles.demoNote}>Or try: inspector1/demo123, admin/admin123</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.offlineIndicator}>
              <Smartphone size={16} color="#34C759" />
              <Text style={styles.offlineText}>Works offline after first login</Text>
            </View>
            <Text style={styles.versionText}>Version 2.1.0 • Build 2024.12.15</Text>
            <Text style={styles.copyrightText}>© 2025 InspectionPro. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loginForm: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#1D1D1F',
  },
  forgotPassword: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  demoCredentials: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginBottom: 32,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginBottom: 2,
  },
  demoBold: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  demoNote: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});