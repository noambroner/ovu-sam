/**
 * SAM API Client
 * Handles all API calls to SAM backend
 */
import apiClient from './apiClient';
import type {
  Application,
  ApplicationListItem,
  ApplicationDetail,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationFilters,
  Dependency,
  CreateDependencyRequest,
  UpdateDependencyRequest,
  DependencyFilters,
  DependencyGraph,
  DependencyTree,
  DependencyPath,
} from '../types/sam';

/**
 * Applications API
 */
export const applicationsAPI = {
  /**
   * Get all applications with counts
   */
  getAll: async (filters?: ApplicationFilters): Promise<ApplicationListItem[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<ApplicationListItem[]>(
      `/applications?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get application by ID with full details
   */
  getById: async (id: number): Promise<ApplicationDetail> => {
    const response = await apiClient.get<ApplicationDetail>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Get application by code with full details
   */
  getByCode: async (code: string): Promise<ApplicationDetail> => {
    const response = await apiClient.get<ApplicationDetail>(`/applications/code/${code}`);
    return response.data;
  },

  /**
   * Search applications
   */
  search: async (query: string, limit: number = 10): Promise<Application[]> => {
    const response = await apiClient.get<Application[]>(
      `/applications/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Create new application
   */
  create: async (data: CreateApplicationRequest): Promise<Application> => {
    const response = await apiClient.post<Application>('/applications', data);
    return response.data;
  },

  /**
   * Update application
   */
  update: async (id: number, data: UpdateApplicationRequest): Promise<Application> => {
    const response = await apiClient.put<Application>(`/applications/${id}`, data);
    return response.data;
  },

  /**
   * Delete application
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },
};

/**
 * Dependencies API
 */
export const dependenciesAPI = {
  /**
   * Get all dependencies
   */
  getAll: async (filters?: DependencyFilters): Promise<Dependency[]> => {
    const params = new URLSearchParams();
    if (filters?.consumer_id) params.append('consumer_id', filters.consumer_id.toString());
    if (filters?.provider_id) params.append('provider_id', filters.provider_id.toString());
    if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<Dependency[]>(`/dependencies?${params.toString()}`);
    return response.data;
  },

  /**
   * Get dependency by ID
   */
  getById: async (id: number): Promise<Dependency> => {
    const response = await apiClient.get<Dependency>(`/dependencies/${id}`);
    return response.data;
  },

  /**
   * Create new dependency
   */
  create: async (data: CreateDependencyRequest): Promise<Dependency> => {
    const response = await apiClient.post<Dependency>('/dependencies', data);
    return response.data;
  },

  /**
   * Update dependency
   */
  update: async (id: number, data: UpdateDependencyRequest): Promise<Dependency> => {
    const response = await apiClient.put<Dependency>(`/dependencies/${id}`, data);
    return response.data;
  },

  /**
   * Delete dependency
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/dependencies/${id}`);
  },
};

/**
 * Graph API
 */
export const graphAPI = {
  /**
   * Get full dependency graph
   */
  getGraph: async (): Promise<DependencyGraph> => {
    const response = await apiClient.get<DependencyGraph>('/graph');
    return response.data;
  },

  /**
   * Get dependency tree for an application
   */
  getTree: async (appId: number, maxDepth: number = 5): Promise<DependencyTree> => {
    const response = await apiClient.get<DependencyTree>(
      `/graph/tree/${appId}?max_depth=${maxDepth}`
    );
    return response.data;
  },

  /**
   * Find path between two applications
   */
  findPath: async (fromApp: number, toApp: number): Promise<DependencyPath | null> => {
    const response = await apiClient.get<DependencyPath | null>(
      `/graph/path?from_app=${fromApp}&to_app=${toApp}`
    );
    return response.data;
  },

  /**
   * Get critical dependencies
   */
  getCritical: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/graph/critical');
    return response.data;
  },

  /**
   * Detect circular dependencies
   */
  getCircular: async (): Promise<number[][]> => {
    const response = await apiClient.get<number[][]>('/graph/circular');
    return response.data;
  },

  /**
   * Get graph statistics
   */
  getStats: async (): Promise<any> => {
    const response = await apiClient.get<any>('/graph/stats');
    return response.data;
  },
};

/**
 * Combined SAM API
 */
const samAPI = {
  applications: applicationsAPI,
  dependencies: dependenciesAPI,
  graph: graphAPI,
};

export default samAPI;

