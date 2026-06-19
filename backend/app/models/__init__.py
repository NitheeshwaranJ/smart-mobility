from __future__ import annotations
from datetime import datetime, date
from sqlalchemy import (
    String, Integer, Float, DateTime, Date, ForeignKey, Boolean, Text,
    Enum as SQLEnum, Index, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from ..database import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    owner = "owner"
    admin = "admin"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"
    refunded = "refunded"


class VehicleCategory(str, enum.Enum):
    sedan = "sedan"
    suv = "suv"
    hatchback = "hatchback"
    luxury = "luxury"
    electric = "electric"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(190), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.customer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vehicles: Mapped[list["Vehicle"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="customer", foreign_keys="Booking.customer_id")


class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    brand: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    category: Mapped[VehicleCategory] = mapped_column(SQLEnum(VehicleCategory), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    seats: Mapped[int] = mapped_column(Integer, default=4)
    location: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    base_price_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500))
    features: Mapped[str] = mapped_column(Text, default="")  # comma-separated
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    popularity_score: Mapped[float] = mapped_column(Float, default=0.5)  # 0..1
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped[User] = relationship(back_populates="vehicles")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="vehicle", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="vehicle", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_vehicle_loc_cat", "location", "category"),)


class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    pickup_location: Mapped[str] = mapped_column(String(120))
    base_price: Mapped[float] = mapped_column(Float, nullable=False)
    ai_adjustment: Mapped[float] = mapped_column(Float, default=0.0)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(SQLEnum(BookingStatus), default=BookingStatus.pending, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    customer: Mapped[User] = relationship(back_populates="bookings", foreign_keys=[customer_id])
    vehicle: Mapped[Vehicle] = relationship(back_populates="bookings")
    payment: Mapped["Payment | None"] = relationship(back_populates="booking", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (Index("ix_booking_vehicle_dates", "vehicle_id", "start_date", "end_date"),)


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), unique=True, nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    method: Mapped[str] = mapped_column(String(40), default="mock_card")
    status: Mapped[PaymentStatus] = mapped_column(SQLEnum(PaymentStatus), default=PaymentStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    booking: Mapped[Booking] = relationship(back_populates="payment")


class CarpoolRequest(Base):
    __tablename__ = "carpool_requests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    pickup: Mapped[str] = mapped_column(String(120), nullable=False)
    destination: Mapped[str] = mapped_column(String(120), nullable=False)
    travel_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    seats_needed: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CarpoolMatch(Base):
    __tablename__ = "carpool_matches"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_a_id: Mapped[int] = mapped_column(ForeignKey("carpool_requests.id"), nullable=False)
    request_b_id: Mapped[int] = mapped_column(ForeignKey("carpool_requests.id"), nullable=False)
    match_score: Mapped[float] = mapped_column(Float, nullable=False)
    cost_saving: Mapped[float] = mapped_column(Float, default=0.0)
    distance_saving_km: Mapped[float] = mapped_column(Float, default=0.0)
    co2_saving_kg: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("request_a_id", "request_b_id", name="uq_pair"),)


class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1..5
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vehicle: Mapped[Vehicle] = relationship(back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str] = mapped_column(Text, default="")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PricingHistory(Base):
    __tablename__ = "pricing_history"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    base_price: Mapped[float] = mapped_column(Float, nullable=False)
    adjusted_price: Mapped[float] = mapped_column(Float, nullable=False)
    demand_factor: Mapped[float] = mapped_column(Float)
    availability_factor: Mapped[float] = mapped_column(Float)
    season_factor: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
