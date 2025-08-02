import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IssueCategory, IssueStatus } from "@/contexts/IssueContext";
import { useIssues } from "@/contexts/IssueContext";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon } from "lucide-react";

// Fix the mapboxgl import issue
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

// Set the mapbox token directly
mapboxgl.accessToken =
  "pk.eyJ1IjoiZGl2eWFuc2g0IiwiYSI6ImNscHY3OGI5MDAxYm4ya3MyeGsxOHNwYmQifQ.JT-wu0fKnBdwtfbO0xt-PA";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.enum([
    "roads",
    "lighting",
    "water",
    "cleanliness",
    "public_safety",
    "obstructions",
  ]),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  images: z.array(z.string()).optional(),
  isAnonymous: z.boolean().default(false),
});

interface IssueFormProps {
  issueId?: string;
  defaultValues?: z.infer<typeof formSchema>;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  onSubmitSuccess?: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({
  issueId,
  defaultValues,
  onSubmit,
  onSubmitSuccess,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addIssue } = useIssues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      category: "roads",
      location: {
        latitude: 0,
        longitude: 0,
        address: "",
      },
      isAnonymous: false,
    },
    mode: "onChange",
  });

  // File upload handler
  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const newImageUrls = data.files.map((file: any) => file.url);
      setUploadedImages((prev) => [...prev, ...newImageUrls]);
      form.setValue("images", [...uploadedImages, ...newImageUrls]);

      toast({
        title: "Images uploaded successfully!",
        description: `${files.length} image(s) uploaded.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    form.setValue("images", newImages);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-74.006, 40.7128], // New York City coordinates
        zoom: 12,
      });

      // Add navigation controls (zoom and rotation)
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right"
      );

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("click", (e) => {
        const newLocation = {
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        };
        setLocation(newLocation);
        form.setValue("location.latitude", newLocation.latitude);
        form.setValue("location.longitude", newLocation.longitude);

        // Clear existing markers
        const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
        existingMarkers.forEach((marker) => marker.remove());

        // Add a marker to the map at the clicked location
        new mapboxgl.Marker()
          .setLngLat([newLocation.longitude, newLocation.latitude])
          .addTo(map.current!);
      });
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (defaultValues && map.current && mapLoaded) {
      const { latitude, longitude } = defaultValues.location;
      setLocation({ latitude, longitude });

      // Clear existing markers
      const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
      existingMarkers.forEach((marker) => marker.remove());

      // Fly to the location and add a marker
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });

      new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map.current!);
    }
  }, [defaultValues, mapLoaded]);

  async function onSubmitHandler(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error("User must be logged in to submit an issue.");
      }

      // Ensure all required fields are present for addIssue
      const issueData = {
        title: values.title,
        description: values.description,
        category: values.category,
        status: "open" as const,
        location: {
          latitude: values.location.latitude,
          longitude: values.location.longitude,
          address: values.location.address || "No address provided",
        },
        images: uploadedImages,
        reporter: {
          id: user?.id || "anonymous",
          name: values.isAnonymous ? "Anonymous" : user?.name || "Unknown User",
          isAnonymous: values.isAnonymous,
        },
        priority: "medium" as const,
      };

      if (issueId) {
        // Update existing issue
        // await updateIssue(issueId, issueData); // This line was removed as per the edit hint
        toast({
          title: "Issue Updated",
          description: "Your issue has been updated successfully.",
        });
      } else {
        // Create new issue
        await addIssue(issueData);
        toast({
          title: "Issue Reported",
          description: "Your issue has been reported successfully.",
        });
      }

      if (onSubmit) {
        onSubmit(values);
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error submitting issue:", error);
      toast({
        variant: "destructive",
        title: "Error Reporting Issue",
        description:
          error.message || "Failed to report the issue. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{issueId ? "Edit Issue" : "Report an Issue"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A brief title for the issue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="roads">Roads</SelectItem>
                      <SelectItem value="lighting">Lighting</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="public_safety">
                        Public Safety
                      </SelectItem>
                      <SelectItem value="obstructions">Obstructions</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Upload Images (Max 5 images, 5MB each)</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-primary/5"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Drag and drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports: JPG, PNG, GIF (Max 5MB per file)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleFileUpload(e.target.files)
                }
              />

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploading && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Uploading...
                  </span>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div>
              <Label>Location</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Latitude"
                          type="number"
                          {...field}
                          value={
                            location?.latitude !== undefined
                              ? location.latitude.toString()
                              : ""
                          }
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setLocation((prev) => ({
                              ...prev,
                              latitude: value,
                            }));
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Longitude"
                          type="number"
                          {...field}
                          value={
                            location?.longitude !== undefined
                              ? location.longitude.toString()
                              : ""
                          }
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setLocation((prev) => ({
                              ...prev,
                              longitude: value,
                            }));
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Map Preview */}
            <div className="w-full">
              <Label>Select Location on Map</Label>
              <div ref={mapContainer} className="h-64 rounded" />
            </div>

            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Anonymous Report
                    </FormLabel>
                    <FormDescription>
                      Do you want this report to be anonymous?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default IssueForm;
