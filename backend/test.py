import asyncio
from app.database import get_supabase_admin

async def main():
    sb = get_supabase_admin()
    resp = sb.table('viajes').select('id,estado,fecha_esperada_llegada,fecha_llegada_real').execute()
    for row in resp.data:
        print(row)

asyncio.run(main())
