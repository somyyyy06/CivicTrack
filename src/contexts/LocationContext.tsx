import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  userLocation: Location | null;
  isLocationLoading: boolean;
  locationError: string | null;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  getLocation: () => Promise<void>;
  isWithinRadius: (issueLocation: Location) => boolean;
  distanceFromUser: (issueLocation: Location) => number;
  currentCity: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(3); // Default 3km radius
  const [currentCity, setCurrentCity] = useState<string | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if coordinates are within India (rough boundaries)
  const isLocationInIndia = (latitude: number, longitude: number): boolean => {
    // India's approximate boundaries
    const indiaBounds = {
      north: 37.6, // Northernmost point
      south: 6.8, // Southernmost point
      east: 97.4, // Easternmost point
      west: 68.1, // Westernmost point
    };

    return (
      latitude >= indiaBounds.south &&
      latitude <= indiaBounds.north &&
      longitude >= indiaBounds.west &&
      longitude <= indiaBounds.east
    );
  };

  // Get city name from coordinates using reverse geocoding
  const getCityFromCoordinates = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      // For now, return a fallback since we don't have an API key
      // In production, you would use a proper geocoding service
      return "Your Location";
    } catch (error) {
      console.error("Error getting city name:", error);
      return "Your Location";
    }
  };

  // Check if an issue is within the user's radius
  const isWithinRadius = (issueLocation: Location): boolean => {
    if (!userLocation) return false;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      issueLocation.latitude,
      issueLocation.longitude
    );

    return distance <= radiusKm;
  };

  // Calculate distance from user to an issue
  const distanceFromUser = (issueLocation: Location): number => {
    if (!userLocation) return Infinity;

    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      issueLocation.latitude,
      issueLocation.longitude
    );
  };

  // Get user's current location using GPS
  const getLocation = async (): Promise<void> => {
    setIsLocationLoading(true);
    setLocationError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Check if location is within India
      if (!isLocationInIndia(latitude, longitude)) {
        setLocationError(
          "Location detected outside India. Please ensure you're in India to use this service."
        );
        setIsLocationLoading(false);
        return;
      }

      setUserLocation({ latitude, longitude });

      // Get city name (fallback to coordinates if API fails)
      try {
        const cityName = await getCityFromCoordinates(latitude, longitude);
        setCurrentCity(cityName);
      } catch (error) {
        setCurrentCity(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error("Error getting location:", error);

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable location services to see issues near you."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Location unavailable. Please check your GPS settings."
            );
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError(
              "Unable to get your location. Please check your device settings."
            );
        }
      } else {
        setLocationError(
          "Location service unavailable. Please try again later."
        );
      }
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Initialize location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const value: LocationContextType = {
    userLocation,
    isLocationLoading,
    locationError,
    radiusKm,
    setRadiusKm,
    getLocation,
    isWithinRadius,
    distanceFromUser,
    currentCity,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
