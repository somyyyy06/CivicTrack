import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useIssues, IssueCategory, IssueStatus } from "@/contexts/IssueContext";
import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Filter, Layers, MapPin, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import IssueFilterControl from "./IssueFilterControl";
import LocationControls from "./LocationControls";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mapbox requires a token - we'll use a public token for demonstration
// This is a placeholder token - for production, users would need their own
// Note: This token might have usage limits, so in production you should use your own token
mapboxgl.accessToken =
  "pk.eyJ1IjoiZGl2eWFuc2g0IiwiYSI6ImNscHY3OGI5MDAxYm4ya3MyeGsxOHNwYmQifQ.JT-wu0fKnBdwtfbO0xt-PA";

// Check if Mapbox token is valid
if (!mapboxgl.accessToken || mapboxgl.accessToken === "YOUR_MAPBOX_TOKEN") {
  console.warn(
    "Mapbox token is not configured. Please add a valid token for map functionality."
  );
}

// Default center for India (Delhi)
const DEFAULT_INDIA_CENTER: [number, number] = [77.209, 28.6139];

interface IssueMapProps {
  onIssueSelect?: (issueId: string) => void;
  height?: string;
  enableFilters?: boolean;
}

const IssueMap: React.FC<IssueMapProps> = ({
  onIssueSelect,
  height = "h-[calc(100vh-64px)]",
  enableFilters = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { issues } = useIssues();
  const { user } = useAuth();
  const {
    userLocation,
    isLocationLoading,
    locationError,
    radiusKm,
    isWithinRadius,
    distanceFromUser,
    currentCity,
    getLocation,
  } = useLocation();

  const [selectedFilters, setSelectedFilters] = useState<{
    category?: IssueCategory;
    status?: IssueStatus;
  }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showLocationControls, setShowLocationControls] = useState(false);

  // Filter issues based on location radius and selected filters
  const filteredIssues = issues.filter((issue) => {
    // First apply location-based filtering
    if (userLocation) {
      const issueLocation = {
        latitude: issue.location.latitude,
        longitude: issue.location.longitude,
      };

      if (!isWithinRadius(issueLocation)) {
        return false; // Issue is outside user's radius
      }
    }

    // Then apply category and status filters
    if (
      selectedFilters.category &&
      issue.category !== selectedFilters.category
    ) {
      return false;
    }
    if (selectedFilters.status && issue.status !== selectedFilters.status) {
      return false;
    }

    return true;
  });

  // Initialize map when component mounts
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      try {
        // Use user location if available, otherwise default to India center
        const initialCenter: [number, number] = userLocation
          ? [userLocation.longitude, userLocation.latitude]
          : DEFAULT_INDIA_CENTER;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: initialCenter,
          zoom: userLocation ? 14 : 5, // Zoom in more if we have user location
          attributionControl: false,
          pitchWithRotate: false,
          dragRotate: false,
        });

        // Add navigation controls (zoom only for Google Maps-like feel)
        const navControl = new mapboxgl.NavigationControl({
          showCompass: false,
        });
        map.current.addControl(navControl, "bottom-right");

        // Add geolocate control
        const geolocate = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        });
        map.current.addControl(geolocate, "bottom-right");

        map.current.on("load", () => {
          setMapLoaded(true);

          // Add custom Google Maps-like styling
          if (map.current) {
            // Add attribution in Google Maps style
            const attribution = document.createElement("div");
            attribution.className =
              "absolute bottom-0 right-0 bg-white px-2 py-1 text-xs text-gray-600 z-10";
            attribution.textContent = "© Mapbox © OpenStreetMap";
            mapContainer.current?.appendChild(attribution);
          }
        });

        // Handle map errors
        map.current.on("error", (e) => {
          console.error("Mapbox error:", e.error);
          setMapError(
            "Failed to load map. Please check your connection or try again later."
          );
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(
          "Failed to initialize map. Please check your connection or try again later."
        );
      }
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation]);

  // Center map on user location when it changes
  useEffect(() => {
    if (map.current && userLocation && mapLoaded) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        duration: 2000,
      });
    }
  }, [userLocation, mapLoaded]);

  // Add markers when issues or filters change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add user location marker if available
    if (userLocation) {
      const userMarkerEl = document.createElement("div");
      userMarkerEl.className = "relative";

      const userPin = document.createElement("div");
      userPin.className =
        "w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-lg border-4 border-white";
      userPin.style.backgroundColor = "#3B82F6";

      const userDot = document.createElement("div");
      userDot.className = "w-4 h-4 bg-white rounded-full";
      userPin.appendChild(userDot);
      userMarkerEl.appendChild(userPin);

      new mapboxgl.Marker(userMarkerEl)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
          }).setHTML(`
            <div class="p-2">
              <h3 class="font-sans text-sm font-medium text-gray-900">Your Location</h3>
              <p class="text-xs text-gray-600 mt-1">${
                currentCity || "Current Location"
              }</p>
            </div>
          `)
        )
        .addTo(map.current);
    }

    // Add filtered markers
    filteredIssues.forEach((issue) => {
      // Create a marker element
      const markerEl = document.createElement("div");
      markerEl.className = "relative";

      // Create Google Maps-like marker pin
      const pin = document.createElement("div");
      pin.className =
        "w-6 h-6 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-md";

      // Set color based on issue status with Google Maps-like colors
      switch (issue.status) {
        case "open":
          pin.classList.add("bg-red-500"); // Google Maps red
          break;
        case "in_progress":
          pin.classList.add("bg-amber-500"); // Google Maps yellow
          break;
        case "resolved":
          pin.classList.add("bg-green-600"); // Google Maps green
          break;
        default:
          pin.classList.add("bg-blue-500"); // Google Maps blue
      }

      // Add inner dot with pulsing effect for Google Maps feel
      const dot = document.createElement("div");
      dot.className = "w-3 h-3 bg-white rounded-full";
      pin.appendChild(dot);

      markerEl.appendChild(pin);

      // Calculate distance for popup
      const distance = userLocation
        ? distanceFromUser({
            latitude: issue.location.latitude,
            longitude: issue.location.longitude,
          })
        : null;

      // Create and add the marker with Google Maps-like popup
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([issue.location.longitude, issue.location.latitude])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false, // Google Maps popups don't have close buttons
            className: "google-maps-popup", // For custom styling
          }).setHTML(`
              <div class="p-2">
                <h3 class="font-sans text-sm font-medium text-gray-900">${
                  issue.title
                }</h3>
                <p class="text-xs text-gray-600 mt-1">${issue.category.replace(
                  "_",
                  " "
                )}</p>
                ${
                  distance !== null
                    ? `<p class="text-xs text-blue-600 mt-1">${distance.toFixed(
                        1
                      )} km away</p>`
                    : ""
                }
                <div class="mt-2 text-right">
                  <a href="/issue/${
                    issue.id
                  }" class="text-sm font-medium text-blue-600">View details</a>
                </div>
              </div>
            `)
        )
        .addTo(map.current!);

      // Add click handler if onIssueSelect is provided
      if (onIssueSelect) {
        markerEl.addEventListener("click", () => {
          onIssueSelect(issue.id);
        });
      }
    });
  }, [
    issues,
    filteredIssues,
    mapLoaded,
    onIssueSelect,
    userLocation,
    distanceFromUser,
    currentCity,
  ]);

  const handleFilterChange = (filters: {
    category?: IssueCategory;
    status?: IssueStatus;
  }) => {
    setSelectedFilters(filters);
  };

  return (
    <div className={`relative ${height} w-full`}>
      <div ref={mapContainer} className="h-full w-full" />

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="bg-white p-4 rounded shadow-lg text-center max-w-md">
            <p className="text-red-500 mb-2 font-medium">Map Loading Error</p>
            <p className="text-sm text-gray-600 mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Fallback when location is not available */}
      {!userLocation && !isLocationLoading && !locationError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="bg-white p-4 rounded shadow-lg text-center max-w-md">
            <p className="text-blue-500 mb-2 font-medium">
              Getting Your Location
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Please allow location access to see issues near you.
            </p>
            <button
              onClick={() => getLocation()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enable Location
            </button>
          </div>
        </div>
      )}

      {/* Location-based restrictions alert */}
      {userLocation && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Alert className="bg-white/95 backdrop-blur-sm border-blue-200">
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Showing issues within <strong>{radiusKm}km</strong> of your
              location in {currentCity || "your area"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Location error alert */}
      {locationError && (
        <div className="absolute top-20 left-4 right-4 z-10">
          <Alert
            variant="destructive"
            className="bg-orange-50 border-orange-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-orange-800">
              {locationError}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Google Maps-like controls */}
      <div className="absolute top-20 left-4 z-10 flex flex-col gap-2">
        {enableFilters && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="bg-white shadow-md border-0 hover:bg-gray-100"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter Issues
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4">Filter Issues</h3>
                <IssueFilterControl onChange={handleFilterChange} />
              </div>
            </DrawerContent>
          </Drawer>
        )}

        {/* Location Controls */}
        <Button
          variant="outline"
          className="bg-white shadow-md border-0 hover:bg-gray-100"
          onClick={() => setShowLocationControls(!showLocationControls)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Location
        </Button>

        {user && (
          <Link to="/report">
            <Button className="bg-white text-gray-700 hover:bg-gray-100 shadow-md border-0">
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </Link>
        )}

        {/* Google Maps-like layer selector */}
        <Button
          variant="outline"
          className="bg-white shadow-md border-0 hover:bg-gray-100 mt-4"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Location Controls Panel */}
      {showLocationControls && (
        <div className="absolute top-20 right-4 z-10">
          <LocationControls />
        </div>
      )}

      {/* Status indicator - Google Maps style */}
      <div className="absolute bottom-8 left-4 z-10 bg-white rounded-md shadow-md p-3">
        <div className="text-xs font-medium text-gray-500 mb-2">
          Issue Status:
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-700">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="text-xs text-gray-700">Resolved</span>
          </div>
        </div>
      </div>

      {/* Google-style CSS */}
      <style>
        {`
        .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right {
          bottom: 16px;
        }
        .mapboxgl-ctrl-group {
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .mapboxgl-ctrl-group button {
          width: 32px;
          height: 32px;
        }
        .google-maps-popup .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 2px 7px 1px rgba(0,0,0,0.3);
        }
        `}
      </style>
    </div>
  );
};

export default IssueMap;
