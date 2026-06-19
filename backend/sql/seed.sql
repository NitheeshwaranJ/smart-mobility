-- =====================================================================
-- Smart Mobility Platform — Demo Seed Data (MySQL 8)
-- Run AFTER schema.sql. Safe to re-run on an empty DB.
-- Password for ALL demo users: demo123
-- =====================================================================
USE smart_mobility;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE pricing_history;
TRUNCATE TABLE notifications;
TRUNCATE TABLE reviews;
TRUNCATE TABLE carpool_matches;
TRUNCATE TABLE carpool_requests;
TRUNCATE TABLE payments;
TRUNCATE TABLE bookings;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------- USERS -------------------------
-- bcrypt hash of "demo123"
SET @pw = '$2b$12$89/CmUfbs8d8pKGNrKD4..0gzyxmPIQAivjBmdfqouxCV15Tfevn2';

INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
 (1,'Recruiter Demo','recruiter@demo.com',@pw,'+1-555-0100','customer'),
 (2,'Fleet Owner',   'owner@demo.com',    @pw,'+1-555-0200','owner'),
 (3,'Platform Admin','admin@demo.com',    @pw,'+1-555-0300','admin'),
 (4,'Aarav Sharma',  'user1@demo.com',    @pw,'+91-9000000001','customer'),
 (5,'Diya Patel',    'user2@demo.com',    @pw,'+91-9000000002','customer'),
 (6,'Rohan Mehta',   'user3@demo.com',    @pw,'+91-9000000003','customer'),
 (7,'Isha Verma',    'user4@demo.com',    @pw,'+91-9000000004','customer'),
 (8,'Kabir Singh',   'user5@demo.com',    @pw,'+91-9000000005','customer'),
 (9,'Ananya Gupta',  'user6@demo.com',    @pw,'+91-9000000006','customer'),
 (10,'Vihaan Rao',   'user7@demo.com',    @pw,'+91-9000000007','customer'),
 (11,'Sara Khan',    'user8@demo.com',    @pw,'+91-9000000008','customer'),
 (12,'Aditya Joshi', 'user9@demo.com',    @pw,'+91-9000000009','customer'),
 (13,'Meera Nair',   'user10@demo.com',   @pw,'+91-9000000010','customer');

-- ------------------------- VEHICLES (owner_id = 2) -------------------------
INSERT INTO vehicles (id, owner_id, brand, model, category, year, seats, location, base_price_per_day, image_url, features, rating, popularity_score, is_available) VALUES
 (1, 2,'Tesla','Model 3','electric',2023,5,'Bangalore', 95,'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800','Autopilot,Premium Audio,Glass Roof',4.8,0.92,1),
 (2, 2,'BMW','X5','suv',2022,7,'Mumbai',140,'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800','Leather,Panoramic Roof,AWD',4.7,0.85,1),
 (3, 2,'Toyota','Camry','sedan',2023,5,'Delhi', 60,'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800','Adaptive Cruise,Lane Assist',4.5,0.78,1),
 (4, 2,'Hyundai','Creta','suv',2024,5,'Hyderabad', 55,'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800','Sunroof,Wireless Charging',4.6,0.81,1),
 (5, 2,'Maruti','Swift','hatchback',2022,5,'Bangalore', 30,'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800','Bluetooth,Reverse Camera',4.2,0.65,1),
 (6, 2,'Mercedes','C-Class','luxury',2023,5,'Mumbai',180,'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800','Burmester Audio,Massage Seats',4.9,0.95,1),
 (7, 2,'Audi','Q7','luxury',2022,7,'Delhi',200,'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800','Quattro AWD,Air Suspension',4.8,0.90,1),
 (8, 2,'Honda','City','sedan',2023,5,'Hyderabad', 45,'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800','Honda Sensing,Sunroof',4.4,0.72,1),
 (9, 2,'Tata','Nexon EV','electric',2024,5,'Bangalore', 65,'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800','Fast Charging,Connected Car',4.5,0.83,1),
 (10,2,'Mahindra','Thar','suv',2023,4,'Delhi', 75,'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800','4x4,Off-road Tyres',4.6,0.79,1),
 (11,2,'Kia','Seltos','suv',2023,5,'Mumbai', 60,'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800','Bose Audio,Ventilated Seats',4.5,0.76,1),
 (12,2,'Volkswagen','Polo','hatchback',2022,5,'Bangalore', 35,'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800','Climate Control',4.1,0.62,1),
 (13,2,'MG','Hector','suv',2023,7,'Hyderabad', 70,'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800','Internet Car,Panoramic Sunroof',4.4,0.74,1),
 (14,2,'Ford','EcoSport','suv',2022,5,'Delhi', 50,'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800','SYNC 3,Touchscreen',4.2,0.68,1),
 (15,2,'BYD','Atto 3','electric',2024,5,'Bangalore', 85,'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800','Rotating Screen,Vegan Leather',4.6,0.80,1);

