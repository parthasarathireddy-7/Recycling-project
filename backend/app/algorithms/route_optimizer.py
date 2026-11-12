from abc import ABC, abstractmethod
from typing import List, Dict, Tuple, Any, Optional
import copy
from app.algorithms.graph import Graph, Node
from app.algorithms.geo_distance import road_distance_estimate, fetch_osrm_distance_matrix
from app.algorithms.dijkstra import DijkstraSolver
from app.algorithms.astar import AStarSolver
from app.algorithms.fuel_calculator import FuelCalculator

class BaseRouteOptimizer(ABC):
    """
    Abstract Base Class for Route Optimizers.
    Demonstrates OOP Abstraction and Polymorphism.
    """
    def __init__(self, algorithm_name: str):
        self.algorithm_name = algorithm_name

    @abstractmethod
    def solve_tsp(
        self,
        start_id: str,
        destination_id: str,
        stop_ids: List[str],
        distance_matrix: Dict[str, Dict[str, float]]
    ) -> List[str]:
        """Returns the ordered list of node IDs from start to destination."""
        pass

class NearestNeighbor2OptOptimizer(BaseRouteOptimizer):
    """
    Optimizes multi-stop route using Nearest Neighbor greedy construction
    followed by 2-Opt local search refinement.
    """
    def __init__(self):
        super().__init__("Nearest-Neighbor-2Opt")

    def solve_tsp(
        self,
        start_id: str,
        destination_id: str,
        stop_ids: List[str],
        distance_matrix: Dict[str, Dict[str, float]]
    ) -> List[str]:
        if not stop_ids:
            return [start_id, destination_id] if start_id != destination_id else [start_id]

        # Greedy Nearest Neighbor construction
        unvisited = set(stop_ids)
        current = start_id
        ordered_stops: List[str] = []

        while unvisited:
            next_node = min(
                unvisited,
                key=lambda node: distance_matrix.get(current, {}).get(node, float("inf"))
            )
            ordered_stops.append(next_node)
            unvisited.remove(next_node)
            current = next_node

        route = [start_id] + ordered_stops + [destination_id]

        # 2-Opt local search refinement to eliminate crossing paths
        route = self._apply_2opt(route, distance_matrix)
        return route

    def _route_length(self, route: List[str], distance_matrix: Dict[str, Dict[str, float]]) -> float:
        total = 0.0
        for i in range(len(route) - 1):
            total += distance_matrix.get(route[i], {}).get(route[i + 1], 0.0)
        return total

    def _apply_2opt(self, route: List[str], distance_matrix: Dict[str, Dict[str, float]]) -> List[str]:
        best_route = list(route)
        best_distance = self._route_length(best_route, distance_matrix)
        improved = True
        max_iterations = 50
        iterations = 0

        # We keep start (index 0) and destination (index len-1) fixed
        while improved and iterations < max_iterations:
            improved = False
            iterations += 1
            for i in range(1, len(best_route) - 2):
                for j in range(i + 1, len(best_route) - 1):
                    # 2-opt swap reverses subsegment best_route[i:j+1]
                    new_route = best_route[:i] + best_route[i:j+1][::-1] + best_route[j+1:]
                    new_distance = self._route_length(new_route, distance_matrix)
                    if new_distance < best_distance - 1e-4:
                        best_route = new_route
                        best_distance = new_distance
                        improved = True
                        break
                if improved:
                    break

        return best_route

class DijkstraRouteOptimizer(BaseRouteOptimizer):
    """
    Calculates pairwise shortest paths via Dijkstra's Algorithm,
    then executes TSP optimization with 2-Opt.
    """
    def __init__(self):
        super().__init__("Dijkstra-TSP")
        self._tsp = NearestNeighbor2OptOptimizer()

    def solve_tsp(
        self,
        start_id: str,
        destination_id: str,
        stop_ids: List[str],
        distance_matrix: Dict[str, Dict[str, float]]
    ) -> List[str]:
        return self._tsp.solve_tsp(start_id, destination_id, stop_ids, distance_matrix)

class AStarRouteOptimizer(BaseRouteOptimizer):
    """
    Calculates pairwise shortest paths via A* Search Algorithm,
    then executes TSP optimization with 2-Opt.
    """
    def __init__(self):
        super().__init__("A*-TSP")
        self._tsp = NearestNeighbor2OptOptimizer()

    def solve_tsp(
        self,
        start_id: str,
        destination_id: str,
        stop_ids: List[str],
        distance_matrix: Dict[str, Dict[str, float]]
    ) -> List[str]:
        return self._tsp.solve_tsp(start_id, destination_id, stop_ids, distance_matrix)

