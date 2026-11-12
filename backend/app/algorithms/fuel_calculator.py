from typing import Dict, Any

class FuelCalculator:
    """
    Object-Oriented Fuel and Cost Calculation Engine.
    Calculates fuel consumption, operational expenditure, per-km efficiency,
    and carbon emissions across multiple fuel modalities.
    """
    # Emission factor (kg CO2 per litre or kWh or kg CNG)
    EMISSION_FACTORS = {
        "Diesel": 2.68,    # kg CO2 / L
        "Petrol": 2.31,    # kg CO2 / L
        "CNG": 1.95,       # kg CO2 / kg
        "Electric": 0.45   # kg CO2 / kWh average grid
    }

    def __init__(self, fuel_price_per_unit: float = 96.50):
        self.fuel_price_per_unit = float(fuel_price_per_unit)

    def calculate_trip(
        self,
        distance_km: float,
        efficiency_km_per_unit: float,
        fuel_type: str = "Diesel",
        custom_price_per_unit: float = None
    ) -> Dict[str, Any]:
        """
        Computes trip fuel consumption, cost, and emissions.
        """
        if efficiency_km_per_unit <= 0:
            efficiency_km_per_unit = 10.0  # Safe default

        price = custom_price_per_unit if custom_price_per_unit is not None else self.fuel_price_per_unit

        # Fuel consumption in units (Litres / kWh / kg)
        consumption = distance_km / efficiency_km_per_unit
        total_cost = consumption * price
        cost_per_km = (total_cost / distance_km) if distance_km > 0 else 0.0

        emission_factor = self.EMISSION_FACTORS.get(fuel_type, 2.68)
        co2_emissions_kg = consumption * emission_factor

        return {
            "distance_km": round(distance_km, 2),
            "fuel_type": fuel_type,
            "fuel_efficiency_km_unit": round(efficiency_km_per_unit, 2),
            "fuel_price_per_unit": round(price, 2),
            "fuel_consumption_units": round(consumption, 2),
            "estimated_fuel_cost": round(total_cost, 2),
            "cost_per_km": round(cost_per_km, 3),
            "co2_emissions_kg": round(co2_emissions_kg, 2)
        }

    def compare_savings(
        self,
        original_distance_km: float,
        optimized_distance_km: float,
        efficiency_km_per_unit: float,
        fuel_type: str = "Diesel",
        custom_price_per_unit: float = None
    ) -> Dict[str, Any]:
        """
        Computes side-by-side savings metrics between original and optimized routes.
        """
        orig = self.calculate_trip(original_distance_km, efficiency_km_per_unit, fuel_type, custom_price_per_unit)
        opt = self.calculate_trip(optimized_distance_km, efficiency_km_per_unit, fuel_type, custom_price_per_unit)

        distance_saved = max(0.0, original_distance_km - optimized_distance_km)
        fuel_saved = max(0.0, orig["fuel_consumption_units"] - opt["fuel_consumption_units"])
        cost_saved = max(0.0, orig["estimated_fuel_cost"] - opt["estimated_fuel_cost"])
        emissions_saved = max(0.0, orig["co2_emissions_kg"] - opt["co2_emissions_kg"])
        
        improvement_pct = ((distance_saved / original_distance_km) * 100.0) if original_distance_km > 0 else 0.0

        return {
            "original": orig,
            "optimized": opt,
            "distance_saved_km": round(distance_saved, 2),
            "fuel_saved_units": round(fuel_saved, 2),
            "cost_saved": round(cost_saved, 2),
            "co2_saved_kg": round(emissions_saved, 2),
            "improvement_percentage": round(improvement_pct, 1)
        }

