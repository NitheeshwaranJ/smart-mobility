from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Booking, BookingStatus, Vehicle, User, UserRole, Notification
from ..schemas import BookingIn, BookingOut
from ..core.security import current_user
from ..core.pricing import compute_price

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _has_overlap(db: Session, vehicle_id: int, s: date, e: date) -> bool:
    return db.scalar(
        select(Booking.id).where(
            and_(
                Booking.vehicle_id == vehicle_id,
                Booking.status.in_([BookingStatus.confirmed, BookingStatus.active, BookingStatus.pending]),
                Booking.start_date <= e,
                Booking.end_date >= s,
            )
        )
    ) is not None


@router.post("", response_model=BookingOut)
def create_booking(data: BookingIn, db: Session = Depends(get_db),
                   user: User = Depends(current_user)):
    if data.end_date < data.start_date:
        raise HTTPException(400, "end_date must be >= start_date")
    if data.start_date < date.today():
        raise HTTPException(400, "start_date cannot be in the past")
    v = db.get(Vehicle, data.vehicle_id)
    if not v or not v.is_available:
        raise HTTPException(404, "Vehicle not available")
    if _has_overlap(db, v.id, data.start_date, data.end_date):
        raise HTTPException(409, "Vehicle already booked for those dates")

    p = compute_price(db, v, data.start_date, data.end_date)
    b = Booking(
        customer_id=user.id, vehicle_id=v.id,
        start_date=data.start_date, end_date=data.end_date,
        pickup_location=data.pickup_location or v.location,
        base_price=p.base_price,
        ai_adjustment=p.adjustment_pct,
        total_price=p.adjusted_price,
        status=BookingStatus.pending,
    )
    db.add(b)
    db.add(Notification(user_id=user.id, title="Booking created",
                        body=f"Booking for {v.brand} {v.model} pending payment."))
    db.commit(); db.refresh(b)
    return BookingOut.model_validate(b)


@router.get("/mine", response_model=list[BookingOut])
def my_bookings(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = db.scalars(
        select(Booking).options(joinedload(Booking.vehicle))
        .where(Booking.customer_id == user.id)
        .order_by(Booking.created_at.desc())
    ).all()
    return [BookingOut.model_validate(b) for b in rows]


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db),
                   user: User = Depends(current_user)):
    b = db.get(Booking, booking_id)
    if not b: raise HTTPException(404, "Not found")
    if b.customer_id != user.id and user.role != UserRole.admin:
        raise HTTPException(403, "Forbidden")
    if b.status in (BookingStatus.completed, BookingStatus.cancelled):
        raise HTTPException(400, f"Cannot cancel a {b.status.value} booking")
    b.status = BookingStatus.cancelled
    db.commit(); db.refresh(b)
    return BookingOut.model_validate(b)


@router.get("/owner", response_model=list[BookingOut])
def owner_bookings(db: Session = Depends(get_db), user: User = Depends(current_user)):
    if user.role not in (UserRole.owner, UserRole.admin):
        raise HTTPException(403, "Forbidden")
    rows = db.scalars(
        select(Booking).options(joinedload(Booking.vehicle))
        .join(Vehicle, Vehicle.id == Booking.vehicle_id)
        .where(Vehicle.owner_id == user.id)
        .order_by(Booking.created_at.desc())
    ).all()
    return [BookingOut.model_validate(b) for b in rows]
