import math
from typing import Tuple, List, Optional
import requests
import logging

logger = logging.getLogger("uvicorn")

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth (specified in decimal degrees).
    Returns distance in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 3)

def road_distance_estimate(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Estimate realistic road travel distance from straight line distance
    using urban circuitry factor (~1.28x).
    """
    direct = haversine_distance(lat1, lon1, lat2, lon2)
    return round(direct * 1.28, 3)

def fetch_osrm_distance_matrix(coordinates: List[Tuple[float, float]], base_url: str = "https://router.project-osrm.org") -> Optional[List[List[float]]]:
    """
    Attempts to fetch real road-network distance matrix (in km) from OSRM table service.
    Coordinates format: [(lat, lon), ...]
    OSRM expects: lon,lat
    Returns matrix of distances in km or None if service unreachable.
    """
    try:
        if len(coordinates) < 2 or len(coordinates) > 25:
            return None
        coords_str = ";".join([f"{lon:.6f},{lat:.6f}" for lat, lon in coordinates])
        url = f"{base_url}/table/v1/driving/{coords_str}?annotations=distance"
        response = requests.get(url, timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            if data.get("code") == "Ok" and "distances" in data:
                # OSRM returns distances in meters, convert to km
                matrix = [[round(dist / 1000.0, 3) for dist in row] for row in data["distances"]]
                return matrix
    except Exception as e:
        logger.debug(f"OSRM distance matrix query bypassed: {e}")
    return None