-- ------------------------- BOOKINGS -------------------------
-- Mix of completed (past), active (today), confirmed (future)
INSERT INTO bookings (id, customer_id, vehicle_id, start_date, end_date, pickup_location, base_price, ai_adjustment, total_price, status, created_at) VALUES
 (1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 50 DAY), DATE_SUB(CURDATE(), INTERVAL 47 DAY),'Bangalore', 285, 12.5, 320.63,'completed', NOW() - INTERVAL 50 DAY),
 (2, 4, 2, DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_SUB(CURDATE(), INTERVAL 40 DAY),'Mumbai',    700, 18.0, 826.00,'completed', NOW() - INTERVAL 45 DAY),
 (3, 5, 3, DATE_SUB(CURDATE(), INTERVAL 40 DAY), DATE_SUB(CURDATE(), INTERVAL 38 DAY),'Delhi',     120,  5.0, 126.00,'completed', NOW() - INTERVAL 40 DAY),
 (4, 6, 4, DATE_SUB(CURDATE(), INTERVAL 35 DAY), DATE_SUB(CURDATE(), INTERVAL 32 DAY),'Hyderabad', 165, -3.0, 160.05,'completed', NOW() - INTERVAL 35 DAY),
 (5, 7, 5, DATE_SUB(CURDATE(), INTERVAL 33 DAY), DATE_SUB(CURDATE(), INTERVAL 31 DAY),'Bangalore',  60,  8.0,  64.80,'completed', NOW() - INTERVAL 33 DAY),
 (6, 8, 6, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 26 DAY),'Mumbai',    720, 22.5, 882.00,'completed', NOW() - INTERVAL 30 DAY),
 (7, 9, 7, DATE_SUB(CURDATE(), INTERVAL 28 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY),'Delhi',     600, 15.0, 690.00,'completed', NOW() - INTERVAL 28 DAY),
 (8,10, 8, DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 23 DAY),'Hyderabad',  90, -5.0,  85.50,'completed', NOW() - INTERVAL 25 DAY),
 (9,11, 9, DATE_SUB(CURDATE(), INTERVAL 22 DAY), DATE_SUB(CURDATE(), INTERVAL 19 DAY),'Bangalore', 195, 10.0, 214.50,'completed', NOW() - INTERVAL 22 DAY),
 (10,12,10,DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 18 DAY),'Delhi',     150, 25.0, 187.50,'completed', NOW() - INTERVAL 20 DAY),
 (11,13,11,DATE_SUB(CURDATE(), INTERVAL 18 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY),'Mumbai',    180,  7.0, 192.60,'completed', NOW() - INTERVAL 18 DAY),
 (12, 1,12,DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 13 DAY),'Bangalore',  70, -2.0,  68.60,'completed', NOW() - INTERVAL 15 DAY),
 (13, 4,13,DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY),'Hyderabad', 140, 14.0, 159.60,'completed', NOW() - INTERVAL 12 DAY),
 (14, 5,14,DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL  8 DAY),'Delhi',     100,  6.0, 106.00,'completed', NOW() - INTERVAL 10 DAY),
 (15, 6,15,DATE_SUB(CURDATE(), INTERVAL  8 DAY), DATE_SUB(CURDATE(), INTERVAL  5 DAY),'Bangalore', 255, 20.0, 306.00,'completed', NOW() - INTERVAL  8 DAY),
 (16, 7, 1,DATE_SUB(CURDATE(), INTERVAL  6 DAY), DATE_SUB(CURDATE(), INTERVAL  4 DAY),'Bangalore', 190, 15.0, 218.50,'completed', NOW() - INTERVAL  6 DAY),
 (17, 8, 2,DATE_SUB(CURDATE(), INTERVAL  4 DAY), DATE_SUB(CURDATE(), INTERVAL  2 DAY),'Mumbai',    280, 18.0, 330.40,'completed', NOW() - INTERVAL  4 DAY),
 (18, 9, 3,DATE_SUB(CURDATE(), INTERVAL  2 DAY), DATE_ADD(CURDATE(), INTERVAL  1 DAY),'Delhi',     180, 10.0, 198.00,'active',    NOW() - INTERVAL  2 DAY),
 (19,10, 6,CURDATE(),                              DATE_ADD(CURDATE(), INTERVAL  3 DAY),'Mumbai',    540, 25.0, 675.00,'active',    NOW() - INTERVAL  1 DAY),
 (20,11, 9,CURDATE(),                              DATE_ADD(CURDATE(), INTERVAL  2 DAY),'Bangalore', 130,  5.0, 136.50,'active',    NOW()),
 (21,12, 4,DATE_ADD(CURDATE(), INTERVAL  2 DAY), DATE_ADD(CURDATE(), INTERVAL  5 DAY),'Hyderabad', 165, 12.0, 184.80,'confirmed', NOW()),
 (22,13, 7,DATE_ADD(CURDATE(), INTERVAL  4 DAY), DATE_ADD(CURDATE(), INTERVAL  7 DAY),'Delhi',     600, 30.0, 780.00,'confirmed', NOW()),
 (23, 1,10,DATE_ADD(CURDATE(), INTERVAL  6 DAY), DATE_ADD(CURDATE(), INTERVAL  9 DAY),'Delhi',     225,  8.0, 243.00,'confirmed', NOW()),
 (24, 4,15,DATE_ADD(CURDATE(), INTERVAL  8 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY),'Bangalore', 255, 15.0, 293.25,'confirmed', NOW()),
 (25, 5,13,DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY),'Hyderabad', 140, -5.0, 133.00,'confirmed', NOW()),
 (26, 6, 5,DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY),'Bangalore',  60,  3.0,  61.80,'confirmed', NOW()),
 (27, 7,11,DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY),'Mumbai',    180, 20.0, 216.00,'confirmed', NOW()),
 (28, 8, 8,DATE_ADD(CURDATE(), INTERVAL 16 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY),'Hyderabad',  90,  5.0,  94.50,'confirmed', NOW()),
 (29, 9,14,DATE_ADD(CURDATE(), INTERVAL 18 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY),'Delhi',     100, 12.0, 112.00,'confirmed', NOW()),
 (30,10, 1,DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 23 DAY),'Bangalore', 285, 18.0, 336.30,'confirmed', NOW());

