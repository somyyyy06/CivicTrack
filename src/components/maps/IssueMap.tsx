
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useIssues, IssueCategory, IssueStatus } from '@/contexts/IssueContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
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

      // Create marker pin with status color
      const pin = document.createElement('div');
      pin.className = 'w-6 h-6 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2';
      
      // Set color based on issue status
      switch (issue.status) {
        case 'open':
          pin.classList.add('bg-civic-red');
          break;
        case 'in_progress':
          pin.classList.add('bg-civic-yellow');
          break;
        case 'resolved':
          pin.classList.add('bg-civic-green');
          break;
        default:
          pin.classList.add('bg-civic-blue');
      }

      // Add inner dot
      const dot = document.createElement('div');
      dot.className = 'w-3 h-3 bg-white rounded-full';
      pin.appendChild(dot);
      
      markerEl.appendChild(pin);

      // Create and add the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([issue.location.longitude, issue.location.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h3 class="font-semibold">${issue.title}</h3>
                <p class="text-sm text-gray-600">${issue.category.replace('_', ' ')}</p>
                <div class="mt-2">
                  <a href="/issue/${issue.id}" class="text-primary text-sm font-medium">View details</a>
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
      
      {/* Fixed buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {enableFilters && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="bg-white dark:bg-gray-800">
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
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </Link>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-8 right-8 z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status:</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-civic-red"></div>
            <span className="text-xs">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-civic-yellow"></div>
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-civic-green"></div>
            <span className="text-xs">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueMap;
