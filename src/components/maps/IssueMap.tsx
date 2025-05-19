
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useIssues, IssueCategory, IssueStatus } from '@/contexts/IssueContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Filter, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import IssueFilterControl from './IssueFilterControl';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

// Mapbox requires a token
// For demo purposes, using a temporary token that would need to be replaced
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNscHc5cGh5bzAzOG0ya3FrYW43OTF6MnMifQ.SyqsT74mxBGDCzM1Nno03g';

interface IssueMapProps {
  onIssueSelect?: (issueId: string) => void;
  height?: string;
  enableFilters?: boolean;
}

const IssueMap: React.FC<IssueMapProps> = ({ 
  onIssueSelect, 
  height = 'h-[calc(100vh-64px)]',
  enableFilters = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { issues } = useIssues();
  const { user } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState<{
    category?: IssueCategory;
    status?: IssueStatus;
  }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter issues based on the selected filters
  const filteredIssues = issues.filter((issue) => {
    if (selectedFilters.category && issue.category !== selectedFilters.category) {
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
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        // Using a more Google Maps-like style
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.0060, 40.7128], // New York City coordinates
        zoom: 12,
        attributionControl: false, // Hide default attribution for cleaner look
        pitchWithRotate: false, // Disable pitch with rotate for Google Maps feel
        dragRotate: false, // Disable rotation for Google Maps feel
      });

      // Add navigation controls (zoom only for Google Maps-like feel)
      const navControl = new mapboxgl.NavigationControl({ showCompass: false });
      map.current.addControl(navControl, 'bottom-right');

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.current.addControl(geolocate, 'bottom-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add custom Google Maps-like styling
        if (map.current) {
          // Add attribution in Google Maps style
          const attribution = document.createElement('div');
          attribution.className = 'absolute bottom-0 right-0 bg-white px-2 py-1 text-xs text-gray-600 z-10';
          attribution.textContent = '© Mapbox © OpenStreetMap';
          mapContainer.current?.appendChild(attribution);
        }
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

  // Add markers when issues or filters change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add filtered markers
    filteredIssues.forEach((issue) => {
      // Create a marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'relative';

      // Create Google Maps-like marker pin
      const pin = document.createElement('div');
      pin.className = 'w-6 h-6 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-md';
      
      // Set color based on issue status with Google Maps-like colors
      switch (issue.status) {
        case 'open':
          pin.classList.add('bg-red-500'); // Google Maps red
          break;
        case 'in_progress':
          pin.classList.add('bg-amber-500'); // Google Maps yellow
          break;
        case 'resolved':
          pin.classList.add('bg-green-600'); // Google Maps green
          break;
        default:
          pin.classList.add('bg-blue-500'); // Google Maps blue
      }

      // Add inner dot with pulsing effect for Google Maps feel
      const dot = document.createElement('div');
      dot.className = 'w-3 h-3 bg-white rounded-full';
      pin.appendChild(dot);
      
      markerEl.appendChild(pin);

      // Create and add the marker with Google Maps-like popup
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([issue.location.longitude, issue.location.latitude])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            closeButton: false, // Google Maps popups don't have close buttons
            className: 'google-maps-popup' // For custom styling
          })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-sans text-sm font-medium text-gray-900">${issue.title}</h3>
                <p class="text-xs text-gray-600 mt-1">${issue.category.replace('_', ' ')}</p>
                <div class="mt-2 text-right">
                  <a href="/issue/${issue.id}" class="text-sm font-medium text-blue-600">View details</a>
                </div>
              </div>
            `)
        )
        .addTo(map.current!);

      // Add click handler if onIssueSelect is provided
      if (onIssueSelect) {
        markerEl.addEventListener('click', () => {
          onIssueSelect(issue.id);
        });
      }
    });
  }, [issues, filteredIssues, mapLoaded, onIssueSelect]);

  const handleFilterChange = (filters: { category?: IssueCategory; status?: IssueStatus }) => {
    setSelectedFilters(filters);
  };

  return (
    <div className={`relative ${height} w-full`}>
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Google Maps-like controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {enableFilters && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="bg-white shadow-md border-0 hover:bg-gray-100">
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
        
        {user && (
          <Link to="/report">
            <Button className="bg-white text-gray-700 hover:bg-gray-100 shadow-md border-0">
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </Link>
        )}

        {/* Google Maps-like layer selector */}
        <Button variant="outline" className="bg-white shadow-md border-0 hover:bg-gray-100 mt-4">
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Status indicator - Google Maps style */}
      <div className="absolute bottom-8 left-4 z-10 bg-white rounded-md shadow-md p-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Issue Status:</div>
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

      {/* Add Google-style CSS */}
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
