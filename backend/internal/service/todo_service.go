package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/yourusername/todogo-backend/internal/models"
	"github.com/yourusername/todogo-backend/internal/repository"
)

type TodoService struct {
	todoRepo *repository.TodoRepository
}

func NewTodoService(todoRepo *repository.TodoRepository) *TodoService {
	return &TodoService{
		todoRepo: todoRepo,
	}
}

func (s *TodoService) Create(ctx context.Context, req models.CreateTodoRequest, userID uuid.UUID) (*models.Todo, error) {
	priority := models.PriorityMedium
	if req.Priority != nil {
		priority = *req.Priority
	}

	todo := &models.Todo{
		Title:       req.Title,
		Description: req.Description,
		Priority:    priority,
		UserID:      userID,
		DueDate:     req.DueDate,
		Tags:        req.Tags,
	}

	if err := s.todoRepo.Create(ctx, todo); err != nil {
		return nil, err
	}

	return todo, nil
}

func (s *TodoService) GetByID(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*models.Todo, error) {
	todo, err := s.todoRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	if todo == nil {
		return nil, errors.New("todo not found")
	}
	return todo, nil
}

func (s *TodoService) GetAll(ctx context.Context, userID uuid.UUID, filters models.TodoFilters) ([]*models.Todo, error) {
	return s.todoRepo.GetAll(ctx, userID, filters)
}

func (s *TodoService) Update(ctx context.Context, id uuid.UUID, req models.UpdateTodoRequest, userID uuid.UUID) (*models.Todo, error) {
	todo, err := s.todoRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	if todo == nil {
		return nil, errors.New("todo not found")
	}

	// Update fields
	if req.Title != nil {
		todo.Title = *req.Title
	}
	if req.Description != nil {
		todo.Description = req.Description
	}
	if req.Priority != nil {
		todo.Priority = *req.Priority
	}
	if req.DueDate != nil {
		todo.DueDate = req.DueDate
	}
	if req.Tags != nil {
		todo.Tags = req.Tags
	}

	if err := s.todoRepo.Update(ctx, todo); err != nil {
		return nil, err
	}

	return todo, nil
}

func (s *TodoService) MarkAsCompleted(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*models.Todo, error) {
	if err := s.todoRepo.UpdateStatus(ctx, id, userID, true); err != nil {
		return nil, err
	}

	return s.todoRepo.GetByID(ctx, id, userID)
}

func (s *TodoService) MarkAsIncomplete(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*models.Todo, error) {
	if err := s.todoRepo.UpdateStatus(ctx, id, userID, false); err != nil {
		return nil, err
	}

	return s.todoRepo.GetByID(ctx, id, userID)
}

func (s *TodoService) Delete(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.todoRepo.Delete(ctx, id, userID)
}
