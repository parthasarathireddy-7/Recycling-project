-- =====================================================================
-- RECYCLING CENTER ROUTE OPTIMIZER DATABASE SCHEMA
-- Target Database: MySQL 8.0+ / MariaDB 10.5+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS recycling_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recycling_db;

-- 1. Users Table (Authentication and RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    full_name VARCHAR(191) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Collection Staff',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Central Recycling Facilities Table
CREATE TABLE IF NOT EXISTS recycling_facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_person VARCHAR(100),
    phone_number VARCHAR(50),
    capacity_daily_kg DECIMAL(10, 2) DEFAULT 10000.00,
    operating_hours VARCHAR(100) DEFAULT '08:00 AM - 06:00 PM',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_facility_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_driver_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    driver_id INT NULL,
    capacity_kg DECIMAL(10, 2) NOT NULL DEFAULT 1500.00,
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'Diesel',
    fuel_efficiency_km_l DECIMAL(8, 2) NOT NULL DEFAULT 10.00,
    current_location VARCHAR(191) DEFAULT 'Central Facility Depot',
    availability VARCHAR(50) NOT NULL DEFAULT 'Available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    INDEX idx_vehicle_availability (availability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Recyclable Material Categories Table
CREATE TABLE IF NOT EXISTS material_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    unit_price_per_kg DECIMAL(8, 2) DEFAULT 0.50,
    current_stock_kg DECIMAL(10, 2) DEFAULT 0.00,
    carbon_offset_per_kg DECIMAL(6, 2) DEFAULT 1.20,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Collection Points Table
CREATE TABLE IF NOT EXISTS collection_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    material_category VARCHAR(100) NOT NULL,
    estimated_weight_kg DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    collection_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cp_status (collection_status),
    INDEX idx_cp_priority (priority),
    INDEX idx_cp_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_code VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id INT NULL,
    driver_id INT NULL,
    start_facility_id INT NOT NULL,
    destination_facility_id INT NOT NULL,
    optimization_algorithm VARCHAR(50) NOT NULL DEFAULT 'Dijkstra-TSP',
    total_distance_km DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    original_distance_km DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    distance_saved_km DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estimated_time_minutes DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    fuel_consumption_litres DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estimated_fuel_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_load_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Planned',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    FOREIGN KEY (start_facility_id) REFERENCES recycling_facilities(id),
    FOREIGN KEY (destination_facility_id) REFERENCES recycling_facilities(id),
    INDEX idx_route_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Route Stops Table (Sequence of Stops)
CREATE TABLE IF NOT EXISTS route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    collection_point_id INT NOT NULL,
    stop_order INT NOT NULL,
    planned_arrival_time VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    weight_collected_kg DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_point_id) REFERENCES collection_points(id) ON DELETE CASCADE,
    INDEX idx_stop_order (route_id, stop_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Collections Audit Table
CREATE TABLE IF NOT EXISTS collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_point_id INT NOT NULL,
    route_id INT NULL,
    material_category VARCHAR(100) NOT NULL,
    weight_kg DECIMAL(10, 2) NOT NULL,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (collection_point_id) REFERENCES collection_points(id),
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    INDEX idx_collection_date (collected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_unread (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

