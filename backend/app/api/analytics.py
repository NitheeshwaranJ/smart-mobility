from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Vehicle, Booking, BookingStatus, CarpoolMatch, Payment, PaymentStatus, UserRole
from ..schemas import AnalyticsOut
from ..core.security import require_role

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsOut)
def overview(db: Session = Depends(get_db),
             _: User = Depends(require_role(UserRole.admin))):
    total_users = db.scalar(select(func.count(User.id))) or 0
    total_vehicles = db.scalar(select(func.count(Vehicle.id))) or 0
    total_bookings = db.scalar(select(func.count(Booking.id))) or 0
    active_trips = db.scalar(
        select(func.count(Booking.id)).where(Booking.status.in_(
            [BookingStatus.active, BookingStatus.confirmed]))
    ) or 0
    carpool_matches = db.scalar(select(func.count(CarpoolMatch.id))) or 0
    revenue = db.scalar(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == PaymentStatus.success)
    ) or 0.0

    # user growth (last 8 weeks)
    now = datetime.utcnow()
    growth = []
    for i in range(7, -1, -1):
        start = now - timedelta(days=(i + 1) * 7)
        end = now - timedelta(days=i * 7)
        c = db.scalar(select(func.count(User.id)).where(User.created_at < end)) or 0
        growth.append({"week": end.strftime("%b %d"), "users": c})

    # revenue trends (last 8 weeks)
    trends = []
    for i in range(7, -1, -1):
        start = now - timedelta(days=(i + 1) * 7)
        end = now - timedelta(days=i * 7)
        amt = db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0))
            .where(Payment.created_at >= start, Payment.created_at < end,
                   Payment.status == PaymentStatus.success)
        ) or 0
        trends.append({"week": end.strftime("%b %d"), "revenue": float(amt)})

    # vehicle usage by category
    cat_rows = db.execute(
        select(Vehicle.category, func.count(Booking.id))
        .join(Booking, Booking.vehicle_id == Vehicle.id, isouter=True)
        .group_by(Vehicle.category)
    ).all()
    usage = [{"category": c.value, "bookings": int(n or 0)} for c, n in cat_rows]

    # popular locations
    loc_rows = db.execute(
        select(Vehicle.location, func.count(Booking.id))
        .join(Booking, Booking.vehicle_id == Vehicle.id)
        .group_by(Vehicle.location).order_by(func.count(Booking.id).desc()).limit(5)
    ).all()
    locations = [{"location": l, "bookings": int(n)} for l, n in loc_rows]

    return AnalyticsOut(
        total_users=total_users, total_vehicles=total_vehicles,
        total_bookings=total_bookings, active_trips=active_trips,
        carpool_matches=carpool_matches, revenue_simulation=float(revenue),
        user_growth=growth, revenue_trends=trends,
        vehicle_usage=usage, popular_locations=locations,
    )
