from contextlib import asynccontextmanager
from sys import prefix

from core.bdConnection import Base, engine
from decouple import config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Importando os routers
from routers.auth import router as auth_router
from routers.collection import router as collection_router
from routers.interaction import router as interaction_router
from routers.product import router as product_router
from routers.user import router as user_router
from routers.recommendation import router as recommendation_router
from routers.stats import router as stats_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executado no startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("== BD INICIALIZADA ==")

    # Entregando o controle para a aplicação
    yield

    # Executado no shutdown
    await engine.dispose()
    print("== BD DESCONECTADA ==")


# Instanciando a API
app = FastAPI(title="Arte em Laço's recommender Web API", version="1.0.0", lifespan=lifespan)

# Configuração de CORS para permitir o frontend (ajuste via env se precisar)
# Permite múltiplas origens separadas por vírgula. Se usar "*", desativa credenciais.
frontend_origin = config("FRONTEND_ORIGIN", default="http://localhost:5173")
origins = [o.strip() for o in frontend_origin.split(",") if o.strip()]
origin_regex = None
allow_credentials = True
if "*" in origins:
    # Starlette não permite allow_credentials=True com "*"; usamos regex e desativamos credenciais
    origins = []
    origin_regex = ".*"
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=origin_regex,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas da API
app.include_router(user_router, prefix="/users", tags=["User"])
app.include_router(product_router, prefix="/products", tags=["Product"])
app.include_router(collection_router, prefix="/collections", tags=["Collection"])
app.include_router(interaction_router, prefix="/interactions", tags=["Interaction"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(recommendation_router, prefix="/recommendations", tags=["Recommendation"])
app.include_router(stats_router, prefix="/stats", tags=["Statistics"])
