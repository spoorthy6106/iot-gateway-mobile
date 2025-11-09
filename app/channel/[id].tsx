import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory-native';
import { readingsApi, chartsApi, channelsApi, Channel, Reading } from '../services/api';

const { width } = Dimensions.get('window');

export default function ChannelDetailScreen() {
  const { id, apiKey } = useLocalSearchParams<{ id: string; apiKey: string }>();
  const router = useRouter();
  const [selectedField, setSelectedField] = useState<string>('temperature');

  const channelQuery = useQuery({
    queryKey: ['channel', id],
    queryFn: () => channelsApi.get(id),
    enabled: !!id,
  });

  const latestQuery = useQuery({
    queryKey: ['readings', 'latest', id, apiKey],
    queryFn: () => readingsApi.getLatest(apiKey),
    enabled: !!apiKey,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const seriesQuery = useQuery({
    queryKey: ['charts', 'series', id, apiKey, selectedField],
    queryFn: () => chartsApi.getSeries(apiKey, selectedField, 50),
    enabled: !!apiKey && !!selectedField,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const channel: Channel | undefined = channelQuery.data;
  const latest: Reading | null = latestQuery.data || null;
  const series = seriesQuery.data || [];

  const isLoading = channelQuery.isLoading || latestQuery.isLoading;
  const isRefreshing = latestQuery.isRefetching || seriesQuery.isRefetching;

  const onRefresh = () => {
    latestQuery.refetch();
    seriesQuery.refetch();
  };

  // Get available fields from latest reading or channel config
  const availableFields = latest?.fields
    ? Object.keys(latest.fields)
    : channel?.allowed_fields || [];

  // Format chart data
  const chartData = series.map((point, index) => ({
    x: index,
    y: point.value,
    date: new Date(point.ts),
  }));

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading channel...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Channel Info */}
        {channel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{channel.name}</Text>
            {channel.description && (
              <Text style={styles.cardDescription}>{channel.description}</Text>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Channel ID:</Text>
              <Text style={styles.infoValue}>{channel.id.substring(0, 25)}...</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fields:</Text>
              <Text style={styles.infoValue}>{channel.allowed_fields.join(', ').substring(0,30)}...</Text>
            </View>
          </View>
        )}

        {/* Latest Reading */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Reading</Text>
          {latest ? (
            <>
              <Text style={styles.timestamp}>
                {new Date(latest.ts).toLocaleString()}
              </Text>
              <View style={styles.fieldsContainer}>
                {Object.entries(latest.fields).map(([key, value]) => (
                  <View key={key} style={styles.fieldCard}>
                    <Text style={styles.fieldLabel}>{key}</Text>
                    <Text style={styles.fieldValue}>{value.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.noData}>No readings yet</Text>
          )}
        </View>

        {/* Field Selector */}
        {availableFields.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Select Field to Chart</Text>
            <View style={styles.fieldSelector}>
              {availableFields.map((field) => (
                <TouchableOpacity
                  key={field}
                  style={[
                    styles.fieldButton,
                    selectedField === field && styles.fieldButtonActive,
                  ]}
                  onPress={() => setSelectedField(field)}
                >
                  <Text
                    style={[
                      styles.fieldButtonText,
                      selectedField === field && styles.fieldButtonTextActive,
                    ]}
                  >
                    {field}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {selectedField} (last {chartData.length} readings)
            </Text>
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={220}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: '#ccc' },
                  tickLabels: { fontSize: 10, fill: '#666' },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: '#ccc' },
                  tickLabels: { fontSize: 10, fill: '#666' },
                  grid: { stroke: '#f0f0f0' },
                }}
              />
              <VictoryLine
                data={chartData}
                style={{
                  data: { stroke: '#007AFF', strokeWidth: 2 },
                }}
              />
            </VictoryChart>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/iot-guide/[id]',
              params: { id: id, apiKey: apiKey }
            })}
          >
            <Text style={styles.actionButtonText}>🔌 IoT Integration Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push({pathname:'/workflows',params:{apiKey:apiKey,channelId:id}})}
          >
            <Text style={styles.actionButtonTextSecondary}>⚙️ Manage Workflows</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={onRefresh}
          >
            <Text style={styles.actionButtonTextSecondary}>🔄 Refresh Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  fieldCard: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    minWidth: 100,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  noData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  fieldSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fieldButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fieldButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  fieldButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fieldButtonTextActive: {
    color: '#fff',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
