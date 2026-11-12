import heapq
from typing import Dict, List, Tuple, Optional
from app.algorithms.graph import Graph

class DijkstraSolver:
    """
    Object-Oriented Implementation of Dijkstra's Shortest Path Algorithm.
    Computes guaranteed minimal distance paths between network vertices using a min-heap.
    """
    def __init__(self, graph: Graph):
        self.graph = graph

    def shortest_path(self, start_id: str, target_id: str) -> Tuple[List[str], float, int]:
        """
        Finds the shortest path from start_id to target_id.
        Returns:
            path: List of node IDs from start to target
            distance: Total path length (km)
            nodes_visited: Count of expanded vertices
        """
        if start_id == target_id:
            return ([start_id], 0.0, 1)

        # Min-priority queue: (current_distance, current_node_id)
        pq: List[Tuple[float, str]] = [(0.0, start_id)]
        distances: Dict[str, float] = {start_id: 0.0}
        previous: Dict[str, Optional[str]] = {start_id: None}
        visited_count = 0
        visited_set = set()

        while pq:
            current_dist, current_node = heapq.heappop(pq)

            if current_node in visited_set:
                continue
            visited_set.add(current_node)
            visited_count += 1

            if current_node == target_id:
                break

            for neighbor, weight in self.graph.get_neighbors(current_node).items():
                new_dist = current_dist + weight
                if neighbor not in distances or new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (new_dist, neighbor))

        if target_id not in distances:
            # Target unreachable
            return ([], float("inf"), visited_count)

        # Reconstruct path
        path: List[str] = []
        curr: Optional[str] = target_id
        while curr is not None:
            path.append(curr)
            curr = previous.get(curr)
        path.reverse()

        return (path, round(distances[target_id], 3), visited_count)

    def compute_all_pairs_matrix(self, node_ids: List[str]) -> Dict[str, Dict[str, float]]:
        """
        Computes the distance matrix between all provided node_ids using Dijkstra.
        """
        matrix: Dict[str, Dict[str, float]] = {u: {} for u in node_ids}
        for u in node_ids:
            # Run Dijkstra from node u to all reachable nodes
            pq: List[Tuple[float, str]] = [(0.0, u)]
            distances: Dict[str, float] = {u: 0.0}
            visited = set()

            while pq:
                d, curr = heapq.heappop(pq)
                if curr in visited:
                    continue
                visited.add(curr)

                for nxt, weight in self.graph.get_neighbors(curr).items():
                    if nxt not in distances or d + weight < distances[nxt]:
                        distances[nxt] = d + weight
                        heapq.heappush(pq, (d + weight, nxt))

            for v in node_ids:
                matrix[u][v] = round(distances.get(v, float("inf")), 3)

        return matrix

