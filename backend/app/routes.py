from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.models import QRGenerateRequest
from app.qr_service import generate_qr_png


router = APIRouter()


@router.post("/generate", response_class=Response)
def generate_qr_code(request: QRGenerateRequest) -> Response:
    try:
        image_bytes = generate_qr_png(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return Response(content=image_bytes, media_type="image/png")

