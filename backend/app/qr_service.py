from io import BytesIO

import qrcode
from PIL import Image

from app.models import QRGenerateRequest, QRType


def build_qr_payload(request: QRGenerateRequest) -> str:
    if request.type == QRType.TEXT:
        return request.value or ""

    if request.type == QRType.URL:
        value = request.value or ""
        if value.startswith(("http://", "https://")):
            return value
        return f"https://{value}"

    if request.type == QRType.EMAIL:
        value = request.value or ""
        if value.startswith("mailto:"):
            return value
        return f"mailto:{value}"

    if request.type == QRType.PHONE:
        value = request.value or ""
        if value.startswith("tel:"):
            return value
        return f"tel:{value}"

    if request.type == QRType.WIFI:
        ssid = _escape_wifi_value(request.ssid or "")
        password = _escape_wifi_value(request.password or "")
        encryption = request.encryption
        if encryption == "nopass":
            return f"WIFI:T:nopass;S:{ssid};;"
        return f"WIFI:T:{encryption};S:{ssid};P:{password};;"

    raise ValueError("Unsupported QR code type.")


def generate_qr_png(request: QRGenerateRequest) -> bytes:
    payload = build_qr_payload(request)
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=request.size,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    image: Image.Image = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    buffer = BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def _escape_wifi_value(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace(":", "\\:")
        .replace('"', '\\"')
    )

