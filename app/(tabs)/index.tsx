import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Wifi, WifiOff, RefreshCw, Calendar, Clock, CircleCheck as CheckCircle2, MapPin, CircleAlert as AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  title: string;
  site: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  status: 'upcoming' | 'pending' | 'completed';
  dueDate: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
}

export default function TasksScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [issyncing, setIsSyncing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'pending' | 'completed'>('upcoming');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
    // Simulate network status changes
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.3); // 70% chance online
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('inspection_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Initialize with sample tasks
        const sampleTasks: Task[] = [
          {
            id: '1',
            title: 'Environmental Compliance Check',
            site: 'Industrial Plant A',
            type: 'Environmental',
            priority: 'high',
            status: 'upcoming',
            dueDate: '2025-01-20',
            location: { latitude: 37.7749, longitude: -122.4194 },
            description: 'Quarterly environmental compliance inspection including air quality and waste management assessment.',
          },
          {
            id: '2',
            title: 'Safety Equipment Audit',
            site: 'Construction Site B',
            type: 'Safety',
            priority: 'medium',
            status: 'pending',
            dueDate: '2025-01-18',
            location: { latitude: 37.7849, longitude: -122.4094 },
            description: 'Monthly safety equipment inspection and emergency response readiness check.',
          },
          {
            id: '3',
            title: 'Water Quality Assessment',
            site: 'Treatment Facility C',
            type: 'Environmental',
            priority: 'high',
            status: 'completed',
            dueDate: '2025-01-15',
            location: { latitude: 37.7649, longitude: -122.4294 },
            description: 'Bi-weekly water quality testing and treatment process evaluation.',
          },
        ];
        setTasks(sampleTasks);
        await AsyncStorage.setItem('inspection_tasks', JSON.stringify(sampleTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your connection.');
      return;
    }

    setIsSyncing(true);
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert('Sync Complete', 'All data has been synchronized successfully.');
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Calendar size={16} color="#007AFF" />;
      case 'pending': return <Clock size={16} color="#FF9500" />;
      case 'completed': return <CheckCircle2 size={16} color="#34C759" />;
      default: return <AlertCircle size={16} color="#8E8E93" />;
    }
  };

  const filteredTasks = tasks.filter(task => task.status === selectedTab);

  const renderTask = (task: Task) => (
    <TouchableOpacity key={task.id} style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.taskMeta}>
            <MapPin size={14} color="#8E8E93" />
            <Text style={styles.taskSite}>{task.site}</Text>
          </View>
        </View>
        <View style={styles.taskStatus}>
          {getStatusIcon(task.status)}
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
            <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <View style={styles.taskFooter}>
        <Text style={styles.taskType}>{task.type}</Text>
        <Text style={styles.taskDate}>Due: {task.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Tasks</Text>
        <View style={styles.headerActions}>
          <View style={styles.statusIndicator}>
            {isOnline ? (
              <Wifi size={20} color="#34C759" />
            ) : (
              <WifiOff size={20} color="#FF3B30" />
            )}
            <Text style={[styles.statusText, { color: isOnline ? '#34C759' : '#FF3B30' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.syncButton, !isOnline && styles.syncButtonDisabled]} 
            onPress={handleSync}
            disabled={!isOnline || issyncing}
          >
            <RefreshCw 
              size={16} 
              color={!isOnline ? '#8E8E93' : '#007AFF'} 
              style={issyncing ? styles.spinning : undefined} 
            />
            <Text style={[styles.syncButtonText, !isOnline && styles.syncButtonTextDisabled]}>
              Sync
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {(['upcoming', 'pending', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            <View style={[styles.tabBadge, selectedTab === tab && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, selectedTab === tab && styles.activeTabBadgeText]}>
                {tasks.filter(task => task.status === tab).length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(renderTask)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No {selectedTab} tasks</Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
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
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8E8E93',
    textAlign: 'center',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskSite: {
    fontSize: 12,
    color: '#8E8E93',
  },
  taskStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  taskDescription: {
    fontSize: 14,
    color: '#48484A',
    lineHeight: 18,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  taskDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});