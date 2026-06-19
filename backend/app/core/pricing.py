"""AI Dynamic Pricing Engine.

Computes an adjusted price from interpretable factors:
  - demand_factor       : recent booking count for this vehicle
  - availability_factor : how many comparable vehicles are free at the same time
  - season_factor       : month-of-year curve (peak summer/holidays)
  - popularity_factor   : vehicle.popularity_score (0..1)
  - location_factor     : higher in dense metros

Final adjustment is bounded to [-30%, +60%] of base to stay realistic.
"""
from __future__ import annotations
from datetime import date, datetime, timedelta
from dataclasses import dataclass
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session

from ..models import Vehicle, Booking, BookingStatus

HIGH_DEMAND_LOCATIONS = {"Bangalore", "Mumbai", "Delhi", "Hyderabad", "San Francisco", "New York"}


@dataclass
class PricingResult:
    base_price: float
    adjusted_price: float
    adjustment_pct: float
    demand_factor: float
    availability_factor: float
    season_factor: float
    popularity_factor: float
    location_factor: float
    reason: str


def _season_factor(d: date) -> float:
    # Peak: Dec, May–Jun. Lowest: Feb, Sep.
    table = {1: 1.05, 2: 0.92, 3: 0.98, 4: 1.02, 5: 1.15, 6: 1.18,
             7: 1.08, 8: 1.00, 9: 0.93, 10: 1.00, 11: 1.05, 12: 1.20}
    return table.get(d.month, 1.0)


def compute_price(
    db: Session,
    vehicle: Vehicle,
    start: date | None = None,
    end: date | None = None,
) -> PricingResult:
    start = start or date.today()
    end = end or (start + timedelta(days=1))
    days = max((end - start).days, 1)

    # demand: bookings on this vehicle in last 30 days
    since = datetime.utcnow() - timedelta(days=30)
    demand_count = db.scalar(
        select(func.count(Booking.id)).where(
            and_(Booking.vehicle_id == vehicle.id, Booking.created_at >= since)
        )
    ) or 0
    demand_factor = min(1.0 + (demand_count * 0.04), 1.6)  # cap at +60%

    # availability: how many vehicles in same category+location are free
    available_count = db.scalar(
        select(func.count(Vehicle.id)).where(
            and_(
                Vehicle.category == vehicle.category,
                Vehicle.location == vehicle.location,
                Vehicle.is_available.is_(True),
            )
        )
    ) or 1
    availability_factor = 1.0 + max(0.0, (3 - available_count) * 0.06)  # scarcity premium

    season_factor = _season_factor(start)
    popularity_factor = 0.9 + (vehicle.popularity_score * 0.3)  # 0.9 .. 1.2
    location_factor = 1.08 if vehicle.location in HIGH_DEMAND_LOCATIONS else 1.0

    multiplier = demand_factor * availability_factor * season_factor * popularity_factor * location_factor
    multiplier = max(0.70, min(multiplier, 1.60))  # safety bounds

    base_total = vehicle.base_price_per_day * days
    adjusted_total = round(base_total * multiplier, 2)
    adjustment_pct = round((multiplier - 1) * 100, 1)

    reasons = []
    if demand_count > 5:
        reasons.append(f"high recent demand ({demand_count} bookings/30d)")
    if available_count <= 2:
        reasons.append("low availability in your area")
    if season_factor >= 1.10:
        reasons.append("peak season")
    if season_factor <= 0.95:
        reasons.append("off-season discount")
    if vehicle.popularity_score >= 0.75:
        reasons.append("highly popular model")
    if not reasons:
        reasons.append("standard market rate")
    reason = "; ".join(reasons)

    return PricingResult(
        base_price=round(base_total, 2),
        adjusted_price=adjusted_total,
        adjustment_pct=adjustment_pct,
        demand_factor=round(demand_factor, 3),
        availability_factor=round(availability_factor, 3),
        season_factor=round(season_factor, 3),
        popularity_factor=round(popularity_factor, 3),
        location_factor=round(location_factor, 3),
        reason=reason,
    )
