import { channelsApi, readingsApi, chartsApi, workflowsApi } from '../app/services/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

describe('API Services', () => {
  describe('channelsApi', () => {
    it('should have create method', () => {
      expect(typeof channelsApi.create).toBe('function');
    });

    it('should have get method', () => {
      expect(typeof channelsApi.get).toBe('function');
    });

    it('should have createApiKey method', () => {
      expect(typeof channelsApi.createApiKey).toBe('function');
    });
  });

  describe('readingsApi', () => {
    it('should have post method', () => {
      expect(typeof readingsApi.post).toBe('function');
    });

    it('should have getLatest method', () => {
      expect(typeof readingsApi.getLatest).toBe('function');
    });

    it('should have getAll method', () => {
      expect(typeof readingsApi.getAll).toBe('function');
    });
  });

  describe('chartsApi', () => {
    it('should have getSeries method', () => {
      expect(typeof chartsApi.getSeries).toBe('function');
    });
  });

  describe('workflowsApi', () => {
    it('should have create method', () => {
      expect(typeof workflowsApi.create).toBe('function');
    });

    it('should have getAll method', () => {
      expect(typeof workflowsApi.getAll).toBe('function');
    });
  });
});