import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import Base, engine
from .api import auth, vehicles, bookings, payments, carpool, reviews, ai, analytics, notifications

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("smart-mobility")

app = FastAPI(
    title="Smart Mobility Platform API",
    version="1.0.0",
    description="AI-powered car rental and carpooling backend.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Create tables if missing — schema.sql is authoritative for production
    Base.metadata.create_all(bind=engine)
    log.info("DB ready, CORS=%s", settings.cors_origins_list)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
def health():
    return {"status": "ok"}


for r in (auth.router, vehicles.router, bookings.router, payments.router,
          carpool.router, reviews.router, ai.router, analytics.router, notifications.router):
    app.include_router(r)
