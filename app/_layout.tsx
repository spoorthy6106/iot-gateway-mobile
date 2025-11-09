import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: true }}>
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'IoT Gateway',
              headerLargeTitle: true,
            }} 
          />
          <Stack.Screen 
            name="channel/[id]" 
            options={{ 
              title: 'Channel Details',
              presentation: 'card',
            }} 
          />
          <Stack.Screen 
            name="workflows" 
            options={{ 
              title: 'Workflows',
              presentation: 'modal',
            }} 
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}