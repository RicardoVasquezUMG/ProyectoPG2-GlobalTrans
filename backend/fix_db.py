import asyncio
from app.database import get_supabase_admin
from datetime import datetime, timedelta

async def main():
    sb = get_supabase_admin()
    resp = sb.table('viajes').select('*').eq('estado', 'entregado').is_('fecha_esperada_llegada', 'null').execute()
    for row in resp.data:
        try:
            real_arrival = datetime.fromisoformat(row['fecha_llegada_real'].replace('Z', '+00:00'))
            new_eta = real_arrival + timedelta(hours=2)
            sb.table('viajes').update({'fecha_esperada_llegada': new_eta.isoformat()}).eq('id', row['id']).execute()
            print(f"Updated {row['id']} ETA to {new_eta.isoformat()}")
        except Exception as e:
            print(f"Error on {row['id']}: {e}")

asyncio.run(main())
