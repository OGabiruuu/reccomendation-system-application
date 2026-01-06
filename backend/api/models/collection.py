from core.bdConnection import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    quantity = Column(Integer, nullable=False, default=0, server_default="0")

    products = relationship(
        "Product",
        back_populates="collection",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
