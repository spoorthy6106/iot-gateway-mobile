// Jest setup for Expo SDK 54
// Mock native modules that might not be available in test environment

// Mock Expo modules
jest.mock('expo-router', () => ({
    useRouter: () => ({
      push: jest.fn(),
      back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    Stack: 'Stack',
    Link: 'Link',
  }));
  
  // Mock AsyncStorage
  jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  }));
  
  // Mock React Native modules
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
  
  // Silence console warnings during tests
  global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
  };