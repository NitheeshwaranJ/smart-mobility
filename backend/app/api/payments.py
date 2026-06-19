import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Payment, PaymentStatus, Booking, BookingStatus, User, Notification
from ..schemas import PaymentIn, PaymentOut
from ..core.security import current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("", response_model=PaymentOut)
def pay(data: PaymentIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    b = db.get(Booking, data.booking_id)
    if not b: raise HTTPException(404, "Booking not found")
    if b.customer_id != user.id:
        raise HTTPException(403, "Not your booking")
    if b.payment and b.payment.status == PaymentStatus.success:
        raise HTTPException(400, "Already paid")

    # mock gateway — always succeeds; randomize transaction id
    txn = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    p = Payment(
        booking_id=b.id, transaction_id=txn,
        amount=b.total_price, method=data.method, status=PaymentStatus.success,
    )
    b.status = BookingStatus.confirmed
    db.add(p)
    db.add(Notification(user_id=user.id, title="Payment successful",
                        body=f"Receipt {txn} — ${b.total_price:.2f}"))
    db.commit(); db.refresh(p)
    return PaymentOut.model_validate(p)


@router.get("/mine", response_model=list[PaymentOut])
def my_payments(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = db.scalars(
        select(Payment).join(Booking, Booking.id == Payment.booking_id)
        .where(Booking.customer_id == user.id)
        .order_by(Payment.created_at.desc())
    ).all()
    return [PaymentOut.model_validate(p) for p in rows]
