from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.routes import router as services_router
from verification.routes import router as verification_router

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
app.include_router(verification_router, prefix="/verification")


