"""
Dependency Graph Pydantic Schemas
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class GraphNode(BaseModel):
    """A node in the dependency graph"""
    id: int
    code: str
    name: str
    display_name: str
    type: str
    status: str
    category: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    frontend_url: Optional[str] = None
    backend_url: Optional[str] = None
    description: Optional[str] = None

    # Metrics
    dependencies_count: int = 0
    dependents_count: int = 0
    routes_count: int = 0


class GraphEdge(BaseModel):
    """An edge (dependency) in the graph"""
    id: int
    source: int  # consumer_id
    target: int  # provider_id
    name: str
    type: str
    criticality: str
    description: Optional[str] = None


class DependencyGraph(BaseModel):
    """Complete dependency graph"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]

    # Metadata
    total_apps: int
    total_dependencies: int

    # Stats
    stats: Optional[Dict[str, Any]] = None


class DependencyPath(BaseModel):
    """A path between two applications in the dependency graph"""
    from_app: str
    to_app: str
    path: List[str]
    length: int


class DependencyTree(BaseModel):
    """A tree view of dependencies"""
    app_id: int
    app_code: str
    app_name: str
    children: List["DependencyTree"] = []
    dependency_info: Optional[Dict[str, Any]] = None


# Enable self-referencing
DependencyTree.model_rebuild()

