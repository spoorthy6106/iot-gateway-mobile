import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { channelsApi } from './services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CHANNELS: '@iot_workshop_channels',
};

export default function HomeScreen() {
  const router = useRouter();
  const [name, setName] = useState('Demo Channel');
  const [description, setDescription] = useState('IoT sensor channel');
  const [allowedFields, setAllowedFields] = useState('temperature,humidity');
  const [savedChannels, setSavedChannels] = useState<Array<{ id: string; name: string; apiKey: string }>>([]);

  const createChannelMutation = useMutation({
    mutationFn: async () => {
      const channel = await channelsApi.create({
        name,
        description,
        allowedFields: allowedFields.split(',').map(s => s.trim()).filter(Boolean),
      });
      
      const keyResponse = await channelsApi.createApiKey(channel.id, 'readwrite');
      
      return { channel, apiKey: keyResponse.key };
    },
    onSuccess: async (data) => {
      const channelData = {
        id: data.channel.id,
        name: data.channel.name,
        apiKey: data.apiKey,
      };
      
      // Save to AsyncStorage
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.CHANNELS);
      const channels = existing ? JSON.parse(existing) : [];
      channels.push(channelData);
      await AsyncStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      
      setSavedChannels(channels);
      
      Alert.alert(
        'Success',
        `Channel created!\n\nID: ${data.channel.id}\nAPI Key: ${data.apiKey.substring(0, 20)}...`,
        [
          {
            text: 'View Channel',
            onPress: () => router.push({
              pathname: '/channel/[id]',
              params: { id: data.channel.id, apiKey: data.apiKey },
            }),
          },
          { text: 'OK' },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create channel');
    },
  });

  React.useEffect(() => {
    loadSavedChannels();
  }, []);

  const loadSavedChannels = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHANNELS);
      if (stored) {
        setSavedChannels(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const openChannel = (channelId: string, apiKey: string) => {
    router.push({
      pathname: '/channel/[id]',
      params: { id: channelId, apiKey },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Channel</Text>
        <Text style={styles.description}>
          Create an IoT channel to collect and monitor sensor data
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Channel Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter channel name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allowed Fields (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={allowedFields}
              onChangeText={setAllowedFields}
              placeholder="temperature,humidity,pressure"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, createChannelMutation.isPending && styles.buttonDisabled]}
            onPress={() => createChannelMutation.mutate()}
            disabled={createChannelMutation.isPending}
          >
            {createChannelMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Channel</Text>
            )}
          </TouchableOpacity>
        </View>

        {savedChannels.length > 0 && (
          <View style={styles.savedChannels}>
            <Text style={styles.sectionTitle}>Your Channels</Text>
            {savedChannels.map((channel) => (
              <TouchableOpacity
                key={channel.id}
                style={styles.channelCard}
                onPress={() => openChannel(channel.id, channel.apiKey)}
              >
                <Text style={styles.channelName}>{channel.name}</Text>
                <Text style={styles.channelId}>ID: {channel.id.substring(0, 8)}...</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedChannels: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  channelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  channelId: {
    fontSize: 14,
    color: '#666',
  },
});
