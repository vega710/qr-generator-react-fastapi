# QR Code Generator API

FastAPI backend for generating PNG QR codes.

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

This backend targets Python 3.14.4, matching `runtime.txt` for Render.

## Endpoint

`POST /generate`

```json
{
  "type": "wifi",
  "ssid": "MyNetwork",
  "password": "12345678",
  "encryption": "WPA",
  "size": 10
}
```

Returns `image/png`.
