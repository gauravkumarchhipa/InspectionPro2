import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { User, Settings, Award, ChartBar as BarChart3, FileText, Globe, Bell, Download, Upload, Wifi, WifiOff, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface UserProfile {
  name: string;
  id: string;
  role: string;
  department: string;
  certifications: string[];
  totalInspections: number;
  completedThisMonth: number;
  averageScore: number;
}

interface AppSettings {
  notifications: boolean;
  autoSync: boolean;
  offlineMode: boolean;
  language: string;
  aiSuggestions: boolean;
}

export default function ProfileScreen() {
  const [profile] = useState<UserProfile>({
    name: 'Sarah Johnson',
    id: 'INS-2024-001',
    role: 'Senior Environmental Inspector',
    department: 'Environmental Compliance',
    certifications: ['ISO 14001', 'OSHA 30', 'Environmental Auditing'],
    totalInspections: 247,
    completedThisMonth: 18,
    averageScore: 94.2,
  });

  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    autoSync: true,
    offlineMode: false,
    language: 'English',
    aiSuggestions: true,
  });

  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncs, setPendingSyncs] = useState(3);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session) {
        setUserSession(JSON.parse(session));
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your connection.');
      return;
    }

    Alert.alert(
      'Sync Data',
      `${pendingSyncs} items will be synchronized. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync',
          onPress: () => {
            // Simulate sync process
            setTimeout(() => {
              setPendingSyncs(0);
              Alert.alert('Success', 'All data synchronized successfully!');
            }, 2000);
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Export all inspection data to CSV format?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting data...') },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Any unsaved data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user_session');
              await AsyncStorage.removeItem('current_inspection_draft');
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    showSwitch = true 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string; 
    value?: boolean; 
    onToggle?: (value: boolean) => void;
    showSwitch?: boolean;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showSwitch && onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor="#FFFFFF"
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <User size={32} color="#007AFF" />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{userSession?.name || profile.name}</Text>
              <Text style={styles.profileRole}>{userSession?.role || profile.role}</Text>
              <Text style={styles.profileId}>ID: {userSession?.username || profile.id}</Text>
              {userSession?.loginTime && (
                <Text style={styles.loginTime}>
                  Last login: {new Date(userSession.loginTime).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsContainer}>
            <StatCard 
              title="Total Inspections" 
              value={profile.totalInspections} 
            />
            <StatCard 
              title="This Month" 
              value={profile.completedThisMonth}
              subtitle="23% above average"
            />
            <StatCard 
              title="Quality Score" 
              value={`${profile.averageScore}%`}
              subtitle="Excellent rating"
            />
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#34C759" />
            <Text style={styles.sectionTitle}>Certifications</Text>
          </View>
          <View style={styles.certificationsContainer}>
            {profile.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationBadge}>
                <CheckCircle2 size={14} color="#34C759" />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>

          <View style={styles.syncStatus}>
            <View style={styles.syncStatusHeader}>
              {isOnline ? (
                <Wifi size={16} color="#34C759" />
              ) : (
                <WifiOff size={16} color="#FF3B30" />
              )}
              <Text style={styles.syncStatusText}>
                {isOnline ? 'Online' : 'Offline'} • {pendingSyncs} pending syncs
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.syncButton, !isOnline && styles.syncButtonDisabled]}
              onPress={handleManualSync}
              disabled={!isOnline}
            >
              <Upload size={16} color={!isOnline ? '#8E8E93' : '#007AFF'} />
              <Text style={[styles.syncButtonText, !isOnline && styles.syncButtonTextDisabled]}>
                Sync Now
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.exportButton} onPress={exportData}>
            <Download size={16} color="#007AFF" />
            <Text style={styles.exportButtonText}>Export Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#8E8E93" />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>

          <View style={styles.settingsContainer}>
            <SettingRow
              icon={<Bell size={18} color="#007AFF" />}
              title="Push Notifications"
              subtitle="Receive alerts for new tasks and insights"
              value={settings.notifications}
              onToggle={(value) => updateSetting('notifications', value)}
            />

            <SettingRow
              icon={<Upload size={18} color="#007AFF" />}
              title="Auto Sync"
              subtitle="Automatically sync when online"
              value={settings.autoSync}
              onToggle={(value) => updateSetting('autoSync', value)}
            />

            <SettingRow
              icon={<WifiOff size={18} color="#FF9500" />}
              title="Offline Mode"
              subtitle="Prioritize offline functionality"
              value={settings.offlineMode}
              onToggle={(value) => updateSetting('offlineMode', value)}
            />

            <SettingRow
              icon={<Globe size={18} color="#007AFF" />}
              title="Language"
              subtitle={settings.language}
              showSwitch={false}
            />

            <SettingRow
              icon={<FileText size={18} color="#FF9500" />}
              title="AI Suggestions"
              subtitle="Enable AI-powered insights and recommendations"
              value={settings.aiSuggestions}
              onToggle={(value) => updateSetting('aiSuggestions', value)}
            />
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Version 2.1.0</Text>
            <Text style={styles.appInfoText}>Build 2024.12.15</Text>
            <Text style={styles.appInfoText}>© 2025 InspectionPro</Text>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  profileId: {
    fontSize: 12,
    color: '#8E8E93',
  },
  loginTime: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#34C759',
    marginTop: 2,
    textAlign: 'center',
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#34C759',
    gap: 6,
  },
  certificationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
  },
  syncStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncStatusText: {
    fontSize: 14,
    color: '#1D1D1F',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  syncButtonTextDisabled: {
    color: '#8E8E93',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  settingsContainer: {
    gap: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingIcon: {
    width: 32,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  appInfoText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});