from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.routes import router as services_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services_router, prefix="/services")
print("Hello")
print("World")

