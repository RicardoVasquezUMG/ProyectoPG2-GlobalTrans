import asyncio
import sys
import os

# Agregamos la ruta del proyecto
sys.path.append("c:\\Users\\RicardoV\\Downloads\\ProyectoPG2\\backend")

from app.services.viaje_service import ViajeService

async def run():
    try:
        data = await ViajeService.get_all()
        print("Success:", data)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(run())
