# sam - Backend

FastAPI backend application with OVU authentication via ULM integration.

## 🚀 Quick Start

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 8005
```

The API will be available at `http://localhost:8005`

## 📁 Project Structure

```
app/
├── api/              # API routes
│   └── v1/
│       └── routes/
│           ├── auth.py      # Authentication (proxy to ULM)
│           ├── health.py    # Health checks
│           └── example.py   # Example protected routes
│
├── clients/          # External service clients
│   └── ulm.py        # ULM client with X-App-Source
│
├── core/             # Core configuration
│   ├── config.py     # Settings
│   └── deps.py       # Common dependencies
│
├── middleware/       # Custom middleware
│   └── logging.py    # Request logging
│
├── security/         # Security utilities
│   └── auth.py       # JWT decoding (trust ULM)
│
└── main.py           # FastAPI application
```

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI:** `http://localhost:8005/docs`
- **ReDoc:** `http://localhost:8005/redoc`

## 🔐 Authentication

This app proxies authentication to ULM and trusts ULM-issued JWT tokens.

### Login

```bash
curl -X POST http://localhost:8005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"password123"}'
```

### Use Protected Endpoints

```bash
curl http://localhost:8005/api/v1/example/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🏗️ Adding New Endpoints

### 1. Create Route File

Create `app/api/v1/routes/myroute.py`:

```python
from fastapi import APIRouter, Depends
from app.security.auth import get_current_user

router = APIRouter(prefix="/myroute", tags=["My Route"])

@router.get("/")
async def my_endpoint(current_user: dict = Depends(get_current_user)):
    return {"message": "Hello from my route!", "user": current_user}
```

### 2. Register in main.py

```python
from app.api.v1.routes import myroute

app.include_router(myroute.router, prefix=settings.API_V1_STR)
```

## 🔗 Calling ULM

Use the ULM client to make requests:

```python
from app.clients.ulm import ulm_request

# Forward user request
response = await ulm_request(
    "GET",
    "/api/v1/users",
    user_token=request.headers.get("authorization")
)

# System request with service token
response = await ulm_request(
    "POST",
    "/api/v1/users",
    use_service_fallback=True,
    json={"email": "newuser@example.com"}
)
```

## 🐳 Docker

### Build Image

```bash
docker build -t sam-backend .
```

### Run Container

```bash
docker run -p 8005:8005 \
  --env-file .env \
  sam-backend
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8005:8005"
    env_file:
      - .env
    environment:
      - DEBUG=False
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py
```

## 🚨 Troubleshooting

### Can't connect to ULM

1. Check `ULM_SERVICE_URL` in `.env`
2. Verify ULM is running
3. Check network connectivity

```bash
curl http://localhost:8001/health
```

### Import errors

Make sure you're in the virtual environment:

```bash
source venv/bin/activate
```

### Port already in use

Change port in `.env` or use different port:

```bash
uvicorn app.main:app --reload --port 8099
```

## 📝 Development Notes

### JWT Validation

This app does NOT validate JWT signatures. It trusts ULM to issue valid tokens and only decodes them to read claims. This is the standard pattern for micro-services.

### X-App-Source Header

All requests to ULM include `X-App-Source: sam-backend`. This helps ULM track which app made the request.

### Service Token

If `ULM_SERVICE_USERNAME` and `ULM_SERVICE_PASSWORD` are configured, the app can make system-level requests to ULM using a service token.

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Development server with auto-reload |
| `pytest` | Run tests |
| `black app/` | Format code |
| `flake8 app/` | Lint code |
| `mypy app/` | Type checking |

## 🔗 Related

- Frontend: `../frontend/README.md`
- Main README: `../README.md`

---

**Built with ❤️ using OVU Template**

