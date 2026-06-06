import math
from datetime import datetime, timezone
from app.database import get_supabase_admin
from app.utils.exceptions import BadRequestError

# Waypoints y corredores logísticos por país/destino centroamericano
CENTROAMERICA_ROUTES = {
    "Guatemala": [
        {"nombre": "Puerto Quetzal (Origen)", "lat": 13.9298, "lng": -90.7915},
        {"nombre": "Autopista Palín-Escuintla", "lat": 14.3015, "lng": -90.7020},
        {"nombre": "Ciudad de Guatemala (Hub)", "lat": 14.6349, "lng": -90.5069}
    ],
    "El Salvador": [
        {"nombre": "Puerto Quetzal (Origen)", "lat": 13.9298, "lng": -90.7915},
        {"nombre": "Aduana Pedro de Alvarado (GT)", "lat": 13.9854, "lng": -90.1382},
        {"nombre": "Aduana La Hachadura (SV)", "lat": 13.8562, "lng": -90.0934},
        {"nombre": "Sonsonate", "lat": 13.7189, "lng": -89.7242},
        {"nombre": "San Salvador", "lat": 13.6929, "lng": -89.2182}
    ],
    "Honduras": [
        {"nombre": "Ciudad de Guatemala", "lat": 14.6349, "lng": -90.5069},
        {"nombre": "Aduana El Florido / Agua Caliente", "lat": 14.8585, "lng": -89.1524},
        {"nombre": "Santa Rosa de Copán", "lat": 14.7739, "lng": -88.7788},
        {"nombre": "San Pedro Sula / Tegucigalpa", "lat": 14.0723, "lng": -87.1921}
    ],
    "Nicaragua": [
        {"nombre": "San Salvador (Tránsito)", "lat": 13.6929, "lng": -89.2182},
        {"nombre": "Aduana El Amatillo", "lat": 13.5976, "lng": -87.7289},
        {"nombre": "Aduana Guasaule (HN/NI)", "lat": 13.0841, "lng": -86.9537},
        {"nombre": "Chinandega / León", "lat": 12.4379, "lng": -86.8780},
        {"nombre": "Managua", "lat": 12.1149, "lng": -86.2362}
    ],
    "Costa Rica": [
        {"nombre": "Managua (Tránsito)", "lat": 12.1149, "lng": -86.2362},
        {"nombre": "Rivas", "lat": 11.4372, "lng": -85.8263},
        {"nombre": "Aduana Peñas Blancas", "lat": 11.2181, "lng": -85.6125},
        {"nombre": "Liberia", "lat": 10.6350, "lng": -85.4377},
        {"nombre": "San José", "lat": 9.9281, "lng": -84.0907}
    ],
    "Panamá": [
        {"nombre": "San José (Tránsito)", "lat": 9.9281, "lng": -84.0907},
        {"nombre": "Paso Canoas (Frontera CR/PA)", "lat": 8.5333, "lng": -82.8390},
        {"nombre": "David (Chiriquí)", "lat": 8.4274, "lng": -82.4309},
        {"nombre": "Santiago de Veraguas", "lat": 8.1009, "lng": -80.9715},
        {"nombre": "Ciudad de Panamá", "lat": 8.9824, "lng": -79.5199}
    ]
}

def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calcula la distancia geodésica en kilómetros entre dos coordenadas GPS."""
    R = 6371.0 # Radio medio de la Tierra en km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def distance_point_to_segment_km(px, py, x1, y1, x2, y2):
    """Calcula la distancia mínima en km de un punto P a un segmento de recta (A, B)."""
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return haversine_distance_km(px, py, x1, y1)
    
    t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    closest_x = x1 + t * dx
    closest_y = y1 + t * dy
    return haversine_distance_km(px, py, closest_x, closest_y)

class RouteAlertService:
    @staticmethod
    def get_planned_route(tienda_pais: str, tienda_lat: float, tienda_lng: float):
        """Genera los waypoints y polilínea de la ruta recomendada para el país destino."""
        base_points = list(CENTROAMERICA_ROUTES.get(tienda_pais, CENTROAMERICA_ROUTES["Guatemala"]))
        
        # Puntos a retornar
        waypoints = []
        for p in base_points:
            waypoints.append([p["lat"], p["lng"]])
            
        # Añadir la tienda final
        if tienda_lat and tienda_lng:
            waypoints.append([float(tienda_lat), float(tienda_lng)])
            
        return {
            "pais": tienda_pais,
            "waypoints": waypoints,
            "paradas": base_points
        }

    @staticmethod
    def evaluate_route_deviation(current_lat: float, current_lng: float, planned_waypoints: list):
        """Determina la distancia mínima en km a la ruta planificada."""
        if not planned_waypoints or len(planned_waypoints) < 2:
            return 0.0
            
        min_dist = float('inf')
        for i in range(len(planned_waypoints) - 1):
            p1 = planned_waypoints[i]
            p2 = planned_waypoints[i+1]
            dist = distance_point_to_segment_km(current_lat, current_lng, p1[0], p1[1], p2[0], p2[1])
            if dist < min_dist:
                min_dist = dist
                
        return round(min_dist, 2)

    @staticmethod
    def evaluate_proximity_hours(current_lat: float, current_lng: float, dest_lat: float, dest_lng: float, speed_kmh: float = 60.0):
        """Calcula las horas estimadas de llegada basadas en distancia restante."""
        dist_km = haversine_distance_km(current_lat, current_lng, dest_lat, dest_lng)
        speed = max(speed_kmh, 30.0) # Mínimo 30 km/h para evitar división por cero
        horas = dist_km / speed
        return round(horas, 2), round(dist_km, 2)
