/**
 * SAM TypeScript Types
 * System Application Mapping types for frontend
 */

// Enums
export enum AppType {
  CORE = "core",
  FEATURE = "feature",
  TOOL = "tool",
  INTEGRATION = "integration",
  MICROSERVICE = "microservice",
}

export enum AppStatus {
  ACTIVE = "active",
  DEVELOPMENT = "development",
  DEPRECATED = "deprecated",
  ARCHIVED = "archived",
}

export enum DependencyType {
  API = "api",
  DATABASE = "database",
  CACHE = "cache",
  SERVICE = "service",
  LIBRARY = "library",
  EXTERNAL = "external",
}

export enum DependencyCriticality {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  OPTIONAL = "optional",
}

// Tech Stack
export interface TechStackInfo {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  cache?: string[];
  other?: string[];
}

// Application
export interface Application {
  id: number;
  name: string;
  display_name: string;
  code: string;
  description?: string;
  purpose?: string;
  type: AppType;
  status: AppStatus;
  category?: string;
  owner_team?: string;
  owner_email?: string;
  version?: string;
  release_date?: string;
  frontend_url?: string;
  backend_url?: string;
  docs_url?: string;
  github_url?: string;
  tech_stack?: TechStackInfo;
  icon?: string;
  color?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ApplicationListItem extends Omit<Application, "tech_stack"> {
  dependencies_count?: number;
  dependents_count?: number;
  routes_count?: number;
}

export interface DependencySummary {
  id: number;
  name: string;
  type: string;
  criticality: string;
}

export interface ApplicationDetail extends Application {
  getting_started?: string;
  api_reference?: string;
  integration_guide?: string;
  troubleshooting?: string;
  faq?: string;
  dependencies_required?: DependencySummary[];
  dependencies_provided?: DependencySummary[];
  routes?: RouteInfo[];
  deployments?: DeploymentInfo[];
}

// Dependency
export interface Dependency {
  id: number;
  consumer_id: number;
  provider_id?: number;
  name: string;
  type: DependencyType;
  criticality: DependencyCriticality;
  description?: string;
  reason?: string;
  version_constraint?: string;
  external_url?: string;
  external_docs?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  consumer_name?: string;
  provider_name?: string;
}

// Route
export interface RouteInfo {
  id: number;
  application_id: number;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  requires_auth: boolean;
  required_roles?: string[];
  request_body_example?: any;
  response_example?: any;
  tags?: string[];
  category?: string;
  created_at: string;
  updated_at: string;
}

// Deployment
export interface DeploymentInfo {
  id: number;
  application_id: number;
  environment: string;
  component: string;
  server_name?: string;
  server_ip?: string;
  port?: number;
  url?: string;
  health_check_url?: string;
  is_active: boolean;
  last_deployed_at?: string;
  last_health_check?: string;
  health_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Graph
export interface GraphNode {
  id: number;
  code: string;
  name: string;
  display_name: string;
  type: string;
  status: string;
  category?: string;
  icon?: string;
  color?: string;
  frontend_url?: string;
  backend_url?: string;
  description?: string;
  dependencies_count: number;
  dependents_count: number;
  routes_count: number;
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  name: string;
  type: string;
  criticality: string;
  description?: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  total_apps: number;
  total_dependencies: number;
  stats?: {
    total_nodes: number;
    total_edges: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_category: Record<string, number>;
  };
}

export interface DependencyPath {
  from_app: string;
  to_app: string;
  path: string[];
  length: number;
}

export interface DependencyTree {
  app_id: number;
  app_code: string;
  app_name: string;
  children: DependencyTree[];
  dependency_info?: {
    name: string;
    type: string;
    criticality: string;
  };
}

// API Request types
export interface CreateApplicationRequest {
  name: string;
  display_name: string;
  code: string;
  description?: string;
  purpose?: string;
  type?: AppType;
  status?: AppStatus;
  category?: string;
  owner_team?: string;
  owner_email?: string;
  version?: string;
  frontend_url?: string;
  backend_url?: string;
  docs_url?: string;
  github_url?: string;
  tech_stack?: TechStackInfo;
  getting_started?: string;
  api_reference?: string;
  integration_guide?: string;
  troubleshooting?: string;
  faq?: string;
  icon?: string;
  color?: string;
  tags?: string[];
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {}

export interface CreateDependencyRequest {
  consumer_id: number;
  provider_id?: number;
  name: string;
  type?: DependencyType;
  criticality?: DependencyCriticality;
  description?: string;
  reason?: string;
  version_constraint?: string;
  external_url?: string;
  external_docs?: string;
  notes?: string;
}

export interface UpdateDependencyRequest extends Partial<Omit<CreateDependencyRequest, "consumer_id">> {}

// Filter types
export interface ApplicationFilters {
  type?: string;
  status?: string;
  category?: string;
  skip?: number;
  limit?: number;
}

export interface DependencyFilters {
  consumer_id?: number;
  provider_id?: number;
  skip?: number;
  limit?: number;
}

