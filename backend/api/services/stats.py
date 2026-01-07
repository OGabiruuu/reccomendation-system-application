from models.collection import Collection as CollectionModel
from models.product import Product as ProductModel
from schemas.stats import BasicStats, ProductByCategory

# from services.interaction import create_interaction, get_user_last_session_id
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

async def get_prducts_by_cagetory(db: AsyncSession):
    """Auxiliar que retorna a lista da quantidade de produtos por cada categoria"""

    stmt = (
    select(
        ProductModel.category.label("category"),
        func.count(ProductModel.id).label("product_quantity"),
    )
    .where(ProductModel.category.isnot(None))  # opcional
    .group_by(ProductModel.category)
    .order_by(func.count(ProductModel.id).desc())
    )

    # Retorna uma lista de tuplas (categoria, num_produtos)
    rows = (await db.execute(stmt)).all()

    products_by_category = [
        ProductByCategory(category=cat, product_quantity=qnty) for cat, qnty in rows
    ]

    return products_by_category

async def get_stats(db: AsyncSession):
    """Agrupa e retorna estatísticas dos dados da base"""

    # Obtendo as métricas diretas (número de produtos e coleções)
    products_count = await db.scalar(select(func.count()).select_from(ProductModel))
    if products_count is None:
        products_count = 0

    collections_count = await db.scalar(select(func.count()).select_from(CollectionModel))
    if collections_count is None:
        collections_count = 0

    # Calculando o número total de categorias
    category_count = await db.scalar(select(func.count(func.distinct(ProductModel.category))))
    if category_count is None:
        category_count = 0

    # Obtendo a lista de quantidade de produtos por categoria
    products_by_category = await get_prducts_by_cagetory(db)

    return BasicStats(
        products_count=products_count,
        collections_count=collections_count,
        categories_count=category_count,
        products_by_category=products_by_category
    )
