from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import mongo_db
from app.routers import users, inflow, expenses, errands, market, settlements, auth

app = FastAPI(
    title="GharKhata API",
    description="Backend API powered by MongoDB Atlas & Google OAuth",
    version="1.0.0"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for upload receipts
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(os.path.join(static_dir, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(inflow.router)
app.include_router(expenses.router)
app.include_router(errands.router)
app.include_router(market.router)
app.include_router(settlements.router)

@app.get("/")
def read_root():
    return {"status": "ok", "app": "GharKhata API Server", "version": "1.0.0"}
