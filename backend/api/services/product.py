from fastapi import UploadFile
from models.product import Product as ProductModel
from schemas.product import ProductCreate, ProductUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os


async def create_product(db: AsyncSession, data: ProductCreate):
    """Controller da rota que regitra um novo produto na base de dados"""

    product = ProductModel(**data.model_dump())
    db.add(product)

    await db.commit()
    await db.refresh(product)
    return product


async def list_all_products(db: AsyncSession):
    """Controller da rota que retorna todos os produtos da base de dados"""

    product_list = await db.execute(select(ProductModel))
    return product_list.scalars().all()


async def get_product_by_id(db: AsyncSession, id: int):
    """Controller da rota que retorna um produto especifico da base de dados"""

    result = await db.execute(select(ProductModel).where(ProductModel.id == id))
    return result.scalar_one_or_none()


async def delete_product(db: AsyncSession, id: int):
    """Controller da rota que deleta um prodto da base de dados"""
    product = await get_product_by_id(db, id)

    if not product:
        return None

    await db.delete(product)
    await db.commit()

    return product


async def update_product(db: AsyncSession, id: int, data: ProductUpdate):
    """Atualiza campos de um produto"""
    product = await get_product_by_id(db, id)
    if not product:
        return None

    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(product, key, value)

    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

async def upload_image(db: AsyncSession, id: int, file: UploadFile):
    """Cria e atualiza imagens em um diretório específico do sistema de arquivos"""

    # Criando a rota base para a URL
    if file.filename:
        file_ext = file.filename.split('.')[-1]
    else:
        file_ext = ".img"

    file_path = f"./uploads/{id}.{file_ext}"
    file_url = f"http://localhost:3000/images/{id}.{file_ext}"


    # Atualizando o produto existente
    product = await get_product_by_id(db, id)
    if not product:
        return None

    # Atualizando no banco
    product.image = file_url
    await db.commit()
    await db.refresh(product)

    # Escrevendo a imagem no sistema de arquvos
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    return product



    return {
        "name": file.filename,
        "content_type": file.content_type,
        "path": file_path
    }