class RouteOptimizationEngine:
    """
    High-level facade orchestrator for routing, capacity check,
    comparative benchmark, and fuel calculations.
    """
    def __init__(self, default_fuel_price: float = 96.50, average_speed_kmh: float = 40.0):
        self.fuel_calculator = FuelCalculator(fuel_price_per_unit=default_fuel_price)
        self.average_speed_kmh = average_speed_kmh
        self.optimizers: Dict[str, BaseRouteOptimizer] = {
            "Dijkstra-TSP": DijkstraRouteOptimizer(),
            "A*-TSP": AStarRouteOptimizer(),
            "Nearest-Neighbor-2Opt": NearestNeighbor2OptOptimizer(),
        }

    def build_network_graph(self, nodes: List[Node]) -> Tuple[Graph, Dict[str, Dict[str, float]]]:
        """
        Builds graph and computes distance matrix between all pairs.
        """
        graph = Graph()
        for node in nodes:
            graph.add_node(node)

        # Build fully connected complete mesh with realistic road distances
        matrix: Dict[str, Dict[str, float]] = {n.node_id: {} for n in nodes}
        for i in range(len(nodes)):
            for j in range(len(nodes)):
                u = nodes[i]
                v = nodes[j]
                if i == j:
                    dist = 0.0
                else:
                    dist = road_distance_estimate(u.latitude, u.longitude, v.latitude, v.longitude)
                    graph.add_edge(u.node_id, v.node_id, dist)
                matrix[u.node_id][v.node_id] = dist

        return graph, matrix

    def optimize_route(
        self,
        start_node: Node,
        destination_node: Node,
        collection_nodes: List[Node],
        vehicle_capacity_kg: float,
        vehicle_fuel_efficiency_km_l: float = 10.0,
        fuel_type: str = "Diesel",
        fuel_price: float = 1.45,
        algorithm: str = "Dijkstra-TSP"
    ) -> Dict[str, Any]:
        """
        Main entry point for generating optimized routes and comparative benchmarks.
        """
        all_nodes_dict: Dict[str, Node] = {
            start_node.node_id: start_node,
            destination_node.node_id: destination_node
        }
        for node in collection_nodes:
            all_nodes_dict[node.node_id] = node

        unique_nodes = list(all_nodes_dict.values())
        graph, base_matrix = self.build_network_graph(unique_nodes)

        # Compute accurate algorithm-specific all-pairs distance matrix
        if algorithm == "Dijkstra-TSP":
            dijkstra = DijkstraSolver(graph)
            matrix = dijkstra.compute_all_pairs_matrix([n.node_id for n in unique_nodes])
        elif algorithm == "A*-TSP":
            astar = AStarSolver(graph)
            matrix = astar.compute_all_pairs_matrix([n.node_id for n in unique_nodes])
        else:
            matrix = base_matrix

        # Capacity validation
        total_load_kg = sum(node.weight_kg for node in collection_nodes)
        capacity_exceeded = total_load_kg > vehicle_capacity_kg
        capacity_utilization_pct = round((total_load_kg / vehicle_capacity_kg * 100.0) if vehicle_capacity_kg > 0 else 0.0, 1)

        # 1. Original Sequence (Route A): Start -> In order of input -> Destination
        original_stop_ids = [n.node_id for n in collection_nodes]
        route_a_ids = [start_node.node_id] + original_stop_ids + [destination_node.node_id]

        # 2. Optimized Sequence (Route B)
        optimizer = self.optimizers.get(algorithm, self.optimizers["Dijkstra-TSP"])
        route_b_ids = optimizer.solve_tsp(
            start_node.node_id,
            destination_node.node_id,
            original_stop_ids,
            matrix
        )

        def calculate_route_metrics(route_ids: List[str]) -> Dict[str, Any]:
            distance = 0.0
            legs = []
            cumulative_weight = 0.0
            current_time_minutes = 0.0

            for i in range(len(route_ids) - 1):
                u_id = route_ids[i]
                v_id = route_ids[i + 1]
                leg_dist = matrix.get(u_id, {}).get(v_id, 0.0)
                distance += leg_dist

                # Driving time (minutes) at average speed + 5 min service time per collection point
                travel_mins = (leg_dist / self.average_speed_kmh) * 60.0
                service_mins = 5.0 if all_nodes_dict[v_id].node_type == "point" else 0.0
                current_time_minutes += travel_mins + service_mins

                target_node = all_nodes_dict[v_id]
                cumulative_weight += target_node.weight_kg

                legs.append({
                    "from_node_id": u_id,
                    "from_name": all_nodes_dict[u_id].name,
                    "to_node_id": v_id,
                    "to_name": target_node.name,
                    "distance_km": round(leg_dist, 2),
                    "estimated_time_minutes": round(travel_mins + service_mins, 1),
                    "cumulative_weight_kg": round(cumulative_weight, 2),
                    "target_latitude": target_node.latitude,
                    "target_longitude": target_node.longitude
                })

            fuel_data = self.fuel_calculator.calculate_trip(
                distance_km=distance,
                efficiency_km_per_unit=vehicle_fuel_efficiency_km_l,
                fuel_type=fuel_type,
                custom_price_per_unit=fuel_price
            )

            waypoints = [all_nodes_dict[nid].to_dict() for nid in route_ids]

            return {
                "route_sequence_ids": route_ids,
                "waypoints": waypoints,
                "legs": legs,
                "total_distance_km": round(distance, 2),
                "total_time_minutes": round(current_time_minutes, 1),
                "total_load_kg": round(total_load_kg, 2),
                "fuel_metrics": fuel_data
            }

        route_a_metrics = calculate_route_metrics(route_a_ids)
        route_b_metrics = calculate_route_metrics(route_b_ids)

        # Comparison analysis
        dist_a = route_a_metrics["total_distance_km"]
        dist_b = route_b_metrics["total_distance_km"]
        distance_saved = max(0.0, round(dist_a - dist_b, 2))
        pct_distance_saved = round((distance_saved / dist_a * 100.0) if dist_a > 0 else 0.0, 1)

        time_a = route_a_metrics["total_time_minutes"]
        time_b = route_b_metrics["total_time_minutes"]
        time_saved = max(0.0, round(time_a - time_b, 1))

        fuel_a = route_a_metrics["fuel_metrics"]["fuel_consumption_units"]
        fuel_b = route_b_metrics["fuel_metrics"]["fuel_consumption_units"]
        fuel_saved = max(0.0, round(fuel_a - fuel_b, 2))

        cost_a = route_a_metrics["fuel_metrics"]["estimated_fuel_cost"]
        cost_b = route_b_metrics["fuel_metrics"]["estimated_fuel_cost"]
        cost_saved = max(0.0, round(cost_a - cost_b, 2))

        co2_a = route_a_metrics["fuel_metrics"]["co2_emissions_kg"]
        co2_b = route_b_metrics["fuel_metrics"]["co2_emissions_kg"]
        co2_saved = max(0.0, round(co2_a - co2_b, 2))

        return {
            "algorithm": algorithm,
            "capacity_validation": {
                "vehicle_capacity_kg": vehicle_capacity_kg,
                "total_load_kg": total_load_kg,
                "capacity_utilization_pct": capacity_utilization_pct,
                "capacity_exceeded": capacity_exceeded,
                "warning_message": (
                    f"Warning: Total cargo ({total_load_kg} kg) exceeds vehicle capacity ({vehicle_capacity_kg} kg) by {round(total_load_kg - vehicle_capacity_kg, 1)} kg!"
                    if capacity_exceeded else "Capacity OK. Vehicle safely within operating limits."
                )
            },
            "route_a_original": route_a_metrics,
            "route_b_optimized": route_b_metrics,
            "comparison": {
                "original_distance_km": dist_a,
                "optimized_distance_km": dist_b,
                "distance_saved_km": distance_saved,
                "distance_improvement_pct": pct_distance_saved,
                "original_time_minutes": time_a,
                "optimized_time_minutes": time_b,
                "time_saved_minutes": time_saved,
                "original_fuel_consumption": fuel_a,
                "optimized_fuel_consumption": fuel_b,
                "fuel_saved_units": fuel_saved,
                "original_fuel_cost": cost_a,
                "optimized_fuel_cost": cost_b,
                "fuel_cost_saved": cost_saved,
                "co2_saved_kg": co2_saved
            }
        }

