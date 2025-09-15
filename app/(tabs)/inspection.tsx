import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {
  FileText,
  Camera,
  MapPin,
  PenTool,
  Save,
  Send,
  Sparkles,
  Eye,
  History,
  Thermometer,
  Wind,
  Droplets,
  Globe,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import SignaturePad from '@/components/SignaturePad';
import MediaCapture from '@/components/MediaCapture';
import SensorInput from '@/components/SensorInput';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/utils/translations';

interface InspectionData {
  id: string;
  siteId: string;
  siteName: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  sensorReadings: Array<{
    id: string;
    name: string;
    value: string;
    unit: string;
    timestamp: string;
    source: 'manual' | 'bluetooth' | 'wifi';
  }>;
  siteNotes: string;
  mediaItems: Array<{
    id: string;
    uri: string;
    type: 'image' | 'video';
    name: string;
    timestamp: string;
  }>;
  inspectorSignature?: string;
  clientSignature?: string;
  status: 'draft' | 'submitted';
  aiSummary?: string;
  language: string;
}

export default function InspectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { t } = useTranslation(selectedLanguage);
  
  const [currentInspection, setCurrentInspection] = useState<InspectionData>({
    id: Date.now().toString(),
    siteId: '1',
    siteName: 'Industrial Plant A',
    timestamp: new Date().toISOString(),
    sensorReadings: [],
    siteNotes: '',
    mediaItems: [],
    status: 'draft',
    language: 'en',
  });
  
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [showPreInspection, setShowPreInspection] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const sensorTypes = [
    { id: 'air_quality', name: t('inspection.airQuality'), unit: 'AQI', icon: <Wind size={16} color="#007AFF" /> },
    { id: 'dust_reading', name: t('inspection.dustReading'), unit: 'µg/m³', icon: <Wind size={16} color="#007AFF" /> },
    { id: 'water_quality', name: t('inspection.waterQuality'), unit: 'pH', icon: <Droplets size={16} color="#007AFF" /> },
    { id: 'emissions', name: t('inspection.emissions'), unit: 'ppm', icon: <Wind size={16} color="#007AFF" /> },
    { id: 'temperature', name: 'Temperature', unit: '°C', icon: <Thermometer size={16} color="#007AFF" /> },
    { id: 'humidity', name: 'Humidity', unit: '%', icon: <Droplets size={16} color="#007AFF" /> },
  ];
  useEffect(() => {
    getCurrentLocation();
    loadDraftInspection();
    
    // Auto-save every 30 seconds if enabled
    let autoSaveInterval: NodeJS.Timeout;
    if (autoSaveEnabled) {
      autoSaveInterval = setInterval(() => {
        saveDraft();
      }, 30000);
    }
    
    return () => {
      if (autoSaveInterval) clearInterval(autoSaveInterval);
    };
  }, [autoSaveEnabled]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
        setCurrentInspection(prev => ({ ...prev, location: location.coords }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadDraftInspection = async () => {
    try {
      const draft = await AsyncStorage.getItem('current_inspection_draft');
      if (draft) {
        setCurrentInspection(JSON.parse(draft));
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    try {
      await AsyncStorage.setItem('current_inspection_draft', JSON.stringify(currentInspection));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const generateAISummary = async () => {
    const sensorData = currentInspection.sensorReadings
      .filter(reading => reading.value)
      .map(reading => `${reading.name}: ${reading.value} ${reading.unit}`)
      .join('\n');

    // Simulate AI response
    setTimeout(() => {
      const aiSummary = `${t('inspection.title')} - AI SUMMARY
Site: ${currentInspection.siteName}
Date: ${new Date().toLocaleDateString()}

SENSOR READINGS:
${sensorData || 'No sensor data recorded'}

KEY FINDINGS:
• Overall site condition appears ${Math.random() > 0.5 ? 'satisfactory' : 'requires attention'}
• ${currentInspection.mediaItems.length} photos/videos captured
• GPS location verified: ${currentLocation ? 'Yes' : 'No'}

RECOMMENDATIONS:
• Continue regular monitoring protocols
• Review safety equipment placement
• Schedule follow-up inspection in 30 days

Generated by AI Assistant`;

      setCurrentInspection(prev => ({ ...prev, aiSummary }));
      Alert.alert('AI Summary Generated', 'Review the generated summary below.');
    }, 1500);
  };

  const submitInspection = async () => {
    const hasRequiredReadings = currentInspection.sensorReadings.some(reading => reading.value);
    
    if (!hasRequiredReadings) {
      Alert.alert(
        'Incomplete Data', 
        t('error.required') + ': Please fill in at least one sensor reading before submitting.'
      );
      return;
    }

    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        t('error.networkError'),
        [{ text: 'OK', onPress: saveDraft }]
      );
      return;
    }

    // Simulate submission
    const submittedInspection = { ...currentInspection, status: 'submitted' as const };
    
    try {
      // Save to submitted inspections
      const existingInspections = await AsyncStorage.getItem('submitted_inspections');
      const inspections = existingInspections ? JSON.parse(existingInspections) : [];
      inspections.push(submittedInspection);
      await AsyncStorage.setItem('submitted_inspections', JSON.stringify(inspections));
      
      // Clear draft
      await AsyncStorage.removeItem('current_inspection_draft');
      
      Alert.alert('Success', 'Inspection submitted successfully!', [
        { text: 'OK', onPress: () => {
          // Reset for new inspection
          setCurrentInspection({
            id: Date.now().toString(),
            siteId: '1',
            siteName: 'Industrial Plant A',
            timestamp: new Date().toISOString(),
            sensorReadings: [],
            siteNotes: '',
            mediaItems: [],
            status: 'draft',
            language: selectedLanguage,
          });
        }}
      ]);
    } catch (error) {
      console.error('Error submitting inspection:', error);
      Alert.alert('Error', 'Failed to submit inspection. Please try again.');
    }
  };

  if (showPreInspection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Pre-Inspection</Text>
            <Text style={styles.headerSubtitle}>{currentInspection.siteName}</Text>
          </View>
          <View style={styles.headerActions}>
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={(lang) => {
                setSelectedLanguage(lang);
                setCurrentInspection(prev => ({ ...prev, language: lang }));
              }}
            />
          </View>
        </View>
        
        <View style={styles.proceedSection}>
          <TouchableOpacity 
            style={styles.proceedButton}
            onPress={() => setShowPreInspection(false)}
          >
            <Text style={styles.proceedButtonText}>{t('common.submit')} Inspection</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Documents & Resources</Text>
            </View>
            
            <TouchableOpacity style={styles.documentCard}>
              <Text style={styles.documentTitle}>Environmental Impact Assessment (EIA)</Text>
              <Text style={styles.documentSubtitle}>Last updated: 2024-12-15</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.documentCard}>
              <Text style={styles.documentTitle}>Environmental Management Plan (EMP)</Text>
              <Text style={styles.documentSubtitle}>Version 2.1 • Active</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.documentCard}>
              <Text style={styles.documentTitle}>Facility Safety Notes</Text>
              <Text style={styles.documentSubtitle}>Critical safety protocols</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <History size={20} color="#FF9500" />
              <Text style={styles.sectionTitle}>Historical Findings</Text>
            </View>
            
            <View style={styles.historyCard}>
              <Text style={styles.historyDate}>Previous Inspection: Jan 15, 2025</Text>
              <Text style={styles.historyFinding}>• Dust levels within acceptable range</Text>
              <Text style={styles.historyFinding}>• Air quality monitoring equipment calibrated</Text>
              <Text style={styles.historyFinding}>• Minor equipment wear noted on Unit 3</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eye size={20} color="#34C759" />
              <Text style={styles.sectionTitle}>Inspection Focus Areas</Text>
            </View>
            
            <View style={styles.focusArea}>
              <Text style={styles.focusTitle}>Environmental Compliance</Text>
              <Text style={styles.focusDescription}>Focus on air quality measurements and dust control systems</Text>
            </View>
            
            <View style={styles.focusArea}>
              <Text style={styles.focusTitle}>Equipment Status</Text>
              <Text style={styles.focusDescription}>Check monitoring equipment functionality and calibration dates</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('inspection.title')}</Text>
          <Text style={styles.headerSubtitle}>{currentInspection.siteName}</Text>
        </View>
        <View style={styles.headerActions}>
          <LanguageSelector 
            selectedLanguage={selectedLanguage}
            onLanguageChange={(lang) => {
              setSelectedLanguage(lang);
              setCurrentInspection(prev => ({ ...prev, language: lang }));
            }}
          />
          <View style={styles.autoSaveToggle}>
            <Text style={styles.autoSaveText}>Auto-save</Text>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {currentLocation && (
          <View style={styles.locationCard}>
            <MapPin size={16} color="#34C759" />
            <Text style={styles.locationText}>
              📍 {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationTime}>
              {new Date().toLocaleTimeString()}
            </Text>
          </View>
        )}

        <SensorInput
          sensorTypes={sensorTypes}
          onReadingsUpdate={(readings) => 
            setCurrentInspection(prev => ({ ...prev, sensorReadings: readings }))
          }
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('inspection.notes')}</Text>
          <TextInput
            style={styles.textArea}
            value={currentInspection.siteNotes}
            onChangeText={(text) => setCurrentInspection(prev => ({ ...prev, siteNotes: text }))}
            placeholder={`Enter detailed site observations, equipment status, safety concerns...`}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <MediaCapture
          onMediaCapture={(media) => 
            setCurrentInspection(prev => ({ ...prev, mediaItems: media }))
          }
          maxItems={10}
          allowVideo={true}
        />

        <SignaturePad
          title={t('inspection.signature')}
          placeholder="Inspector signature required"
          onSignatureCapture={(signature) => 
            setCurrentInspection(prev => ({ ...prev, inspectorSignature: signature }))
          }
        />

        <SignaturePad
          title={t('inspection.clientSignature')}
          placeholder="Client signature for verification"
          onSignatureCapture={(signature) => 
            setCurrentInspection(prev => ({ ...prev, clientSignature: signature }))
          }
        />

        {currentInspection.aiSummary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color="#FF9500" />
              <Text style={styles.sectionTitle}>AI-Generated Summary</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{currentInspection.aiSummary}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.aiButton} onPress={generateAISummary}>
            <Sparkles size={16} color="#FF9500" />
            <Text style={styles.aiButtonText}>Generate AI Summary</Text>
          </TouchableOpacity>
          
          <View style={styles.submitActions}>
            <TouchableOpacity style={styles.draftButton} onPress={saveDraft}>
              <Save size={16} color="#8E8E93" />
              <Text style={styles.draftButtonText}>{t('common.save')} Draft</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitButton} onPress={submitInspection}>
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
            </TouchableOpacity>
          </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  proceedSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  proceedButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  autoSaveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoSaveText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: '#15803D',
    fontFamily: 'monospace',
  },
  locationTime: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '500',
  },
  section: {
    marginVertical: 16,
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
  documentCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  historyCard: {
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  historyFinding: {
    fontSize: 14,
    color: '#48484A',
    marginBottom: 4,
  },
  focusArea: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  focusDescription: {
    fontSize: 14,
    color: '#15803D',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 120,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  summaryCard: {
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  summaryText: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  actionSection: {
    paddingVertical: 20,
    gap: 12,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
    gap: 8,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  submitActions: {
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});