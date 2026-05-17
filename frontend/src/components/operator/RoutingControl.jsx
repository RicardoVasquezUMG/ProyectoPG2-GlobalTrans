import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet-routing-machine';

export default function RoutingControl({ start, end, showItinerary = false }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  // 1. Initial creation and destruction of the routing control
  useEffect(() => {
    if (!map) return;

    routingControlRef.current = L.Routing.control({
      waypoints: [],
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false, 
      showAlternatives: false,
      createMarker: () => null,
      show: true 
    }).addTo(map);

    return () => {
      if (map && routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map]);

  // 2. Update waypoints whenever start or end changes
  useEffect(() => {
    if (routingControlRef.current && start && end) {
      routingControlRef.current.setWaypoints([
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ]);
    }
  }, [start, end]);

  // 3. Update itinerary visibility
  useEffect(() => {
    // Timeout to ensure DOM element is created by leaflet
    const timer = setTimeout(() => {
      const routingContainer = document.querySelector('.leaflet-routing-container');
      if (routingContainer) {
        routingContainer.style.display = showItinerary ? 'block' : 'none';
        if (showItinerary) {
          routingContainer.style.position = 'absolute';
          routingContainer.style.right = '10px';
          routingContainer.style.top = '10px';
          routingContainer.style.zIndex = '1000';
          routingContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          routingContainer.style.color = 'white';
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [showItinerary, start]); // Re-run when start changes in case the container gets recreated

  return null;
}

