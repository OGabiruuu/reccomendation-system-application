# Quickstart

Passo a passo simples para levantar backend e frontend.

## Requisitos
- Docker + Docker Compose
- Node 18+ (frontend)
- Python 3.13 e `python3 -m venv` (backend)

## Backend
1. Entre na pasta `backend`.
2. Crie o `.env` (ou use o já incluído) com as variáveis de banco; por padrão usamos `localhost:5435`.
3. Suba o Postgres/pgAdmin:
   ```bash
   ./start.sh        # carrega .env, sobe docker e cria venv se faltando
   ```
4. Ative o venv e inicie a API:
   ```bash
   source .venv/bin/activate
   cd api
   uvicorn main:app --host 0.0.0.0 --port 3000 --reload
   ```
5. Teste em `http://localhost:3000/docs`.

## Frontend
1. Entre em `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Acesse `http://localhost:5173/`.

Pronto! Backend em `3000`, frontend em `5173`, banco em `5435`, pgAdmin em `5051`. Ajuste portas/creds no `.env` se precisar.
