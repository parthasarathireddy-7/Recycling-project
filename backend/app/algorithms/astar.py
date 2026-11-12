import heapq
from typing import Dict, List, Tuple, Optional
from app.algorithms.graph import Graph
from app.algorithms.geo_distance import haversine_distance

class AStarSolver:
    """
    Object-Oriented Implementation of A* Search Algorithm.
    Uses Haversine distance as an admissible and consistent heuristic:
    f(n) = g(n) + h(n)
    Where:
      g(n) = exact path cost from start to node n
      h(n) = straight-line Haversine distance from node n to target (admissible)
    """
    def __init__(self, graph: Graph):
        self.graph = graph

    def heuristic(self, node_id_a: str, node_id_b: str) -> float:
        node_a = self.graph.nodes.get(node_id_a)
        node_b = self.graph.nodes.get(node_id_b)
        if not node_a or not node_b:
            return 0.0
        return haversine_distance(node_a.latitude, node_a.longitude, node_b.latitude, node_b.longitude)

    def shortest_path(self, start_id: str, target_id: str) -> Tuple[List[str], float, int]:
        """
        Finds the optimal path from start_id to target_id using A* search.
        Returns:
            path: List of node IDs from start to target
            distance: Total path length (km)
            nodes_visited: Count of expanded vertices
        """
        if start_id == target_id:
            return ([start_id], 0.0, 1)

        # Priority queue stores (f_score, g_score, node_id)
        start_h = self.heuristic(start_id, target_id)
        pq: List[Tuple[float, float, str]] = [(start_h, 0.0, start_id)]
        g_scores: Dict[str, float] = {start_id: 0.0}
        previous: Dict[str, Optional[str]] = {start_id: None}
        visited_count = 0
        visited_set = set()

        while pq:
            f, current_g, current_node = heapq.heappop(pq)

            if current_node in visited_set:
                continue
            visited_set.add(current_node)
            visited_count += 1

            if current_node == target_id:
                break

            for neighbor, weight in self.graph.get_neighbors(current_node).items():
                tentative_g = current_g + weight
                if neighbor not in g_scores or tentative_g < g_scores[neighbor]:
                    g_scores[neighbor] = tentative_g
                    h_val = self.heuristic(neighbor, target_id)
                    f_val = tentative_g + h_val
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (f_val, tentative_g, neighbor))

        if target_id not in g_scores:
            return ([], float("inf"), visited_count)

        # Reconstruct path
        path: List[str] = []
        curr: Optional[str] = target_id
        while curr is not None:
            path.append(curr)
            curr = previous.get(curr)
        path.reverse()

        return (path, round(g_scores[target_id], 3), visited_count)

    def compute_all_pairs_matrix(self, node_ids: List[str]) -> Dict[str, Dict[str, float]]:
        """
        Computes pairwise shortest path distance matrix using A*.
        """
        matrix: Dict[str, Dict[str, float]] = {u: {} for u in node_ids}
        for u in node_ids:
            for v in node_ids:
                if u == v:
                    matrix[u][v] = 0.0
                elif v in matrix and u in matrix[v]:
                    matrix[u][v] = matrix[v][u]
                else:
                    _, dist, _ = self.shortest_path(u, v)
                    matrix[u][v] = dist
        return matrix

