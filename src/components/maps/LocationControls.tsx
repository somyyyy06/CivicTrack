import React from "react";
import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LocationControls: React.FC = () => {
  const {
    userLocation,
    isLocationLoading,
    locationError,
    radiusKm,
    setRadiusKm,
    getLocation,
    currentCity,
  } = useLocation();

  const handleRefreshLocation = () => {
    getLocation();
  };

  const getLocationStatus = () => {
    if (isLocationLoading) {
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        text: "Getting location...",
        color: "text-blue-600",
      };
    }

    if (locationError) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Location error",
        color: "text-orange-600",
      };
    }

    if (userLocation) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Location active",
        color: "text-green-600",
      };
    }

    return {
      icon: <AlertCircle className="h-4 w-4" />,
      text: "No location",
      color: "text-red-600",
    };
  };

  const status = getLocationStatus();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`text-sm ${status.color}`}>{status.text}</span>
          </div>
        </div>

        {/* Current Location Display */}
        {userLocation && (
          <div className="text-sm">
            <span className="font-medium">Current Location:</span>
            <div className="text-gray-600 mt-1">
              <div>Lat: {userLocation.latitude.toFixed(4)}</div>
              <div>Lng: {userLocation.longitude.toFixed(4)}</div>
            </div>
          </div>
        )}

        {/* Current City Display */}
        {currentCity && (
          <div className="text-sm">
            <span className="font-medium">City:</span>
            <div className="text-gray-600 mt-1">{currentCity}</div>
          </div>
        )}

        {/* Radius Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Radius:</label>
          <Select
            value={radiusKm.toString()}
            onValueChange={(value) => setRadiusKm(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 km</SelectItem>
              <SelectItem value="3">3 km</SelectItem>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Error Display */}
        {locationError && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            {locationError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleRefreshLocation}
            disabled={isLocationLoading}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isLocationLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        {/* Location Badge */}
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            📍 {currentCity || "India"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationControls;
