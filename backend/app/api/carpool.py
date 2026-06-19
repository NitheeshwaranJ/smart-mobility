from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CarpoolRequest, User
from ..schemas import CarpoolIn, CarpoolOut, CarpoolMatchOut
from ..core.security import current_user
from ..core.carpool import find_matches

router = APIRouter(prefix="/api/carpool", tags=["carpool"])


@router.post("", response_model=CarpoolOut)
def create(data: CarpoolIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    r = CarpoolRequest(user_id=user.id, **data.model_dump())
    db.add(r); db.commit(); db.refresh(r)
    return CarpoolOut.model_validate(r)


@router.get("/mine", response_model=list[CarpoolOut])
def mine(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return [CarpoolOut.model_validate(r) for r in db.scalars(
        select(CarpoolRequest).where(CarpoolRequest.user_id == user.id)
        .order_by(CarpoolRequest.created_at.desc())
    ).all()]


@router.get("/{req_id}/matches", response_model=list[CarpoolMatchOut])
def matches(req_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    r = db.get(CarpoolRequest, req_id)
    if not r: raise HTTPException(404, "Not found")
    if r.user_id != user.id:
        raise HTTPException(403, "Forbidden")
    found = find_matches(db, r)
    return [
        CarpoolMatchOut(
            other_request=CarpoolOut.model_validate(m.other),
            match_score=m.score,
            cost_saving=m.cost_saving,
            distance_saving_km=m.distance_saving_km,
            co2_saving_kg=m.co2_saving_kg,
        )
        for m in found
    ]


@router.delete("/{req_id}", status_code=204)
def cancel(req_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    r = db.get(CarpoolRequest, req_id)
    if not r or r.user_id != user.id:
        raise HTTPException(404, "Not found")
    r.is_active = False
    db.commit()
