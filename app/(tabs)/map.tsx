import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MapPin, Navigation, Filter, Search, Calendar, Clock, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import * as Location from 'expo-location';

interface Site {
  id: string;
  name: string;
  type: string;
  status: 'upcoming' | 'pending' | 'completed';
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastInspection: string;
  nextInspection: string;
  priority: 'high' | 'medium' | 'low';
}

export default function MapScreen() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'pending' | 'completed'>('all');
  const [sites] = useState<Site[]>([
    {
      id: '1',
      name: 'Industrial Plant A',
      type: 'Environmental',
      status: 'upcoming',
      address: '123 Industry Ave, San Francisco, CA',
      location: { latitude: 37.7749, longitude: -122.4194 },
      lastInspection: '2024-12-15',
      nextInspection: '2025-01-20',
      priority: 'high',
    },
    {
      id: '2',
      name: 'Construction Site B',
      type: 'Safety',
      status: 'pending',
      address: '456 Builder St, San Francisco, CA',
      location: { latitude: 37.7849, longitude: -122.4094 },
      lastInspection: '2024-12-20',
      nextInspection: '2025-01-18',
      priority: 'medium',
    },
    {
      id: '3',
      name: 'Treatment Facility C',
      type: 'Environmental',
      status: 'completed',
      address: '789 Water Way, San Francisco, CA',
      location: { latitude: 37.7649, longitude: -122.4294 },
      lastInspection: '2025-01-15',
      nextInspection: '2025-02-15',
      priority: 'high',
    },
  ]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get current location.');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Calendar size={16} color="#007AFF" />;
      case 'pending': return <Clock size={16} color="#FF9500" />;
      case 'completed': return <CheckCircle2 size={16} color="#34C759" />;
      default: return <MapPin size={16} color="#8E8E93" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const filteredSites = selectedFilter === 'all' 
    ? sites 
    : sites.filter(site => site.status === selectedFilter);

  const sortedSites = currentLocation 
    ? [...filteredSites].sort((a, b) => {
        const distanceA = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          a.location.latitude,
          a.location.longitude
        );
        const distanceB = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          b.location.latitude,
          b.location.longitude
        );
        return distanceA - distanceB;
      })
    : filteredSites;

  const handleNavigate = (site: Site) => {
    const url = `https://maps.google.com/?q=${site.location.latitude},${site.location.longitude}`;
    Alert.alert(
      'Navigate to Site',
      `Open ${site.name} in Maps app?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Maps', onPress: () => console.log('Navigate to:', url) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspection Sites</Text>
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Navigation size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
          {(['all', 'upcoming', 'pending', 'completed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterButtonText, selectedFilter === filter && styles.activeFilterButtonText]}>
                {filter === 'all' ? 'All Sites' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {currentLocation && (
        <View style={styles.locationInfo}>
          <MapPin size={16} color="#34C759" />
          <Text style={styles.locationText}>
            Current: {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <ScrollView style={styles.sitesList} showsVerticalScrollIndicator={false}>
        {sortedSites.map((site) => {
          const distance = currentLocation 
            ? calculateDistance(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude,
                site.location.latitude,
                site.location.longitude
              )
            : null;

          return (
            <View key={site.id} style={styles.siteCard}>
              <View style={styles.siteHeader}>
                <View style={styles.siteInfo}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  <View style={styles.siteMeta}>
                    {getStatusIcon(site.status)}
                    <Text style={styles.siteType}>{site.type}</Text>
                    {distance && (
                      <Text style={styles.siteDistance}>• {distance.toFixed(1)} km</Text>
                    )}
                  </View>
                </View>
                <View style={styles.siteActions}>
                  <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(site.priority) }]} />
                  <TouchableOpacity style={styles.navigateButton} onPress={() => handleNavigate(site)}>
                    <Navigation size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.siteAddress}>{site.address}</Text>
              
              <View style={styles.siteCoordinates}>
                <Text style={styles.coordinateText}>
                  📍 {site.location.latitude.toFixed(6)}, {site.location.longitude.toFixed(6)}
                </Text>
              </View>

              <View style={styles.siteFooter}>
                <View style={styles.inspectionDates}>
                  <Text style={styles.dateLabel}>Last: {site.lastInspection}</Text>
                  <Text style={styles.dateLabel}>Next: {site.nextInspection}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: site.status === 'completed' ? '#34C759' : site.status === 'pending' ? '#FF9500' : '#007AFF' }]}>
                  <Text style={styles.statusBadgeText}>{site.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          );
        })}
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
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterScrollView: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0FDF4',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#15803D',
    fontFamily: 'monospace',
  },
  sitesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  siteCard: {
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
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  siteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  siteType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  siteDistance: {
    fontSize: 12,
    color: '#8E8E93',
  },
  siteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navigateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteAddress: {
    fontSize: 14,
    color: '#48484A',
    marginBottom: 8,
  },
  siteCoordinates: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  coordinateText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  siteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectionDates: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});