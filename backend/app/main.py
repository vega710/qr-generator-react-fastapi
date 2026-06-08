from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router


app = FastAPI(
    title="QR Code Generator API",
    description="Generate QR codes for text, URLs, email, phone numbers, and Wi-Fi credentials.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "QR Code Generator API is running."}

