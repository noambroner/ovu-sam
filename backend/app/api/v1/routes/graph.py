"""
Graph API Routes - Dependency Graph and Analysis
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.graph import (
    DependencyGraph,
    DependencyPath,
    DependencyTree,
)
from app.services.graph_service import GraphService
from app.db.models import Dependency

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("", response_model=DependencyGraph)
async def get_dependency_graph(
    db: AsyncSession = Depends(get_db),
):
    """
    Get the complete dependency graph of all applications.
    Public endpoint.

    Returns:
    - nodes: All applications with metadata
    - edges: All dependencies between applications
    - stats: Statistics about the graph
    """
    graph = await GraphService.get_full_graph(db)
    return graph


@router.get("/tree/{app_id}", response_model=DependencyTree)
async def get_dependency_tree(
    app_id: int,
    max_depth: int = Query(5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dependency tree for a specific application.
    Public endpoint.

    Shows all dependencies in a tree structure.
    """
    tree = await GraphService.get_app_dependencies_tree(db, app_id, max_depth)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {app_id} not found"
        )
    return tree


@router.get("/path", response_model=Optional[DependencyPath])
async def find_dependency_path(
    from_app: int = Query(..., description="Source application ID"),
    to_app: int = Query(..., description="Target application ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Find the shortest dependency path between two applications.
    Public endpoint.

    Returns None if no path exists.
    """
    if from_app == to_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and target applications must be different"
        )

    path = await GraphService.find_path(db, from_app, to_app)
    return path


@router.get("/critical", response_model=List[dict])
async def get_critical_dependencies(
    db: AsyncSession = Depends(get_db),
):
    """
    Get all critical dependencies in the system.
    Public endpoint.

    Returns list of critical dependencies with application info.
    """
    deps = await GraphService.get_critical_dependencies(db)

    result = []
    for dep in deps:
        result.append({
            "id": dep.id,
            "name": dep.name,
            "type": dep.type.value,
            "criticality": dep.criticality.value,
            "consumer_id": dep.consumer_id,
            "provider_id": dep.provider_id,
            "description": dep.description,
        })

    return result


@router.get("/circular", response_model=List[List[int]])
async def detect_circular_dependencies(
    db: AsyncSession = Depends(get_db),
):
    """
    Detect circular dependencies in the system.
    Public endpoint.

    Returns list of cycles (each cycle is a list of application IDs).
    Empty list means no circular dependencies.
    """
    cycles = await GraphService.get_circular_dependencies(db)
    return cycles


@router.get("/stats", response_model=dict)
async def get_graph_stats(
    db: AsyncSession = Depends(get_db),
):
    """
    Get statistics about the dependency graph.
    Public endpoint.
    """
    graph = await GraphService.get_full_graph(db)

    return {
        "total_applications": graph.total_apps,
        "total_dependencies": graph.total_dependencies,
        "total_nodes": len(graph.nodes),
        "total_edges": len(graph.edges),
        "by_type": graph.stats.get("by_type", {}),
        "by_status": graph.stats.get("by_status", {}),
        "by_category": graph.stats.get("by_category", {}),
    }

