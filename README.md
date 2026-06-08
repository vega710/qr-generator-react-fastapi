# Full-Stack QR Code Generator

A simple production-ready QR Code Generator with a React frontend and FastAPI backend. It supports plain text, URLs, email links, phone links, and Wi-Fi credentials.

## Project structure

```text
backend/
  app/
    main.py
    models.py
    qr_service.py
    routes.py
  requirements.txt
  render.yaml
frontend/
  src/
    main.jsx
    styles.css
  package.json
  render.yaml
```

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

The backend is pinned to Python 3.14.4 for Render in `backend/runtime.txt`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## API

`POST /generate`

Text, URL, email, and phone:

```json
{
  "type": "url",
  "value": "example.com",
  "size": 10
}
```

Wi-Fi:

```json
{
  "type": "wifi",
  "ssid": "MyNetwork",
  "password": "12345678",
  "encryption": "WPA",
  "size": 10
}
```

The API returns a PNG image.

## Render deployment

Deploy the backend first:

1. Create a new Render Web Service.
2. Use `backend` as the root directory.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Render will use `backend/runtime.txt` to select Python 3.14.4.

Deploy the frontend second:

1. Create a new Render Static Site.
2. Use `frontend` as the root directory.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable `VITE_API_BASE_URL` with your backend URL.

The included `render.yaml` files can also be used as deployment references.

## Features

- Clean FastAPI REST endpoint at `/generate`
- PNG QR generation with `qrcode` and Pillow
- Validation and error handling with Pydantic
- CORS enabled for local React and Render URLs
- Responsive React UI with tabs, loading state, errors, download, copy image, dark mode, and QR size control
