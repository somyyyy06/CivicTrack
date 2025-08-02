import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Set the mapbox token directly
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGl2eWFuc2g0IiwiYSI6ImNscHY3OGI5MDAxYm4ya3MyeGsxOHNwYmQifQ.JT-wu0fKnBdwtfbO0xt-PA";

interface IssueFormProps {
  issueId?: string;
  onSubmitSuccess?: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ issueId, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("roads");
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    address: "",
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

      alert(`Successfully uploaded ${files.length} image(s)!`);
    } catch (error) {
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
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
        center: [77.209, 28.6139], // Delhi coordinates
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

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
          address: "",
        };
        setLocation(newLocation);

        // Clear existing markers
        const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
        existingMarkers.forEach((marker) => marker.remove());

        // Add a marker to the map at the clicked location
        new mapboxgl.Marker()
          .setLngLat([newLocation.longitude, newLocation.latitude])
          .addTo(map.current!);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  async function onSubmitHandler(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const issueData = {
        title,
        description,
        category,
        status: "open",
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || "No address provided",
        },
        images: uploadedImages,
        reporter: {
          id: "user",
          name: isAnonymous ? "Anonymous" : "User",
          isAnonymous,
        },
        priority: "medium",
      };

      const response = await fetch("http://localhost:3000/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit issue");
      }

      alert("Issue reported successfully!");

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error submitting issue:", error);
      alert("Failed to report the issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {issueId ? "Edit Issue" : "Report an Issue"}
        </h2>
        <p className="text-gray-600 mt-2">
          Fill out the form below to report a community issue that needs
          attention.
        </p>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A brief title for the issue"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={3}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
            minLength={10}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="roads">Roads</option>
            <option value="lighting">Lighting</option>
            <option value="water">Water</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="public_safety">Public Safety</option>
            <option value="obstructions">Obstructions</option>
          </select>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Images (Max 5 images, 5MB each)
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-2">📤</div>
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
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
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
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">Uploading...</span>
            </div>
          )}
        </div>

        {/* Location Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Latitude
              </label>
              <input
                type="number"
                value={location.latitude}
                onChange={(e) =>
                  setLocation((prev) => ({
                    ...prev,
                    latitude: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Latitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Longitude
              </label>
              <input
                type="number"
                value={location.longitude}
                onChange={(e) =>
                  setLocation((prev) => ({
                    ...prev,
                    longitude: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Longitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Location on Map
          </label>
          <div
            ref={mapContainer}
            className="h-64 rounded border border-gray-300"
          />
        </div>

        {/* Anonymous Report */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Anonymous Report
            </label>
            <p className="text-xs text-gray-500">
              Do you want this report to be anonymous?
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default IssueForm;
