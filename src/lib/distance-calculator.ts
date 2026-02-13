/**
 * Servicio para calcular distancias y costos de delivery
 */

// Dirección de origen (punto de salida de pedidos)
const ORIGIN_ADDRESS = "Av. Retamas 479, Ate Salamanca, Lima, Peru";

// Tarifas de delivery según distancia (en km)
export const DELIVERY_RATES = {
  tier1: { maxKm: 1, price: 5.0 }, // 0-1 km: S/ 5.00
  tier2: { maxKm: 3, price: 8.0 }, // 1-3 km: S/ 8.00
  tier3: { maxKm: 8, price: 15.0 }, // 3-8 km: S/ 15.00
  maxCoverage: 8, // Máximo 8 km de cobertura
};

export interface DistanceResult {
  distanceInKm: number;
  deliveryCost: number;
  isWithinCoverage: boolean;
  distanceText: string;
}

/**
 * Calcula la distancia y el costo de delivery usando Google Maps Distance Matrix API
 */
export async function calculateDeliveryDistance(
  destinationAddress: string,
): Promise<DistanceResult> {
  try {
    const response = await fetch("/api/calculate-distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: destinationAddress }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error calculando distancia");
    }

    const data = await response.json();

    return {
      distanceInKm: data.distanceInKm,
      deliveryCost: data.deliveryCost,
      isWithinCoverage: data.isWithinCoverage,
      distanceText: data.distanceText,
    };
  } catch (error) {
    console.error("Error calculando distancia:", error);
    throw error;
  }
}

/**
 * Calcula el costo de delivery según la distancia en km
 */
export function calculateDeliveryCost(distanceInKm: number): number {
  if (distanceInKm <= DELIVERY_RATES.tier1.maxKm) {
    return DELIVERY_RATES.tier1.price;
  } else if (distanceInKm <= DELIVERY_RATES.tier2.maxKm) {
    return DELIVERY_RATES.tier2.price;
  } else if (distanceInKm <= DELIVERY_RATES.tier3.maxKm) {
    return DELIVERY_RATES.tier3.price;
  } else {
    // Fuera de cobertura, pero devolvemos el precio más alto
    return DELIVERY_RATES.tier3.price;
  }
}

/**
 * Calcula distancia usando coordenadas directamente (alternativa más rápida)
 */
export async function calculateDeliveryDistanceByCoords(
  lat: number,
  lng: number,
): Promise<DistanceResult> {
  try {
    const response = await fetch("/api/calculate-distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lat, lng }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error calculando distancia");
    }

    const data = await response.json();

    return {
      distanceInKm: data.distanceInKm,
      deliveryCost: data.deliveryCost,
      isWithinCoverage: data.isWithinCoverage,
      distanceText: data.distanceText,
    };
  } catch (error) {
    console.error("Error calculando distancia:", error);
    throw error;
  }
}
