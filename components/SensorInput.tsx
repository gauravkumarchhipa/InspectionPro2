import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Bluetooth, Wifi, RefreshCw, Thermometer, Wind, Droplets } from 'lucide-react-native';

interface SensorReading {
  id: string;
  name: string;
  value: string;
  unit: string;
  timestamp: string;
  source: 'manual' | 'bluetooth' | 'wifi';
}

interface SensorInputProps {
  onReadingsUpdate: (readings: SensorReading[]) => void;
  sensorTypes: Array<{
    id: string;
    name: string;
    unit: string;
    icon: React.ReactNode;
  }>;
}

export default function SensorInput({ onReadingsUpdate, sensorTypes }: SensorInputProps) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Initialize readings for all sensor types
    const initialReadings = sensorTypes.map(sensor => ({
      id: sensor.id,
      name: sensor.name,
      value: '',
      unit: sensor.unit,
      timestamp: new Date().toISOString(),
      source: 'manual' as const,
    }));
    setReadings(initialReadings);
  }, [sensorTypes]);

  const updateReading = (id: string, value: string, source: 'manual' | 'bluetooth' | 'wifi' = 'manual') => {
    const updatedReadings = readings.map(reading =>
      reading.id === id
        ? { ...reading, value, timestamp: new Date().toISOString(), source }
        : reading
    );
    setReadings(updatedReadings);
    onReadingsUpdate(updatedReadings);
  };

  const scanForBluetoothDevices = async () => {
    setIsScanning(true);
    
    // Simulate Bluetooth scanning
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Bluetooth Devices',
        'Found: AirQuality Pro Sensor\nWould you like to connect?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              setIsBluetoothConnected(true);
              // Simulate receiving sensor data
              setTimeout(() => {
                updateReading('air_quality', '45', 'bluetooth');
                updateReading('temperature', '23.5', 'bluetooth');
                updateReading('humidity', '65', 'bluetooth');
              }, 1000);
            },
          },
        ]
      );
    }, 2000);
  };

  const getSensorIcon = (sensorId: string) => {
    const sensor = sensorTypes.find(s => s.id === sensorId);
    return sensor?.icon || <Thermometer size={16} color="#007AFF" />;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'bluetooth': return <Bluetooth size={12} color="#007AFF" />;
      case 'wifi': return <Wifi size={12} color="#34C759" />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Readings</Text>
        <View style={styles.connectionStatus}>
          {isBluetoothConnected && (
            <View style={styles.statusIndicator}>
              <Bluetooth size={14} color="#007AFF" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.scanButton, isScanning && styles.scanButtonActive]}
            onPress={scanForBluetoothDevices}
            disabled={isScanning}
          >
            <RefreshCw 
              size={14} 
              color={isScanning ? "#FFFFFF" : "#007AFF"} 
              style={isScanning ? styles.spinning : undefined}
            />
            <Text style={[styles.scanButtonText, isScanning && styles.scanButtonTextActive]}>
              {isScanning ? 'Scanning...' : 'Scan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.readingsList}>
        {readings.map((reading) => (
          <View key={reading.id} style={styles.readingItem}>
            <View style={styles.readingHeader}>
              <View style={styles.readingInfo}>
                {getSensorIcon(reading.id)}
                <Text style={styles.readingName}>{reading.name}</Text>
                {getSourceIcon(reading.source)}
              </View>
              <Text style={styles.readingUnit}>{reading.unit}</Text>
            </View>
            
            <TextInput
              style={[
                styles.readingInput,
                reading.source !== 'manual' && styles.readingInputConnected
              ]}
              value={reading.value}
              onChangeText={(value) => updateReading(reading.id, value)}
              placeholder={`Enter ${reading.name.toLowerCase()}`}
              keyboardType="numeric"
              editable={reading.source === 'manual'}
            />
            
            {reading.value && (
              <Text style={styles.timestamp}>
                Last updated: {new Date(reading.timestamp).toLocaleTimeString()}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Connect Bluetooth sensors for automatic readings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#007AFF',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  scanButtonActive: {
    backgroundColor: '#007AFF',
  },
  scanButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
  },
  scanButtonTextActive: {
    color: '#FFFFFF',
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  readingsList: {
    gap: 12,
  },
  readingItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  readingUnit: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  readingInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  readingInputConnected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  timestamp: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'right',
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});