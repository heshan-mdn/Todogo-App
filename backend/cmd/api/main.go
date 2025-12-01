package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/yourusername/todogo-backend/internal/config"
	"github.com/yourusername/todogo-backend/internal/database"
	"github.com/yourusername/todogo-backend/internal/handler"
	custommw "github.com/yourusername/todogo-backend/internal/middleware"
	"github.com/yourusername/todogo-backend/internal/repository"
	"github.com/yourusername/todogo-backend/internal/service"
)

func main() {
	// Setup logger
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	// Connect to database
	db, err := database.NewDB(cfg.Database.DSN())
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	todoRepo := repository.NewTodoRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg.JWT.Secret, cfg.JWT.Expiration)
	todoService := service.NewTodoService(todoRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	todoHandler := handler.NewTodoHandler(todoService)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(custommw.Logger)
	r.Use(custommw.Recover)
	r.Use(middleware.Compress(5))

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORS.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Root handler - API documentation
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Todogo API Server","version":"1.0.0","status":"running","endpoints":{"/health":"GET - Health check","/api/v1/auth/register":"POST - Register user","/api/v1/auth/login":"POST - Login user","/api/v1/todos":"GET/POST - Todo operations (requires auth)"}}`))
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// API Routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public routes
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(custommw.AuthMiddleware(authService))

			// Todo routes
			r.Route("/todos", func(r chi.Router) {
				r.Get("/", todoHandler.GetAll)
				r.Post("/", todoHandler.Create)
				r.Get("/{id}", todoHandler.GetByID)
				r.Put("/{id}", todoHandler.Update)
				r.Delete("/{id}", todoHandler.Delete)
				r.Patch("/{id}/complete", todoHandler.MarkAsCompleted)
				r.Patch("/{id}/incomplete", todoHandler.MarkAsIncomplete)
			})
		})
	})

	// Start server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Server.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt, syscall.SIGTERM)
		<-sigint

		log.Info().Msg("Shutting down server...")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Fatal().Err(err).Msg("Server forced to shutdown")
		}
	}()

	log.Info().Str("port", cfg.Server.Port).Msg("Starting server")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal().Err(err).Msg("Server failed to start")
	}

	log.Info().Msg("Server stopped")
}
