from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.energia import router as energia_router
from routers.climatico import router as climatico_router  # ← nueva

app = FastAPI(title="Hackathon Energía — Región 6")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(energia_router)
app.include_router(climatico_router)  # ← nueva

