from core.bdConnection import get_db
from fastapi import APIRouter, Depends
from schemas.stats import BasicStats
from services.stats import get_stats
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("", response_model=BasicStats)
async def stats(db: AsyncSession = Depends(get_db)):
    return await get_stats(db)
