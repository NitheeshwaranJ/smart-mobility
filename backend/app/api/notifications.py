from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Notification, User
from ..core.security import current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = db.scalars(
        select(Notification).where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc()).limit(50)
    ).all()
    return [
        {"id": n.id, "title": n.title, "body": n.body, "read": n.read,
         "created_at": n.created_at.isoformat()}
        for n in rows
    ]


@router.post("/{nid}/read")
def mark_read(nid: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    n = db.get(Notification, nid)
    if n and n.user_id == user.id:
        n.read = True; db.commit()
    return {"ok": True}
