package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"github.com/rs/zerolog/log"
)

type DB struct {
	*sql.DB
}

func NewDB(dsn string) (*DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Info().Msg("Database connection established")

	// Run migrations automatically
	if err := runMigrations(db); err != nil {
		log.Warn().Err(err).Msg("Failed to run migrations")
	} else {
		log.Info().Msg("Database migrations completed successfully")
	}

	return &DB{db}, nil
}

func runMigrations(db *sql.DB) error {
	// Enable UUID extension
	_, err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
	if err != nil {
		return fmt.Errorf("failed to enable uuid extension: %w", err)
	}

	// Create users table with UUID
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	// Create todos table with UUID references
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS todos (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(500) NOT NULL,
			description TEXT,
			completed BOOLEAN DEFAULT FALSE,
			priority VARCHAR(20) DEFAULT 'medium',
			due_date TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
		
		CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
		CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
		CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
	`)
	if err != nil {
		return fmt.Errorf("failed to create todos table: %w", err)
	}

	return nil
}

func (db *DB) Close() error {
	log.Info().Msg("Closing database connection")
	return db.DB.Close()
}
