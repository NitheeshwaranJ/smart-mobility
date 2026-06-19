from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Vehicle, Booking, BookingStatus, User, UserRole, VehicleCategory
from ..schemas import VehicleIn, VehicleOut, VehicleWithPriceOut
from ..core.security import current_user, require_role
from ..core.pricing import compute_price

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("", response_model=list[VehicleWithPriceOut])
def list_vehicles(
    db: Session = Depends(get_db),
    location: str | None = None,
    category: VehicleCategory | None = None,
    max_price: float | None = None,
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
):
    q = select(Vehicle).where(Vehicle.is_available.is_(True))
    if location:
        q = q.where(Vehicle.location.ilike(f"%{location}%"))
    if category:
        q = q.where(Vehicle.category == category)
    if max_price:
        q = q.where(Vehicle.base_price_per_day <= max_price)
    vehicles = db.scalars(q).all()

    # filter out vehicles with overlapping confirmed bookings
    if start_date and end_date:
        booked_ids = set(db.scalars(
            select(Booking.vehicle_id).where(
                and_(
                    Booking.status.in_([BookingStatus.confirmed, BookingStatus.active]),
                    Booking.start_date <= end_date,
                    Booking.end_date >= start_date,
                )
            )
        ).all())
        vehicles = [v for v in vehicles if v.id not in booked_ids]

    out = []
    for v in vehicles:
        p = compute_price(db, v, start_date, end_date)
        d = VehicleOut.model_validate(v).model_dump()
        d.update(ai_price=p.adjusted_price, ai_adjustment=p.adjustment_pct, pricing_reason=p.reason)
        out.append(d)
    return out


@router.get("/{vehicle_id}", response_model=VehicleWithPriceOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db),
                start_date: date | None = None, end_date: date | None = None):
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise HTTPException(404, "Vehicle not found")
    p = compute_price(db, v, start_date, end_date)
    d = VehicleOut.model_validate(v).model_dump()
    d.update(ai_price=p.adjusted_price, ai_adjustment=p.adjustment_pct, pricing_reason=p.reason)
    return d


@router.post("", response_model=VehicleOut)
def create_vehicle(
    data: VehicleIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.owner, UserRole.admin)),
):
    v = Vehicle(**data.model_dump(), owner_id=user.id)
    db.add(v); db.commit(); db.refresh(v)
    return v


@router.get("/owner/mine", response_model=list[VehicleOut])
def my_vehicles(db: Session = Depends(get_db),
                user: User = Depends(require_role(UserRole.owner, UserRole.admin))):
    return db.scalars(select(Vehicle).where(Vehicle.owner_id == user.id)).all()


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db),
                   user: User = Depends(require_role(UserRole.owner, UserRole.admin))):
    v = db.get(Vehicle, vehicle_id)
    if not v: raise HTTPException(404, "Not found")
    if v.owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(403, "Not your vehicle")
    db.delete(v); db.commit()