-- ------------------------- PAYMENTS -------------------------
INSERT INTO payments (booking_id, transaction_id, amount, method, status, created_at)
SELECT id, CONCAT('TXN-SEED', LPAD(id,6,'0')), total_price, 'mock_card', 'success', created_at
FROM bookings;

-- ------------------------- REVIEWS -------------------------
INSERT INTO reviews (vehicle_id, user_id, rating, comment, created_at) VALUES
 (1, 1, 5,'Tesla autopilot was magic on the highway.',     NOW() - INTERVAL 40 DAY),
 (1, 4, 5,'Loved the AI pricing transparency.',            NOW() - INTERVAL 30 DAY),
 (2, 5, 4,'Spacious and powerful. Great for family trips.',NOW() - INTERVAL 35 DAY),
 (2, 6, 5,'Booking was seamless.',                         NOW() - INTERVAL 20 DAY),
 (3, 7, 4,'Comfortable sedan, good mileage.',              NOW() - INTERVAL 25 DAY),
 (4, 8, 5,'Creta is value for money.',                     NOW() - INTERVAL 18 DAY),
 (5, 9, 4,'Perfect city car.',                             NOW() - INTERVAL 15 DAY),
 (6,10, 5,'Pure luxury. Worth every rupee.',               NOW() - INTERVAL 22 DAY),
 (7,11, 5,'Audi Q7 is a beast.',                           NOW() - INTERVAL 27 DAY),
 (8,12, 4,'Reliable Honda quality.',                       NOW() - INTERVAL 12 DAY),
 (9,13, 5,'EV with great range, would rent again.',        NOW() - INTERVAL 10 DAY),
 (10, 1,4,'Thar is fun off-road.',                         NOW() - INTERVAL  8 DAY),
 (11, 4,4,'Seltos has premium feel.',                      NOW() - INTERVAL  6 DAY),
 (12, 5,3,'Decent hatchback, basic features.',             NOW() - INTERVAL  5 DAY),
 (13, 6,4,'Hector internet car is cool.',                  NOW() - INTERVAL  4 DAY),
 (14, 7,4,'EcoSport handled well.',                        NOW() - INTERVAL  3 DAY),
 (15, 8,5,'BYD Atto 3 surprised me — fantastic build.',    NOW() - INTERVAL  2 DAY);

