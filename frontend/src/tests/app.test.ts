import { describe, it, expect } from "vitest";

describe("Fuel and Cost Calculation Logic", () => {
  it("accurately computes consumption and cost", () => {
    const distanceKm = 80.0;
    const efficiencyKmPerL = 10.0;
    const pricePerL = 1.50;

    const consumption = distanceKm / efficiencyKmPerL;
    const cost = consumption * pricePerL;
    const costPerKm = cost / distanceKm;

    expect(consumption).toBe(8.0);
    expect(cost).toBe(12.0);
    expect(costPerKm).toBe(0.15);
  });

  it("calculates optimization savings correctly", () => {
    const originalDist = 100.0;
    const optimizedDist = 72.0;
    const efficiency = 8.0;
    const fuelPrice = 1.45;

    const savedDist = originalDist - optimizedDist;
    const originalFuel = originalDist / efficiency;
    const optimizedFuel = optimizedDist / efficiency;
    const savedFuel = originalFuel - optimizedFuel;
    const savedCost = savedFuel * fuelPrice;
    const improvementPct = (savedDist / originalDist) * 100;

    expect(savedDist).toBe(28.0);
    expect(savedFuel).toBe(3.5);
    expect(Number(savedCost.toFixed(2))).toBe(5.08);
    expect(improvementPct).toBeCloseTo(28.0, 5);
  });
});

describe("Collection Point Form Validation Logic", () => {
  it("rejects invalid coordinates and zero weights", () => {
    const validate = (formData: any) => {
      const errors: Record<string, string> = {};
      if (!formData.name?.trim()) errors.name = "Name required";
      if (formData.latitude < -90 || formData.latitude > 90) errors.latitude = "Invalid latitude";
      if (formData.longitude < -180 || formData.longitude > 180) errors.longitude = "Invalid longitude";
      if (formData.estimated_weight_kg <= 0) errors.weight = "Invalid weight";
      return errors;
    };

    const validPoint = {
      name: "Central Terminal Hub",
      latitude: 40.7527,
      longitude: -73.9772,
      estimated_weight_kg: 180.0
    };
    expect(Object.keys(validate(validPoint)).length).toBe(0);

    const invalidPoint = {
      name: "",
      latitude: 195.0,
      longitude: -73.9772,
      estimated_weight_kg: -5.0
    };
    const errors = validate(invalidPoint);
    expect(errors.name).toBeDefined();
    expect(errors.latitude).toBeDefined();
    expect(errors.weight).toBeDefined();
  });
});
