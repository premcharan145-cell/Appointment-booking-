-- =============================================================
-- MediFlow - PostgreSQL Schema
-- =============================================================
-- The Spring Boot core service uses Hibernate with
-- `spring.jpa.hibernate.ddl-auto=update`, so these tables are
-- normally created automatically on first startup. This script
-- is provided for reference and for manual / production setups
-- where DDL is managed outside the application.
--
-- Column names follow Hibernate's default snake_case strategy
-- derived from the JPA entities in mth.models.* .
--
-- Usage:
--   createdb mth
--   psql -d mth -f schema.sql
-- =============================================================

CREATE TABLE IF NOT EXISTS roles (
    role      BIGINT PRIMARY KEY,
    rolename  VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS menus (
    mid    BIGINT PRIMARY KEY,
    menu   VARCHAR(255) NOT NULL,
    micon  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS rolesmapping (
    id    BIGSERIAL PRIMARY KEY,
    mid   BIGINT NOT NULL,
    role  BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id        BIGSERIAL PRIMARY KEY,
    fullname  VARCHAR(255) NOT NULL,
    phone     VARCHAR(50),
    email     VARCHAR(255) UNIQUE NOT NULL,
    password  VARCHAR(255) NOT NULL,
    role      INT NOT NULL DEFAULT 1,
    status    INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS service_providers (
    provider_id     BIGSERIAL PRIMARY KEY,
    user_id         BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    specialization  VARCHAR(255),
    rating          DOUBLE PRECISION DEFAULT 5.0,
    availability    TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id    BIGSERIAL PRIMARY KEY,
    user_id           BIGINT REFERENCES users(id) ON DELETE CASCADE,
    provider_id       BIGINT REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    appointment_date  DATE NOT NULL,
    start_time        TIME NOT NULL,
    end_time          TIME NOT NULL,
    status            VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id  BIGSERIAL PRIMARY KEY,
    user_id          BIGINT REFERENCES users(id) ON DELETE CASCADE,
    message          TEXT NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read          BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id  BIGSERIAL PRIMARY KEY,
    user_id            BIGINT REFERENCES users(id) ON DELETE CASCADE,
    provider_id        BIGINT REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    suggested_slot     VARCHAR(255) NOT NULL
);
