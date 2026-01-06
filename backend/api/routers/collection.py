from core.bdConnection import get_db
from fastapi import APIRouter, Depends, HTTPException
from schemas.collection import Collection, CollectionCreate, CollectionUpdate
from schemas.product import Product
from services.collection import (
    create_collection,
    delete_collection,
    get_collection_by_id,
    get_collection_products,
    list_all_collections,
    update_collection,
)
from sqlalchemy.ext.asyncio import AsyncSession

# Criando um router para collection
router = APIRouter()


@router.post("", response_model=Collection)
async def create(collection: CollectionCreate, db: AsyncSession = Depends(get_db)):
    product = await create_collection(db, collection)
    return product


@router.get("", response_model=list[Collection])
async def read_all(db: AsyncSession = Depends(get_db)):
    collections = await list_all_collections(db)
    return collections


@router.get("/{collection_id}", response_model=Collection)
async def read(collection_id: int, db: AsyncSession = Depends(get_db)):
    collection = await get_collection_by_id(db, collection_id)

    if not collection:
        raise HTTPException(404, "prodcuct not found")
    return collection


@router.get("/{collection_id}/products", response_model=list[Product])
async def read_collections(collection_id: int, db: AsyncSession = Depends(get_db)):
    products = await get_collection_products(db, collection_id)

    if not products:
        raise HTTPException(404, "product not found")
    return products


@router.patch("/{collection_id}", response_model=Collection)
async def update(
    collection_id: int, payload: CollectionUpdate, db: AsyncSession = Depends(get_db)
):
    updated = await update_collection(db, collection_id, payload)
    if not updated:
        raise HTTPException(404, "Collection not found")
    return updated


@router.delete("/{collection_id}")
async def remove(collection_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_collection(db, collection_id)

    if not deleted:
        raise HTTPException(404, "collection not found")
