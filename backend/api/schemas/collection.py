from typing import List, Optional

from pydantic import BaseModel, Field


# Classe base para definir o tipo User em memória
class CollectionBase(BaseModel):
    name: str
    quantity: int | None = 0  # Número de itens em uma coleção (default 0)


class CollectionCreate(CollectionBase):
    """Apenas usado para aciraçao com POST, nao possuindo o campo id"""

    pass


class CollectionUpdate(BaseModel):
    """Campos opcionais para atualização parcial"""

    name: Optional[str] = None
    quantity: Optional[int] = None


class Collection(CollectionBase):
    """Classe do tipo Coleçao para ser conectar com as models do ORM"""

    id: int

    class Config:
        from_attributes = True
