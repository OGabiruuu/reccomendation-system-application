from core.bdConnection import get_db
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from schemas.product import Product, ProductCreate, ProductUpdate
from services.product import (
    create_product,
    delete_product,
    get_product_by_id,
    list_all_products,
    update_product,
    upload_image
)
from sqlalchemy.ext.asyncio import AsyncSession

# Criando um router para User
router = APIRouter()


@router.post("", response_model=Product)
async def create(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    product = await create_product(db, product)
    return product


@router.get("", response_model=list[Product])
async def read_all(db: AsyncSession = Depends(get_db)):
    products = await list_all_products(db)
    return products


@router.get("/{product_id}", response_model=Product)
async def read(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await get_product_by_id(db, product_id)

    if not product:
        raise HTTPException(404, "prodcuct not found")
    return product


@router.put("/{product_id}", response_model=Product)
@router.patch("/{product_id}", response_model=Product)
async def update(
    product_id: int, payload: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    updated = await update_product(db, product_id, payload)
    if not updated:
        raise HTTPException(404, "product not found")
    return updated


@router.patch("/{product_id}/image", response_model=Product)
async def update_image(product_id: int, file: UploadFile, db: AsyncSession = Depends(get_db)):
    updated = await upload_image(db, product_id, file)

    if not updated:
        raise HTTPException(404, "Product not found")
    return updated

@router.delete("/{product_id}")
async def remove(product_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_product(db, product_id)

    if not deleted:
        raise HTTPException(404, "product not foind")
