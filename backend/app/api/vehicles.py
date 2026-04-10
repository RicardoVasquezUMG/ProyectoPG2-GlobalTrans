from fastapi import APIRouter, status
from app.models.vehicle import VehicleCreate, VehicleRead, VehicleUpdate
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

@router.get("/", response_model=list[VehicleRead])
async def list_vehicles():
    """Lista todos los vehículos."""
    return await VehicleService.get_all()

@router.post("/", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
async def create_vehicle(data: VehicleCreate):
    """Crea un nuevo vehículo."""
    return await VehicleService.create(data)

@router.put("/{vehicle_id}", response_model=VehicleRead)
async def update_vehicle(vehicle_id: str, data: VehicleUpdate):
    """Actualiza los datos de un vehículo existente."""
    return await VehicleService.update(vehicle_id, data)

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(vehicle_id: str):
    """Elimina un vehículo."""
    await VehicleService.delete(vehicle_id)
