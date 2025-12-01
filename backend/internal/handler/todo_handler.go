package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/yourusername/todogo-backend/internal/middleware"
	"github.com/yourusername/todogo-backend/internal/models"
	"github.com/yourusername/todogo-backend/internal/service"
	"github.com/yourusername/todogo-backend/pkg/response"
)

type TodoHandler struct {
	todoService *service.TodoService
	validator   *validator.Validate
}

func NewTodoHandler(todoService *service.TodoService) *TodoHandler {
	return &TodoHandler{
		todoService: todoService,
		validator:   validator.New(),
	}
}

func (h *TodoHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	var req models.CreateTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.ValidationError(w, err)
		return
	}

	todo, err := h.todoService.Create(r.Context(), req, userID)
	if err != nil {
		// Log the actual error for debugging
		println("Error creating todo:", err.Error())
		response.Error(w, http.StatusInternalServerError, "failed to create todo: "+err.Error())
		return
	}

	response.Success(w, http.StatusCreated, todo, "todo created successfully")
}

func (h *TodoHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	// Parse filters from query params
	filters := models.TodoFilters{}

	if status := r.URL.Query().Get("status"); status != "" {
		s := models.TodoStatus(status)
		filters.Status = &s
	}

	if priority := r.URL.Query().Get("priority"); priority != "" {
		p := models.TodoPriority(priority)
		filters.Priority = &p
	}

	if search := r.URL.Query().Get("search"); search != "" {
		filters.Search = &search
	}

	if tags := r.URL.Query().Get("tags"); tags != "" {
		// Split tags by comma
		filters.Tags = []string{tags}
	}

	todos, err := h.todoService.GetAll(r.Context(), userID, filters)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch todos")
		return
	}

	response.Success(w, http.StatusOK, todos, "todos fetched successfully")
}

func (h *TodoHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid todo id")
		return
	}

	todo, err := h.todoService.GetByID(r.Context(), id, userID)
	if err != nil {
		if err.Error() == "todo not found" {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to fetch todo")
		return
	}

	response.Success(w, http.StatusOK, todo, "todo fetched successfully")
}

func (h *TodoHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid todo id")
		return
	}

	var req models.UpdateTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.ValidationError(w, err)
		return
	}

	todo, err := h.todoService.Update(r.Context(), id, req, userID)
	if err != nil {
		if err.Error() == "todo not found" {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to update todo")
		return
	}

	response.Success(w, http.StatusOK, todo, "todo updated successfully")
}

func (h *TodoHandler) MarkAsCompleted(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid todo id")
		return
	}

	todo, err := h.todoService.MarkAsCompleted(r.Context(), id, userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to mark todo as completed")
		return
	}

	response.Success(w, http.StatusOK, todo, "todo marked as completed")
}

func (h *TodoHandler) MarkAsIncomplete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid todo id")
		return
	}

	todo, err := h.todoService.MarkAsIncomplete(r.Context(), id, userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to mark todo as incomplete")
		return
	}

	response.Success(w, http.StatusOK, todo, "todo marked as incomplete")
}

func (h *TodoHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid todo id")
		return
	}

	if err := h.todoService.Delete(r.Context(), id, userID); err != nil {
		println("Error deleting todo:", err.Error())
		if err.Error() == "sql: no rows in result set" {
			response.Error(w, http.StatusNotFound, "todo not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to delete todo: "+err.Error())
		return
	}

	response.Success(w, http.StatusOK, nil, "todo deleted successfully")
}
