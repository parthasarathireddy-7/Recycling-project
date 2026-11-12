from typing import Dict, List, Tuple, Any, Optional

class Node:
    """Represents a location in the routing network."""
    def __init__(self, node_id: str, name: str, latitude: float, longitude: float, node_type: str = "point", weight_kg: float = 0.0):
        self.node_id = str(node_id)
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.node_type = node_type  # 'depot', 'facility', 'point'
        self.weight_kg = weight_kg

    def coordinates(self) -> Tuple[float, float]:
        return (self.latitude, self.longitude)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "node_type": self.node_type,
            "weight_kg": self.weight_kg
        }

    def __repr__(self):
        return f"<Node {self.node_id} ({self.name})>"

class Graph:
    """Represents a weighted road network graph."""
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.adjacency: Dict[str, Dict[str, float]] = {}

    def add_node(self, node: Node) -> None:
        self.nodes[node.node_id] = node
        if node.node_id not in self.adjacency:
            self.adjacency[node.node_id] = {}

    def add_edge(self, from_id: str, to_id: str, weight: float, bidirectional: bool = True) -> None:
        if from_id not in self.adjacency:
            self.adjacency[from_id] = {}
        if to_id not in self.adjacency:
            self.adjacency[to_id] = {}

        self.adjacency[from_id][to_id] = weight
        if bidirectional:
            self.adjacency[to_id][from_id] = weight

    def get_edge_weight(self, from_id: str, to_id: str) -> Optional[float]:
        return self.adjacency.get(from_id, {}).get(to_id)

    def get_neighbors(self, node_id: str) -> Dict[str, float]:
        return self.adjacency.get(node_id, {})

