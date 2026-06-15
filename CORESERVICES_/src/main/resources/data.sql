-- =============================================================
-- MediFlow - Sample Data (PostgreSQL)
-- =============================================================
-- This mirrors mth.services.DatabaseSeeder, which already seeds
-- the same rows automatically on first application startup.
-- Use this file only for a fresh manual DB setup (run AFTER
-- schema.sql). Passwords are stored in plain text to match the
-- existing custom auth in UsersService.validateCredentials.
--
--   psql -d mth -f schema.sql
--   psql -d mth -f data.sql
-- =============================================================

-- ---------- Roles ----------
INSERT INTO roles (role, rolename) VALUES
    (1, 'CUSTOMER'),
    (2, 'PROVIDER'),
    (3, 'ADMIN')
ON CONFLICT (role) DO NOTHING;

-- ---------- Menus ----------
INSERT INTO menus (mid, menu, micon) VALUES
    (2,  'Book Appointment',     'book.png'),
    (3,  'Appointment History',  'history.png'),
    (4,  'Recommendations',      'recommend.png'),
    (5,  'Notifications',        'bell.png'),
    (6,  'Manage Availability',  'calendar.png'),
    (7,  'Appointments List',    'list.png'),
    (8,  'User Management',      'users.png'),
    (9,  'Provider Management',  'providers.png'),
    (10, 'Analytics Dashboard',  'analytics.png'),
    (11, 'Profile',              'user.png')
ON CONFLICT (mid) DO NOTHING;

-- ---------- Role -> Menu mapping ----------
-- Customer (role 1)
INSERT INTO rolesmapping (mid, role) VALUES
    (2, 1), (3, 1), (4, 1), (5, 1), (11, 1),
-- Provider (role 2)
    (6, 2), (7, 2), (5, 2), (11, 2),
-- Admin (role 3)
    (8, 3), (9, 3), (10, 3), (11, 3);

-- ---------- Users ----------
-- Demo accounts (password: "password")
INSERT INTO users (fullname, phone, email, password, role, status) VALUES
    ('Alice Johnson',        '1234567890', 'customer@booking.com',  'password', 1, 1),
    ('Dr. John Smith',       '9876543210', 'provider1@booking.com', 'password', 2, 1),
    ('Dr. Sarah Connor',     '9876543211', 'provider2@booking.com', 'password', 2, 1),
    ('System Administrator', '5551234567', 'admin@booking.com',     'password', 3, 1),
-- Documented sample accounts (see README)
    ('Mohith',  '9000000001', 'mohith@example.com',  '1',   1, 1),
    ('Prem Sai','9000000002', 'premsai@example.com', '12',  2, 1),
    ('Rakesh',  '9000000003', 'rakesh@example.com',  '123', 3, 1)
ON CONFLICT (email) DO NOTHING;

-- ---------- Service Providers ----------
INSERT INTO service_providers (user_id, name, specialization, rating, availability)
SELECT u.id, u.fullname, v.specialization, v.rating, v.availability
FROM (VALUES
    ('provider1@booking.com', 'Cardiologist',  4.8, '{"Monday":"09:00-17:00","Wednesday":"09:00-17:00","Friday":"09:00-17:00"}'),
    ('provider2@booking.com', 'Therapist',     4.9, '{"Tuesday":"10:00-18:00","Thursday":"10:00-18:00"}'),
    ('premsai@example.com',   'Dermatologist', 4.7, '{"Monday":"09:00-17:00","Tuesday":"09:00-17:00","Wednesday":"09:00-17:00","Thursday":"09:00-17:00","Friday":"09:00-17:00"}')
) AS v(email, specialization, rating, availability)
JOIN users u ON u.email = v.email
ON CONFLICT (user_id) DO NOTHING;
