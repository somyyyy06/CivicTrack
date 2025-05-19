
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { IssueCategory, IssueStatus } from '@/contexts/IssueContext';
import { useIssues } from '@/contexts/IssueContext';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Fix the mapboxgl import issue
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';

// Set the mapbox token directly
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNscHc5cGh5bzAzOG0ya3FrYW43OTF6MnMifQ.SyqsT74mxBGDCzM1Nno03g';

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.enum(['road_damage', 'sanitation', 'lighting', 'graffiti', 'sidewalk', 'vegetation', 'other']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  photos: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
});

interface IssueFormProps {
  issueId?: string;
  defaultValues?: z.infer<typeof formSchema>;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  onSubmitSuccess?: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ issueId, defaultValues, onSubmit, onSubmitSuccess }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addIssue, updateIssue, getIssue } = useIssues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      category: 'road_damage',
      location: {
        latitude: 0,
        longitude: 0,
      },
      isPublic: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.0060, 40.7128], // New York City coordinates
        zoom: 12,
      });

      // Add navigation controls (zoom and rotation)
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('click', (e) => {
        const newLocation = {
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        };
        setLocation(newLocation);
        form.setValue('location.latitude', newLocation.latitude);
        form.setValue('location.longitude', newLocation.longitude);

        // Clear existing markers
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
        existingMarkers.forEach(marker => marker.remove());

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
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Fly to the location and add a marker
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
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
        throw new Error('User must be logged in to submit an issue.');
      }

      const issueData = {
        ...values,
        reporterId: user.id,
        reporterName: user.name || 'Anonymous',
        status: 'open' as IssueStatus, // Adding the required status field
        location: {
          latitude: values.location.latitude,
          longitude: values.location.longitude,
          address: values.location.address || 'No address provided',
        },
      };

      if (issueId) {
        // Update existing issue
        await updateIssue(issueId, issueData);
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
        navigate('/');
      }
    } catch (error: any) {
      console.error("Error submitting issue:", error);
      toast({
        variant: "destructive",
        title: "Error Reporting Issue",
        description: error.message || "Failed to report the issue. Please try again.",
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
          <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="A brief title for the issue" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          value={location?.latitude !== undefined ? location.latitude.toString() : ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setLocation(prev => ({ ...prev, latitude: value }));
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
                          value={location?.longitude !== undefined ? location.longitude.toString() : ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setLocation(prev => ({ ...prev, longitude: value }));
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
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Report</FormLabel>
                    <FormDescription>
                      Do you want this report to be public?
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default IssueForm;
