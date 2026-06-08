from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class QRType(str, Enum):
    TEXT = "text"
    URL = "url"
    EMAIL = "email"
    PHONE = "phone"
    WIFI = "wifi"


class QRGenerateRequest(BaseModel):
    type: QRType
    value: Annotated[str | None, Field(default=None, max_length=2048)] = None
    ssid: Annotated[str | None, Field(default=None, max_length=128)] = None
    password: Annotated[str | None, Field(default=None, max_length=128)] = None
    encryption: Literal["WPA", "WEP", "nopass"] = "WPA"
    size: Annotated[int, Field(default=10, ge=4, le=20)] = 10

    @field_validator("value", "ssid", "password")
    @classmethod
    def strip_strings(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        return stripped or None

    @model_validator(mode="after")
    def validate_type_payload(self) -> "QRGenerateRequest":
        if self.type == QRType.WIFI:
            if not self.ssid:
                raise ValueError("Wi-Fi QR codes require an SSID.")
            return self

        if not self.value:
            raise ValueError(f"{self.type.value} QR codes require a value.")
        return self

