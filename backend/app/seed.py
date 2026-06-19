"""Seed realistic demo data. Idempotent — safe to run multiple times."""
import random
from datetime import datetime, timedelta, date
from sqlalchemy import select

from .database import SessionLocal, Base, engine
from .models import (
    User, UserRole, Vehicle, VehicleCategory, Booking, BookingStatus,
    Payment, PaymentStatus, Review, Notification, CarpoolRequest,
)
from .core.security import hash_password

random.seed(42)

DEMO_VEHICLES = [
    ("Tesla", "Model 3", VehicleCategory.electric, 2023, 5, "Bangalore", 95, "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800", "Autopilot,Premium Audio,Glass Roof", 0.92),
    ("BMW", "X5", VehicleCategory.suv, 2022, 7, "Mumbai", 140, "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", "Leather,Panoramic Roof,AWD", 0.85),
    ("Toyota", "Camry", VehicleCategory.sedan, 2023, 5, "Delhi", 60, "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", "Adaptive Cruise,Lane Assist", 0.78),
    ("Hyundai", "Creta", VehicleCategory.suv, 2024, 5, "Hyderabad", 55, "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", "Sunroof,Wireless Charging", 0.81),
    ("Maruti", "Swift", VehicleCategory.hatchback, 2022, 5, "Bangalore", 30, "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", "Bluetooth,Reverse Camera", 0.65),
    ("Mercedes", "C-Class", VehicleCategory.luxury, 2023, 5, "Mumbai", 180, "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", "Burmester Audio,Massage Seats", 0.95),
    ("Audi", "Q7", VehicleCategory.luxury, 2022, 7, "Delhi", 200, "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", "Quattro AWD,Air Suspension", 0.90),
    ("Honda", "City", VehicleCategory.sedan, 2023, 5, "Hyderabad", 45, "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", "Honda Sensing,Sunroof", 0.72),
    ("Tata", "Nexon EV", VehicleCategory.electric, 2024, 5, "Bangalore", 65, "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800", "Fast Charging,Connected Car", 0.83),
    ("Mahindra", "Thar", VehicleCategory.suv, 2023, 4, "Delhi", 75, "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800", "4x4,Off-road Tyres", 0.79),
    ("Kia", "Seltos", VehicleCategory.suv, 2023, 5, "Mumbai", 60, "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", "Bose Audio,Ventilated Seats", 0.76),
    ("Volkswagen", "Polo", VehicleCategory.hatchback, 2022, 5, "Bangalore", 35, "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800", "Climate Control", 0.62),
    ("MG", "Hector", VehicleCategory.suv, 2023, 7, "Hyderabad", 70, "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", "Internet Car,Panoramic Sunroof", 0.74),
    ("Ford", "EcoSport", VehicleCategory.suv, 2022, 5, "Delhi", 50, "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800", "SYNC 3,Touchscreen", 0.68),
    ("BYD", "Atto 3", VehicleCategory.electric, 2024, 5, "Bangalore", 85, "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800", "Rotating Screen,Vegan Leather", 0.80),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.scalar(select(User).where(User.email == "recruiter@demo.com")):
            print("Seed already applied, skipping.")
            return

        # Users
        customer = User(name="Recruiter Demo", email="recruiter@demo.com",
                        password_hash=hash_password("demo123"), role=UserRole.customer, phone="+1-555-0100")
        owner = User(name="Fleet Owner", email="owner@demo.com",
                     password_hash=hash_password("demo123"), role=UserRole.owner, phone="+1-555-0200")
        admin = User(name="Platform Admin", email="admin@demo.com",
                     password_hash=hash_password("demo123"), role=UserRole.admin, phone="+1-555-0300")
        extras = [
            User(name=f"User {i}", email=f"user{i}@demo.com",
                 password_hash=hash_password("demo123"), role=UserRole.customer)
            for i in range(1, 11)
        ]
        db.add_all([customer, owner, admin, *extras])
        db.flush()

        # Vehicles owned by 'owner'
        vehicles = []
        for (brand, model, cat, year, seats, loc, price, img, feats, pop) in DEMO_VEHICLES:
            v = Vehicle(owner_id=owner.id, brand=brand, model=model, category=cat,
                        year=year, seats=seats, location=loc, base_price_per_day=price,
                        image_url=img, features=feats, popularity_score=pop,
                        rating=round(3.8 + random.random() * 1.2, 1))
            vehicles.append(v)
        db.add_all(vehicles)
        db.flush()

        # Bookings + Payments spread over last 60 days
        all_customers = [customer, *extras]
        for _ in range(45):
            v = random.choice(vehicles)
            cust = random.choice(all_customers)
            start_offset = random.randint(-55, 20)
            duration = random.randint(1, 7)
            start = date.today() + timedelta(days=start_offset)
            end = start + timedelta(days=duration)
            base = v.base_price_per_day * duration
            adj_pct = random.uniform(-10, 35)
            total = round(base * (1 + adj_pct / 100), 2)
            status = (BookingStatus.completed if end < date.today()
                      else (BookingStatus.confirmed if start <= date.today() <= end
                            else BookingStatus.confirmed))
            b = Booking(customer_id=cust.id, vehicle_id=v.id,
                        start_date=start, end_date=end,
                        pickup_location=v.location, base_price=base,
                        ai_adjustment=adj_pct, total_price=total, status=status,
                        created_at=datetime.utcnow() - timedelta(days=max(0, -start_offset)))
            db.add(b); db.flush()
            db.add(Payment(booking_id=b.id, transaction_id=f"TXN-SEED{b.id:06d}",
                           amount=total, method="mock_card", status=PaymentStatus.success,
                           created_at=b.created_at))

        # Reviews
        for v in vehicles:
            for _ in range(random.randint(1, 4)):
                db.add(Review(vehicle_id=v.id, user_id=random.choice(all_customers).id,
                              rating=random.randint(3, 5),
                              comment=random.choice([
                                  "Great car, smooth ride.", "Clean and well maintained.",
                                  "Booking was seamless.", "Loved the AI pricing transparency.",
                                  "Would rent again."]),
                              created_at=datetime.utcnow() - timedelta(days=random.randint(1, 40))))

        # Carpool requests
        cities = [("Whitefield", "Electronic City"), ("Andheri", "BKC"),
                  ("Gurgaon", "Connaught Place"), ("Hitech City", "Gachibowli")]
        for i in range(8):
            p, d = random.choice(cities)
            db.add(CarpoolRequest(user_id=random.choice(all_customers).id, pickup=p,
                                  destination=d,
                                  travel_time=datetime.utcnow() + timedelta(days=random.randint(0, 5),
                                                                            hours=random.randint(7, 20))))

        # Welcome notifications
        for u in [customer, owner, admin]:
            db.add(Notification(user_id=u.id, title="Welcome to Smart Mobility",
                                body="Explore vehicles, book trips, and try AI-matched carpools."))

        db.commit()
        print(f"Seeded {len(vehicles)} vehicles, 45 bookings, demo users.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
