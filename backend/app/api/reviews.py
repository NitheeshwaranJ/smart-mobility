from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Review, Vehicle, User
from ..schemas import ReviewIn, ReviewOut
from ..core.security import current_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut)
def create(data: ReviewIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    r = Review(user_id=user.id, **data.model_dump())
    db.add(r)
    # recompute vehicle avg rating
    db.flush()
    v = db.get(Vehicle, data.vehicle_id)
    if v:
        avg = db.scalar(select(func.avg(Review.rating)).where(Review.vehicle_id == v.id))
        v.rating = round(float(avg or 0), 2)
    db.commit(); db.refresh(r)
    return ReviewOut.model_validate(r)


@router.get("/vehicle/{vehicle_id}", response_model=list[ReviewOut])
def for_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    return [ReviewOut.model_validate(r) for r in db.scalars(
        select(Review).where(Review.vehicle_id == vehicle_id).order_by(Review.created_at.desc())
    ).all()]
