from core.bdConnection import Base
from sqlalchemy import JSON, Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    color = Column(JSON, nullable=False, default=list)
    category = Column(String, nullable=False)
    size = Column(String, nullable=False)
    description = Column(String, nullable=False)
    image = Column(String, nullable=False)
    model = Column(String, nullable=False)
    disponible = Column(Boolean, nullable=False, default=True)

    # For the 1-to-many realtionship with Collection
    collection_id = Column(
        Integer, ForeignKey("collections.id", ondelete="CASCADE"), nullable=False
    )

    # Garante a exclusão dos produtos após deletar uma collection
    collection = relationship("Collection", back_populates="products")

    # For the many-to-many relationship with interaction
    interactions = relationship(
        "Interaction", back_populates="product", cascade="all, delete"
    )
