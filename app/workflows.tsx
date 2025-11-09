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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { workflowsApi } from './services/api';

export default function WorkflowsScreen() {
  const { apiKey } = useLocalSearchParams<{ apiKey?: string }>();
  const router = useRouter();
  
  const [name, setName] = useState('Alert Workflow');
  const [field, setField] = useState('temperature');
  const [operator, setOperator] = useState('>');
  const [value, setValue] = useState('30');
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/');

  const workflowsQuery = useQuery({
    queryKey: ['workflows', apiKey],
    queryFn: () => workflowsApi.getAll(apiKey!),
    enabled: !!apiKey,
  });

  const createWorkflowMutation = useMutation({
    mutationFn: () => workflowsApi.create(apiKey!, {
      name,
      enabled: true,
      rule: {
        field,
        op: operator,
        value: parseFloat(value),
      },
      action: {
        type: 'webhook',
        url: webhookUrl,
      },
    }),
    onSuccess: () => {
      Alert.alert('Success', 'Workflow created successfully!');
      workflowsQuery.refetch();
      // Reset form
      setName('Alert Workflow');
      setField('temperature');
      setOperator('>');
      setValue('30');
      setWebhookUrl('https://webhook.site/');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create workflow');
    },
  });

  if (!apiKey) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No API key provided</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const operators = ['>', '>=', '<', '<=', '=='];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Create Workflow Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New Workflow</Text>
          <Text style={styles.cardDescription}>
            Trigger webhooks when sensor values meet conditions
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Workflow Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter workflow name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Field</Text>
            <TextInput
              style={styles.input}
              value={field}
              onChangeText={setField}
              placeholder="temperature"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Operator</Text>
            <View style={styles.operatorContainer}>
              {operators.map((op) => (
                <TouchableOpacity
                  key={op}
                  style={[
                    styles.operatorButton,
                    operator === op && styles.operatorButtonActive,
                  ]}
                  onPress={() => setOperator(op)}
                >
                  <Text
                    style={[
                      styles.operatorButtonText,
                      operator === op && styles.operatorButtonTextActive,
                    ]}
                  >
                    {op}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Threshold Value</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="30"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Webhook URL</Text>
            <TextInput
              style={styles.input}
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              placeholder="https://webhook.site/your-unique-id"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, createWorkflowMutation.isPending && styles.buttonDisabled]}
            onPress={() => createWorkflowMutation.mutate()}
            disabled={createWorkflowMutation.isPending}
          >
            {createWorkflowMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Workflow</Text>
            )}
          </TouchableOpacity>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>📝 Example:</Text>
            <Text style={styles.exampleText}>
              If {field} {operator} {value}, then POST to webhook
            </Text>
          </View>
        </View>

        {/* Existing Workflows */}
        {workflowsQuery.isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : workflowsQuery.data && workflowsQuery.data.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Workflows</Text>
            {workflowsQuery.data.map((workflow) => (
              <View key={workflow.id} style={styles.workflowCard}>
                <View style={styles.workflowHeader}>
                  <Text style={styles.workflowName}>{workflow.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      workflow.enabled ? styles.statusActive : styles.statusInactive,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {workflow.enabled ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.workflowRule}>
                  If {workflow.rule.field} {workflow.rule.op} {workflow.rule.value}
                </Text>
                <Text style={styles.workflowAction}>
                  → POST to {workflow.action.url.substring(0, 40)}...
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.noData}>No workflows yet. Create one above!</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
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
  operatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  operatorButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  operatorButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  operatorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  operatorButtonTextActive: {
    color: '#fff',
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
  exampleBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
  },
  workflowCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusInactive: {
    backgroundColor: '#999',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  workflowRule: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workflowAction: {
    fontSize: 14,
    color: '#007AFF',
  },
  noData: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 16,
  },
});

