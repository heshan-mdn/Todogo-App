package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/yourusername/todogo-backend/internal/models"
	"github.com/yourusername/todogo-backend/internal/service"
	"github.com/yourusername/todogo-backend/pkg/response"
)

type AuthHandler struct {
	authService *service.AuthService
	validator   *validator.Validate
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		validator:   validator.New(),
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.ValidationError(w, err)
		return
	}

	result, err := h.authService.Register(r.Context(), req)
	if err != nil {
		if err.Error() == "user already exists" {
			response.Error(w, http.StatusConflict, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to register user")
		return
	}

	response.Success(w, http.StatusCreated, result, "user registered successfully")
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.ValidationError(w, err)
		return
	}

	result, err := h.authService.Login(r.Context(), req)
	if err != nil {
		if err.Error() == "invalid credentials" {
			response.Error(w, http.StatusUnauthorized, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to login")
		return
	}

	response.Success(w, http.StatusOK, result, "login successful")
}