-- ------------------------- CARPOOL REQUESTS -------------------------
INSERT INTO carpool_requests (id, user_id, pickup, destination, travel_time, seats_needed, is_active) VALUES
 (1, 4,'Whitefield','Electronic City', NOW() + INTERVAL 1 DAY  + INTERVAL  9 HOUR, 1, 1),
 (2, 5,'Whitefield','Electronic City', NOW() + INTERVAL 1 DAY  + INTERVAL  9 HOUR + INTERVAL 15 MINUTE, 1, 1),
 (3, 6,'Andheri',   'BKC',             NOW() + INTERVAL 2 DAY  + INTERVAL  8 HOUR, 2, 1),
 (4, 7,'Andheri',   'BKC',             NOW() + INTERVAL 2 DAY  + INTERVAL  8 HOUR + INTERVAL 30 MINUTE, 1, 1),
 (5, 8,'Gurgaon',   'Connaught Place', NOW() + INTERVAL 3 DAY  + INTERVAL 10 HOUR, 1, 1),
 (6, 9,'Hitech City','Gachibowli',     NOW() + INTERVAL 1 DAY  + INTERVAL 18 HOUR, 1, 1),
 (7,10,'Hitech City','Gachibowli',     NOW() + INTERVAL 1 DAY  + INTERVAL 18 HOUR + INTERVAL 20 MINUTE, 2, 1),
 (8,11,'Gurgaon',   'Connaught Place', NOW() + INTERVAL 3 DAY  + INTERVAL 10 HOUR + INTERVAL 10 MINUTE, 1, 1);

-- ------------------------- CARPOOL MATCHES -------------------------
INSERT INTO carpool_matches (request_a_id, request_b_id, match_score, cost_saving, distance_saving_km, co2_saving_kg) VALUES
 (1, 2, 0.95, 180.00, 22.5, 4.5),
 (3, 4, 0.88, 240.00, 28.0, 5.6),
 (5, 8, 0.91, 210.00, 25.0, 5.0),
 (6, 7, 0.93, 150.00, 18.0, 3.6);

-- ------------------------- NOTIFICATIONS -------------------------
INSERT INTO notifications (user_id, title, body, `read`) VALUES
 (1,'Welcome to Smart Mobility','Explore vehicles, book trips, and try AI-matched carpools.',0),
 (2,'Welcome to Smart Mobility','Your fleet dashboard is ready.',0),
 (3,'Welcome to Smart Mobility','Admin analytics enabled.',0),
 (1,'Payment successful','Receipt TXN-SEED000001 — $320.63',1),
 (4,'Booking confirmed','BMW X5 ready for pickup in Mumbai.',1),
 (5,'Carpool match found','We found a 95% match for your Whitefield trip.',0),
 (6,'Trip completed','Hope you enjoyed the Hyundai Creta!',1),
 (7,'New AI price alert','Maruti Swift dropped 8% for your dates.',0);

-- ------------------------- PRICING HISTORY -------------------------
INSERT INTO pricing_history (vehicle_id, base_price, adjusted_price, demand_factor, availability_factor, season_factor, created_at) VALUES
 (1,  95, 110.20, 1.10, 0.95, 1.05, NOW() - INTERVAL 20 DAY),
 (2, 140, 168.00, 1.15, 0.90, 1.04, NOW() - INTERVAL 18 DAY),
 (6, 180, 225.00, 1.20, 0.85, 1.03, NOW() - INTERVAL 15 DAY),
 (7, 200, 240.00, 1.12, 0.92, 1.04, NOW() - INTERVAL 12 DAY),
 (9,  65,  71.50, 1.05, 0.96, 1.05, NOW() - INTERVAL 10 DAY),
 (15, 85,  98.60, 1.10, 0.94, 1.05, NOW() - INTERVAL  5 DAY);

-- =====================================================================
-- Verification
-- =====================================================================
SELECT 'users' tbl, COUNT(*) n FROM users UNION ALL
SELECT 'vehicles',         COUNT(*) FROM vehicles UNION ALL
SELECT 'bookings',         COUNT(*) FROM bookings UNION ALL
SELECT 'payments',         COUNT(*) FROM payments UNION ALL
SELECT 'reviews',          COUNT(*) FROM reviews UNION ALL
SELECT 'carpool_requests', COUNT(*) FROM carpool_requests UNION ALL
SELECT 'carpool_matches',  COUNT(*) FROM carpool_matches UNION ALL
SELECT 'notifications',    COUNT(*) FROM notifications UNION ALL
SELECT 'pricing_history',  COUNT(*) FROM pricing_history;
