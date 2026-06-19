-- Smart Mobility Platform — MySQL 8 schema
-- The application also auto-creates tables via SQLAlchemy on startup,
-- but this file is the authoritative DDL for DBAs and migrations.

CREATE DATABASE IF NOT EXISTS smart_mobility
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_mobility;

CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  role            ENUM('customer','owner','admin') NOT NULL DEFAULT 'customer',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicles (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  owner_id             INT NOT NULL,
  brand                VARCHAR(80) NOT NULL,
  model                VARCHAR(80) NOT NULL,
  category             ENUM('sedan','suv','hatchback','luxury','electric') NOT NULL,
  year                 INT NOT NULL,
  seats                INT NOT NULL DEFAULT 4,
  location             VARCHAR(120) NOT NULL,
  base_price_per_day   FLOAT NOT NULL,
  image_url            VARCHAR(500),
  features             TEXT,
  rating               FLOAT DEFAULT 4.5,
  popularity_score     FLOAT DEFAULT 0.5,
  is_available         TINYINT(1) NOT NULL DEFAULT 1,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX ix_vehicle_loc_cat (location, category),
  INDEX ix_vehicle_owner (owner_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  customer_id       INT NOT NULL,
  vehicle_id        INT NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  pickup_location   VARCHAR(120),
  base_price        FLOAT NOT NULL,
  ai_adjustment     FLOAT NOT NULL DEFAULT 0,
  total_price       FLOAT NOT NULL,
  status            ENUM('pending','confirmed','active','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX ix_booking_vehicle_dates (vehicle_id, start_date, end_date),
  INDEX ix_booking_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  booking_id      INT NOT NULL UNIQUE,
  transaction_id  VARCHAR(64) NOT NULL UNIQUE,
  amount          FLOAT NOT NULL,
  method          VARCHAR(40) DEFAULT 'mock_card',
  status          ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS carpool_requests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  pickup        VARCHAR(120) NOT NULL,
  destination   VARCHAR(120) NOT NULL,
  travel_time   DATETIME NOT NULL,
  seats_needed  INT NOT NULL DEFAULT 1,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carpool_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX ix_carpool_time (travel_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS carpool_matches (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  request_a_id      INT NOT NULL,
  request_b_id      INT NOT NULL,
  match_score       FLOAT NOT NULL,
  cost_saving       FLOAT DEFAULT 0,
  distance_saving_km FLOAT DEFAULT 0,
  co2_saving_kg     FLOAT DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_pair UNIQUE (request_a_id, request_b_id),
  CONSTRAINT fk_match_a FOREIGN KEY (request_a_id) REFERENCES carpool_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_b FOREIGN KEY (request_b_id) REFERENCES carpool_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id  INT NOT NULL,
  user_id     INT NOT NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user    FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT,
  `read`      TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX ix_notif_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pricing_history (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id          INT NOT NULL,
  base_price          FLOAT NOT NULL,
  adjusted_price      FLOAT NOT NULL,
  demand_factor       FLOAT,
  availability_factor FLOAT,
  season_factor       FLOAT,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ph_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX ix_ph_created (created_at)
) ENGINE=InnoDB;
