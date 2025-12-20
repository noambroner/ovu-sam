"""
Graph Service - Business logic for dependency graphs
"""
from typing import List, Dict, Set, Optional
from collections import defaultdict, deque
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models import Application, Dependency, Route
from app.schemas.graph import (
    DependencyGraph,
    GraphNode,
    GraphEdge,
    DependencyPath,
    DependencyTree,
)


class GraphService:
    """Service for generating and analyzing dependency graphs"""

    @staticmethod
    async def get_full_graph(db: AsyncSession) -> DependencyGraph:
        """Get the complete dependency graph of all applications"""

        # Get all applications
        apps_result = await db.execute(select(Application))
        apps = apps_result.scalars().all()

        # Get all dependencies
        deps_result = await db.execute(select(Dependency))
        deps = deps_result.scalars().all()

        # Count routes for each app
        routes_count = {}
        for app in apps:
            count_result = await db.execute(
                select(func.count(Route.id)).where(Route.application_id == app.id)
            )
            routes_count[app.id] = count_result.scalar_one()

        # Count dependencies for each app
        deps_count = defaultdict(lambda: {"required": 0, "provided": 0})
        for dep in deps:
            deps_count[dep.consumer_id]["required"] += 1
            if dep.provider_id:
                deps_count[dep.provider_id]["provided"] += 1

        # Build nodes
        nodes = []
        for app in apps:
            node = GraphNode(
                id=app.id,
                code=app.code,
                name=app.name,
                display_name=app.display_name,
                type=app.type.value,
                status=app.status.value,
                category=app.category,
                icon=app.icon,
                color=app.color,
                frontend_url=app.frontend_url,
                backend_url=app.backend_url,
                description=app.description,
                dependencies_count=deps_count[app.id]["required"],
                dependents_count=deps_count[app.id]["provided"],
                routes_count=routes_count.get(app.id, 0),
            )
            nodes.append(node)

        # Build edges
        edges = []
        for dep in deps:
            if dep.provider_id:  # Only internal dependencies
                edge = GraphEdge(
                    id=dep.id,
                    source=dep.consumer_id,
                    target=dep.provider_id,
                    name=dep.name,
                    type=dep.type.value,
                    criticality=dep.criticality.value,
                    description=dep.description,
                )
                edges.append(edge)

        # Calculate stats
        stats = {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "by_type": {},
            "by_status": {},
            "by_category": {},
        }

        # Count by type
        for app in apps:
            type_key = app.type.value
            stats["by_type"][type_key] = stats["by_type"].get(type_key, 0) + 1

        # Count by status
        for app in apps:
            status_key = app.status.value
            stats["by_status"][status_key] = stats["by_status"].get(status_key, 0) + 1

        # Count by category
        for app in apps:
            if app.category:
                stats["by_category"][app.category] = stats["by_category"].get(app.category, 0) + 1

        return DependencyGraph(
            nodes=nodes,
            edges=edges,
            total_apps=len(apps),
            total_dependencies=len(deps),
            stats=stats,
        )

    @staticmethod
    async def get_app_dependencies_tree(db: AsyncSession, app_id: int, max_depth: int = 5) -> Optional[DependencyTree]:
        """Get dependency tree for a specific application"""

        # Get the root application
        app_result = await db.execute(
            select(Application).where(Application.id == app_id)
        )
        app = app_result.scalar_one_or_none()

        if not app:
            return None

        # Build tree recursively
        visited = set()

        async def build_tree(current_id: int, depth: int) -> Optional[DependencyTree]:
            if depth > max_depth or current_id in visited:
                return None

            visited.add(current_id)

            # Get current app
            curr_app_result = await db.execute(
                select(Application).where(Application.id == current_id)
            )
            curr_app = curr_app_result.scalar_one_or_none()

            if not curr_app:
                return None

            # Get dependencies
            deps_result = await db.execute(
                select(Dependency).where(Dependency.consumer_id == current_id)
            )
            deps = deps_result.scalars().all()

            # Build children
            children = []
            for dep in deps:
                if dep.provider_id:
                    child = await build_tree(dep.provider_id, depth + 1)
                    if child:
                        child.dependency_info = {
                            "name": dep.name,
                            "type": dep.type.value,
                            "criticality": dep.criticality.value,
                        }
                        children.append(child)

            return DependencyTree(
                app_id=curr_app.id,
                app_code=curr_app.code,
                app_name=curr_app.display_name,
                children=children,
            )

        return await build_tree(app_id, 0)

    @staticmethod
    async def find_path(db: AsyncSession, from_app_id: int, to_app_id: int) -> Optional[DependencyPath]:
        """Find the shortest path between two applications"""

        # Get all dependencies
        deps_result = await db.execute(select(Dependency))
        deps = deps_result.scalars().all()

        # Build adjacency list
        graph = defaultdict(list)
        for dep in deps:
            if dep.provider_id:
                graph[dep.consumer_id].append(dep.provider_id)

        # BFS to find shortest path
        queue = deque([(from_app_id, [from_app_id])])
        visited = {from_app_id}

        while queue:
            current, path = queue.popleft()

            if current == to_app_id:
                # Found path - get app codes
                apps_result = await db.execute(
                    select(Application).where(Application.id.in_(path))
                )
                apps = {app.id: app.code for app in apps_result.scalars().all()}

                path_codes = [apps[app_id] for app_id in path if app_id in apps]

                return DependencyPath(
                    from_app=apps[from_app_id],
                    to_app=apps[to_app_id],
                    path=path_codes,
                    length=len(path) - 1,
                )

            for neighbor in graph[current]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))

        return None  # No path found

    @staticmethod
    async def get_critical_dependencies(db: AsyncSession) -> List[Dependency]:
        """Get all critical dependencies"""
        result = await db.execute(
            select(Dependency)
            .where(Dependency.criticality == "critical")
        )
        return result.scalars().all()

    @staticmethod
    async def get_circular_dependencies(db: AsyncSession) -> List[List[int]]:
        """Detect circular dependencies in the graph"""

        # Get all dependencies
        deps_result = await db.execute(select(Dependency))
        deps = deps_result.scalars().all()

        # Build adjacency list
        graph = defaultdict(list)
        for dep in deps:
            if dep.provider_id:
                graph[dep.consumer_id].append(dep.provider_id)

        # DFS to find cycles
        cycles = []
        visited = set()
        rec_stack = set()
        path = []

        def dfs(node: int) -> bool:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)

            for neighbor in graph[node]:
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    # Found cycle
                    cycle_start = path.index(neighbor)
                    cycle = path[cycle_start:] + [neighbor]
                    cycles.append(cycle)
                    return True

            path.pop()
            rec_stack.remove(node)
            return False

        # Check all nodes
        for node in graph.keys():
            if node not in visited:
                dfs(node)

        return cycles

