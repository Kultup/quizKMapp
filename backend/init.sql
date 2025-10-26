-- Quiz App Database Initialization Script
-- This script creates the database and user for the Quiz App

-- Create database (run as postgres superuser)
-- CREATE DATABASE quizapp;

-- Create user and grant privileges
-- CREATE USER quizapp_user WITH PASSWORD 'quizapp_password';
-- GRANT ALL PRIVILEGES ON DATABASE quizapp TO quizapp_user;

-- Connect to quizapp database and create extensions
\c quizapp;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO quizapp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quizapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quizapp_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quizapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO quizapp_user;
