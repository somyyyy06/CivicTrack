
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIssues, IssueCategory } from "@/contexts/IssueContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Camera, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface IssueFormProps {
  onSubmitSuccess?: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const { addIssue } = useIssues();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("road_damage");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to report an issue.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
    }
  }, [user, navigate, toast]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get address using reverse geocoding
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || "Unknown location";
          
          setLocation({
            latitude,
            longitude,
            address,
          });
        } catch (error) {
          // If geocoding fails, just use coordinates
          setLocation({
            latitude,
            longitude,
          });
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle file input change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files);
    
    // Create object URLs for preview
    const newPhotoUrls = newFiles.map(file => URL.createObjectURL(file));
    
    // In a real app, we would upload the images to a server
    // For this demo, we'll just store the URLs
    setPhotoUrls(prevUrls => [...prevUrls, ...newPhotoUrls]);
    
    // For demo purposes, using placeholders
    const placeholders = [
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800", // pothole
      "https://images.unsplash.com/photo-1605600659453-128bfdb0912a?w=800", // trash
      "https://images.unsplash.com/photo-1589463349208-93b2dd8af50a?w=800"  // broken light
    ];
    
    setPhotos(prevPhotos => [
      ...prevPhotos,
      ...newFiles.map((_, i) => placeholders[i % placeholders.length])
    ]);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to report an issue.",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Please provide a location for the issue.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // In a real app, this would send the data to a server
      addIssue({
        title,
        description,
        category,
        status: "open",
        location,
        photos,
        reporterId: user.id,
        reporterName: user.name,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("road_damage");
      setPhotos([]);
      setPhotoUrls([]);
      setLocation(null);

      // Navigate or callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit the issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief title for the issue"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details about the issue"
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category
        </label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as IssueCategory)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="road_damage">Road Damage</SelectItem>
            <SelectItem value="sanitation">Sanitation</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="graffiti">Graffiti</SelectItem>
            <SelectItem value="sidewalk">Sidewalk</SelectItem>
            <SelectItem value="vegetation">Vegetation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex-1"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {isGettingLocation
              ? "Getting location..."
              : location
              ? "Update Location"
              : "Get Current Location"}
          </Button>
        </div>
        {location && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {location.address ? (
              <p>{location.address}</p>
            ) : (
              <p>
                Latitude: {location.latitude.toFixed(6)}, Longitude:{" "}
                {location.longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="photos"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Photos
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {photoUrls.map((url, index) => (
            <Card
              key={index}
              className="w-24 h-24 overflow-hidden relative flex items-center justify-center"
            >
              <img
                src={url}
                alt={`Photo preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </Card>
          ))}
          <label
            htmlFor="photo-upload"
            className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-primary transition-colors"
          >
            <Camera className="h-8 w-8 text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">Add Photo</span>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              multiple
            />
          </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !location}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
};

export default IssueForm;
