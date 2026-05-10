import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet-routing-machine';

export default function RoutingControl({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Create the routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      // Hides the text itinerary panel
      createMarker: () => null,
      show: false
    }).addTo(map);

    // Ensure itinerary panel is hidden using DOM since show: false doesn't always completely remove the container
    const routingContainer = document.querySelector('.leaflet-routing-container');
    if (routingContainer) {
      routingContainer.style.display = 'none';
    }

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end]);

  return null;
}
