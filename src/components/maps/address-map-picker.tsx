"use client";

import { useCallback, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

const libraries: ("places" | "geometry")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

// Centro de Lima, Perú
const defaultCenter = {
  lat: -12.0464,
  lng: -77.0428,
};

interface AddressComponents {
  direccion_linea1: string;
  distrito: string;
  ciudad: string;
  codigo_postal: string;
  lat?: number;
  lng?: number;
}

interface AddressMapPickerProps {
  onAddressSelect: (address: AddressComponents) => void;
  initialCenter?: { lat: number; lng: number };
}

export function AddressMapPicker({
  onAddressSelect,
  initialCenter,
}: AddressMapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      // Intentar obtener la ubicación actual automáticamente al cargar
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            setMarkerPosition({ lat, lng });
            map.panTo({ lat, lng });
            map.setZoom(17);

            // Geocodificación inversa para obtener la dirección
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const addressComponents = extractAddressComponents(results[0]);
                if (addressComponents) {
                  onAddressSelect(addressComponents);
                  setSearchValue(addressComponents.direccion_linea1);
                }
              }
            });
          },
          (error) => {
            console.log("No se pudo obtener ubicación automática:", error);
            // No mostrar error, simplemente usar el centro por defecto
          },
        );
      }
    },
    [onAddressSelect],
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete,
  ) => {
    autocompleteRef.current = autocomplete;
  };

  const extractAddressComponents = (
    place: google.maps.places.PlaceResult,
  ): AddressComponents | null => {
    if (!place.geometry?.location) return null;

    const components = place.address_components || [];
    let streetNumber = "";
    let route = "";
    let distrito = "";
    let ciudad = "Lima";
    let postalCode = "";

    for (const component of components) {
      const types = component.types;

      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }
      if (types.includes("route")) {
        route = component.long_name;
      }
      if (types.includes("locality") || types.includes("sublocality")) {
        distrito = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        ciudad = component.long_name;
      }
      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    }

    const direccion_linea1 =
      `${route} ${streetNumber}`.trim() || place.formatted_address || "";

    return {
      direccion_linea1,
      distrito: distrito || "Lima",
      ciudad: ciudad || "Lima",
      codigo_postal: postalCode || "15001",
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
  };

  const onPlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMarkerPosition({ lat, lng });
        map?.panTo({ lat, lng });
        map?.setZoom(17);

        const addressComponents = extractAddressComponents(place);
        if (addressComponents) {
          onAddressSelect(addressComponents);
        }
      }
    }
  };

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setMarkerPosition({ lat, lng });

      // Geocodificación inversa para obtener la dirección
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const addressComponents = extractAddressComponents(results[0]);
          if (addressComponents) {
            onAddressSelect(addressComponents);
            setSearchValue(addressComponents.direccion_linea1);
          }
        }
      });
    },
    [onAddressSelect],
  );

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setMarkerPosition({ lat, lng });
          map?.panTo({ lat, lng });
          map?.setZoom(17);

          // Geocodificación inversa
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const addressComponents = extractAddressComponents(results[0]);
              if (addressComponents) {
                onAddressSelect(addressComponents);
                setSearchValue(addressComponents.direccion_linea1);
              }
            }
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener tu ubicación actual");
        },
      );
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Buscar dirección</Label>
        <div className="flex gap-2">
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: "pe" },
              fields: ["address_components", "geometry", "formatted_address"],
            }}
            className="flex-1"
          >
            <Input
              type="text"
              placeholder="Busca tu dirección..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Autocomplete>
          <Button type="button" variant="outline" onClick={getCurrentLocation}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          O haz clic en el mapa para seleccionar tu ubicación
        </p>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialCenter || markerPosition || defaultCenter}
        zoom={markerPosition ? 17 : 13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </div>
  );
}
