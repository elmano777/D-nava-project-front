import { NextRequest, NextResponse } from "next/server";

// Dirección de origen (punto de salida de pedidos)
const ORIGIN_ADDRESS = "Retamas 479, Ate 15022, Lima, Peru";
// Coordenadas de Retamas 479, Ate (verificadas en Google Maps)
const ORIGIN_LAT = -12.0828242;
const ORIGIN_LNG = -76.9820474;

// Tarifas de delivery según distancia (en km)
const DELIVERY_RATES = {
  tier1: { maxKm: 1, price: 5.0 }, // 0-1 km: S/ 5.00
  tier2: { maxKm: 3, price: 8.0 }, // 1-3 km: S/ 8.00
  tier3: { maxKm: 8, price: 15.0 }, // 3-8 km: S/ 15.00
  maxCoverage: 8, // Máximo 8 km de cobertura
};

function calculateDeliveryCost(distanceInKm: number): number {
  if (distanceInKm <= DELIVERY_RATES.tier1.maxKm) {
    return DELIVERY_RATES.tier1.price;
  } else if (distanceInKm <= DELIVERY_RATES.tier2.maxKm) {
    return DELIVERY_RATES.tier2.price;
  } else if (distanceInKm <= DELIVERY_RATES.tier3.maxKm) {
    return DELIVERY_RATES.tier3.price;
  } else {
    return DELIVERY_RATES.tier3.price;
  }
}

// Calcular distancia usando fórmula de Haversine (distancia en línea recta)
function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, address } = body;

    if (!lat && !lng && !address) {
      return NextResponse.json(
        { error: "Se requiere latitud/longitud o dirección" },
        { status: 400 },
      );
    }

    // Usar API key del servidor (sin restricciones de referer) o fallback a la pública
    const apiKey =
      process.env.GOOGLE_MAPS_SERVER_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key no configurada" },
        { status: 500 },
      );
    }

    let destinationLat = lat;
    let destinationLng = lng;

    // Si solo tenemos dirección, geocodificarla para obtener coordenadas
    if (!destinationLat || !destinationLng) {
      // Asegurar que la dirección incluya "Lima, Peru" para mejor geocodificación
      const addressToGeocode =
        address.includes("Peru") || address.includes("Perú")
          ? address
          : `${address}, Lima, Peru`;

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        addressToGeocode,
      )}&components=country:PE&key=${apiKey}`;

      console.log("Geocodificando dirección:", addressToGeocode);

      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      console.log("Geocoding status:", geocodeData.status);

      if (geocodeData.status !== "OK" || !geocodeData.results[0]) {
        console.error("Error geocodificando:", geocodeData);
        return NextResponse.json(
          { error: `No se pudo encontrar la dirección: ${geocodeData.status}` },
          { status: 400 },
        );
      }

      const location = geocodeData.results[0].geometry.location;
      destinationLat = location.lat;
      destinationLng = location.lng;
      console.log("Coordenadas encontradas:", {
        lat: destinationLat,
        lng: destinationLng,
      });
    }

    // Calcular distancia usando Haversine (línea recta)
    const distanceInKm = calculateHaversineDistance(
      ORIGIN_LAT,
      ORIGIN_LNG,
      destinationLat,
      destinationLng,
    );

    const distanceText = `${distanceInKm.toFixed(1)} km`;
    const deliveryCost = calculateDeliveryCost(distanceInKm);
    const isWithinCoverage = distanceInKm <= DELIVERY_RATES.maxCoverage;

    return NextResponse.json({
      distanceInKm,
      deliveryCost,
      isWithinCoverage,
      distanceText,
    });
  } catch (error) {
    console.error("Error calculando distancia:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
