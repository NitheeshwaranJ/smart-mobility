"""Carpool matcher.

Heuristic similarity over (pickup, destination, travel_time):
  - string similarity on locations (token overlap)
  - time proximity (Gaussian-ish within 2 hours)

Each match yields cost, distance and CO2 savings estimates.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.orm import Session

from ..models import CarpoolRequest


@dataclass
class MatchResult:
    other: CarpoolRequest
    score: float
    cost_saving: float
    distance_saving_km: float
    co2_saving_kg: float


def _tokens(s: str) -> set[str]:
    return {t for t in s.lower().replace(",", " ").split() if t}


def _location_similarity(a: str, b: str) -> float:
    ta, tb = _tokens(a), _tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def _time_proximity(a: datetime, b: datetime, max_hours: float = 2.0) -> float:
    diff_h = abs((a - b).total_seconds()) / 3600.0
    if diff_h > max_hours:
        return 0.0
    return max(0.0, 1.0 - (diff_h / max_hours))


def find_matches(db: Session, req: CarpoolRequest, limit: int = 5) -> list[MatchResult]:
    candidates = db.scalars(
        select(CarpoolRequest).where(
            and_(
                CarpoolRequest.id != req.id,
                CarpoolRequest.is_active.is_(True),
                CarpoolRequest.user_id != req.user_id,
            )
        )
    ).all()

    results: list[MatchResult] = []
    for c in candidates:
        pickup_sim = _location_similarity(req.pickup, c.pickup)
        dest_sim = _location_similarity(req.destination, c.destination)
        time_sim = _time_proximity(req.travel_time, c.travel_time)
        score = round((pickup_sim * 0.35 + dest_sim * 0.40 + time_sim * 0.25) * 100, 1)
        if score < 30:
            continue
        # synthetic savings — proportional to match strength
        cost_saving = round(120 * (score / 100), 2)
        distance_saving = round(10 * (score / 100), 2)
        co2_saving = round(distance_saving * 0.18, 2)  # ~180g CO2/km
        results.append(MatchResult(c, score, cost_saving, distance_saving, co2_saving))

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:limit]
