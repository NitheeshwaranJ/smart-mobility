from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from ..models import UserRole, BookingStatus, PaymentStatus, VehicleCategory


# ---------- Auth ----------
class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.customer
    phone: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None
    created_at: datetime


# ---------- Vehicles ----------
class VehicleIn(BaseModel):
    brand: str
    model: str
    category: VehicleCategory
    year: int = Field(ge=1990, le=2100)
    seats: int = Field(ge=1, le=12)
    location: str
    base_price_per_day: float = Field(gt=0)
    image_url: str = ""
    features: str = ""


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int
    brand: str
    model: str
    category: VehicleCategory
    year: int
    seats: int
    location: str
    base_price_per_day: float
    image_url: str
    features: str
    rating: float
    popularity_score: float
    is_available: bool


class VehicleWithPriceOut(VehicleOut):
    ai_price: float
    ai_adjustment: float
    pricing_reason: str


# ---------- Bookings ----------
class BookingIn(BaseModel):
    vehicle_id: int
    start_date: date
    end_date: date
    pickup_location: str = ""


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_id: int
    vehicle_id: int
    start_date: date
    end_date: date
    pickup_location: str
    base_price: float
    ai_adjustment: float
    total_price: float
    status: BookingStatus
    created_at: datetime
    vehicle: Optional[VehicleOut] = None


# ---------- Payment ----------
class PaymentIn(BaseModel):
    booking_id: int
    method: str = "mock_card"


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    booking_id: int
    transaction_id: str
    amount: float
    method: str
    status: PaymentStatus
    created_at: datetime


# ---------- Carpool ----------
class CarpoolIn(BaseModel):
    pickup: str
    destination: str
    travel_time: datetime
    seats_needed: int = 1


class CarpoolOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    pickup: str
    destination: str
    travel_time: datetime
    seats_needed: int
    is_active: bool


class CarpoolMatchOut(BaseModel):
    other_request: CarpoolOut
    match_score: float
    cost_saving: float
    distance_saving_km: float
    co2_saving_kg: float


# ---------- Reviews ----------
class ReviewIn(BaseModel):
    vehicle_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime


# ---------- AI Assistant ----------
class AIMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class AIChatIn(BaseModel):
    messages: List[AIMessage]


class AIChatOut(BaseModel):
    reply: str


# ---------- Analytics ----------
class AnalyticsOut(BaseModel):
    total_users: int
    total_vehicles: int
    total_bookings: int
    active_trips: int
    carpool_matches: int
    revenue_simulation: float
    user_growth: list[dict]
    revenue_trends: list[dict]
    vehicle_usage: list[dict]
    popular_locations: list[dict]


TokenOut.model_rebuild()
