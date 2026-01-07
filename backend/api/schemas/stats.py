from typing import List

from pydantic import BaseModel


class ProductByCategory(BaseModel):
    """Tipo auxiliar, explicitando quantos produtos há para uma categoria"""

    category: str
    product_quantity: int


class BasicStats(BaseModel):
    """Classe com os dados estatísticos da base de dados mostrados no dashboard"""

    products_count: int
    collections_count: int
    categories_count: int
    products_by_category: List[ProductByCategory]
