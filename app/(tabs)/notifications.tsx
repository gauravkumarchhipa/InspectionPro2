import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Bell, BellRing, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Sparkles, TrendingUp, Clock, MapPin } from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'task' | 'ai_insight' | 'performance' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  metadata?: {
    taskId?: string;
    siteId?: string;
    inspectionId?: string;
  };
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ai_insights'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'task',
        title: 'New Inspection Assigned',
        message: 'Environmental compliance check at Industrial Plant A scheduled for tomorrow',
        timestamp: '2025-01-17T09:00:00Z',
        isRead: false,
        priority: 'high',
        actionRequired: true,
        metadata: { taskId: '1', siteId: '1' },
      },
      {
        id: '2',
        type: 'ai_insight',
        title: 'AI Alert: Pattern Detected',
        message: 'Dust levels at Construction Site B have been consistently elevated. Consider immediate follow-up.',
        timestamp: '2025-01-17T08:30:00Z',
        isRead: false,
        priority: 'high',
        metadata: { siteId: '2' },
      },
      {
        id: '3',
        type: 'performance',
        title: 'Weekly Performance Summary',
        message: 'You completed 8 inspections this week - 23% above average. Great work!',
        timestamp: '2025-01-16T17:00:00Z',
        isRead: true,
        priority: 'medium',
      },
      {
        id: '4',
        type: 'alert',
        title: 'Equipment Calibration Due',
        message: 'Air quality monitor at Treatment Facility C requires calibration within 3 days',
        timestamp: '2025-01-16T14:00:00Z',
        isRead: false,
        priority: 'medium',
        actionRequired: true,
        metadata: { siteId: '3' },
      },
      {
        id: '5',
        type: 'ai_insight',
        title: 'AI Recommendation',
        message: 'Based on historical data, consider scheduling additional safety checks during high-wind conditions',
        timestamp: '2025-01-16T10:00:00Z',
        isRead: true,
        priority: 'low',
      },
      {
        id: '6',
        type: 'task',
        title: 'Inspection Reminder',
        message: 'Safety equipment audit at Construction Site B is overdue by 2 days',
        timestamp: '2025-01-15T16:00:00Z',
        isRead: false,
        priority: 'high',
        actionRequired: true,
        metadata: { taskId: '2', siteId: '2' },
      },
    ];

    setNotifications(sampleNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 size={20} color={priority === 'high' ? '#FF3B30' : '#007AFF'} />;
      case 'ai_insight':
        return <Sparkles size={20} color="#FF9500" />;
      case 'performance':
        return <TrendingUp size={20} color="#34C759" />;
      case 'alert':
        return <AlertTriangle size={20} color="#FF3B30" />;
      default:
        return <Bell size={20} color="#8E8E93" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'ai_insights') return notification.type === 'ai_insight';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'unread', 'ai_insights'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[styles.filterButton, filter === filterOption && styles.activeFilterButton]}
            onPress={() => setFilter(filterOption)}
          >
            <Text style={[styles.filterButtonText, filter === filterOption && styles.activeFilterButtonText]}>
              {filterOption === 'all' ? 'All' : 
               filterOption === 'unread' ? 'Unread' : 
               'AI Insights'}
            </Text>
            {filterOption === 'unread' && unreadCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
        {filteredNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadNotification,
              notification.actionRequired && styles.actionRequiredCard,
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.notificationHeader}>
              <View style={styles.notificationIcon}>
                {getNotificationIcon(notification.type, notification.priority)}
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationTop}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <View style={styles.notificationMeta}>
                    <Clock size={12} color="#8E8E93" />
                    <Text style={styles.notificationTime}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                
                <View style={styles.notificationFooter}>
                  <View style={styles.notificationTags}>
                    <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(notification.priority) }]}>
                      <Text style={styles.priorityTagText}>
                        {notification.priority.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>
                        {notification.type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  {notification.actionRequired && (
                    <View style={styles.actionRequired}>
                      <Text style={styles.actionRequiredText}>ACTION REQUIRED</Text>
                    </View>
                  )}
                </View>

                {notification.metadata?.siteId && (
                  <View style={styles.locationInfo}>
                    <MapPin size={12} color="#8E8E93" />
                    <Text style={styles.locationText}>
                      Site ID: {notification.metadata.siteId}
                    </Text>
                  </View>
                )}
              </View>
              
              {!notification.isRead && (
                <View style={styles.unreadIndicator} />
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <BellRing size={48} color="#E5E5EA" />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateMessage}>
              {filter === 'unread' 
                ? 'All caught up! No unread notifications.'
                : filter === 'ai_insights'
                ? 'No AI insights available yet.'
                : 'You don\'t have any notifications yet.'
              }
            </Text>
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
  unreadCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  notificationList: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  unreadNotification: {
    backgroundColor: '#F8F9FF',
    borderColor: '#E0E7FF',
  },
  actionRequiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
    marginRight: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#48484A',
    lineHeight: 18,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTags: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E5E5EA',
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  actionRequired: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  actionRequiredText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});