import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Camera, Video, Trash2, Plus } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  name: string;
  timestamp: string;
}

interface MediaCaptureProps {
  onMediaCapture: (media: MediaItem[]) => void;
  maxItems?: number;
  allowVideo?: boolean;
}

export default function MediaCapture({ 
  onMediaCapture, 
  maxItems = 10,
  allowVideo = true 
}: MediaCaptureProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const capturePhoto = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to capture photos.');
        return;
      }

      // In a real implementation, you would use expo-camera here
      // For now, we'll simulate photo capture
      const newPhoto: MediaItem = {
        id: Date.now().toString(),
        uri: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400',
        type: 'image',
        name: `photo_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
      };

      const updatedMedia = [...mediaItems, newPhoto];
      setMediaItems(updatedMedia);
      onMediaCapture(updatedMedia);
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const captureVideo = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to capture videos.');
        return;
      }

      // In a real implementation, you would use expo-camera here
      // For now, we'll simulate video capture
      const newVideo: MediaItem = {
        id: Date.now().toString(),
        uri: 'https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg?auto=compress&cs=tinysrgb&w=400',
        type: 'video',
        name: `video_${Date.now()}.mp4`,
        timestamp: new Date().toISOString(),
      };

      const updatedMedia = [...mediaItems, newVideo];
      setMediaItems(updatedMedia);
      onMediaCapture(updatedMedia);
    } catch (error) {
      console.error('Error capturing video:', error);
      Alert.alert('Error', 'Failed to capture video. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia: MediaItem = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: asset.mimeType?.startsWith('video/') ? 'video' : 'image',
          name: asset.name || `media_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        const updatedMedia = [...mediaItems, newMedia];
        setMediaItems(updatedMedia);
        onMediaCapture(updatedMedia);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const removeMedia = (id: string) => {
    const updatedMedia = mediaItems.filter(item => item.id !== id);
    setMediaItems(updatedMedia);
    onMediaCapture(updatedMedia);
  };

  const canAddMore = mediaItems.length < maxItems;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos & Videos</Text>
      
      {canAddMore && (
        <View style={styles.captureButtons}>
          <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
            <Camera size={20} color="#007AFF" />
            <Text style={styles.captureButtonText}>Photo</Text>
          </TouchableOpacity>
          
          {allowVideo && (
            <TouchableOpacity style={styles.captureButton} onPress={captureVideo}>
              <Video size={20} color="#007AFF" />
              <Text style={styles.captureButtonText}>Video</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.captureButton} onPress={pickFromGallery}>
            <Plus size={20} color="#007AFF" />
            <Text style={styles.captureButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {mediaItems.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaList}>
          {mediaItems.map((item) => (
            <View key={item.id} style={styles.mediaItem}>
              <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => removeMedia(item.id)}
              >
                <Trash2 size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.mediaInfo}>
                <Text style={styles.mediaType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.mediaTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Text style={styles.counter}>
        {mediaItems.length} / {maxItems} items
      </Text>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  captureButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  mediaList: {
    marginBottom: 12,
  },
  mediaItem: {
    marginRight: 12,
    position: 'relative',
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaInfo: {
    marginTop: 4,
    alignItems: 'center',
  },
  mediaType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  mediaTime: {
    fontSize: 9,
    color: '#8E8E93',
  },
  counter: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});