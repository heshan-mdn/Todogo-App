package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/yourusername/todogo-backend/internal/database"
	"github.com/yourusername/todogo-backend/internal/models"
)

type TodoRepository struct {
	db *database.DB
}

func NewTodoRepository(db *database.DB) *TodoRepository {
	return &TodoRepository{db: db}
}

func (r *TodoRepository) Create(ctx context.Context, todo *models.Todo) error {
	query := `
		INSERT INTO todos (id, title, description, completed, status, priority, user_id, created_at, updated_at, completed_at, due_date, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	`

	todo.ID = uuid.New()
	now := time.Now()
	todo.CreatedAt = now
	todo.UpdatedAt = now
	todo.Completed = false
	todo.Status = models.StatusPending

	if todo.Priority == "" {
		todo.Priority = models.PriorityMedium
	}

	if todo.Tags == nil {
		todo.Tags = pq.StringArray{}
	}

	err := r.db.QueryRowContext(
		ctx,
		query,
		todo.ID,
		todo.Title,
		todo.Description,
		todo.Completed,
		todo.Status,
		todo.Priority,
		todo.UserID,
		todo.CreatedAt,
		todo.UpdatedAt,
		todo.CompletedAt,
		todo.DueDate,
		todo.Tags,
	).Scan(&todo.ID, &todo.CreatedAt, &todo.UpdatedAt)

	return err
}

func (r *TodoRepository) GetByID(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*models.Todo, error) {
	query := `
		SELECT id, title, description, completed, status, priority, user_id, created_at, updated_at, completed_at, due_date, tags
		FROM todos
		WHERE id = $1 AND user_id = $2
	`

	todo := &models.Todo{}
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&todo.ID,
		&todo.Title,
		&todo.Description,
		&todo.Completed,
		&todo.Status,
		&todo.Priority,
		&todo.UserID,
		&todo.CreatedAt,
		&todo.UpdatedAt,
		&todo.CompletedAt,
		&todo.DueDate,
		&todo.Tags,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return todo, nil
}

func (r *TodoRepository) GetAll(ctx context.Context, userID uuid.UUID, filters models.TodoFilters) ([]*models.Todo, error) {
	query := `
		SELECT id, title, description, completed, status, priority, user_id, created_at, updated_at, completed_at, due_date, tags
		FROM todos
		WHERE user_id = $1
	`

	args := []interface{}{userID}
	argCount := 1

	// Apply filters
	if filters.Status != nil {
		argCount++
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, *filters.Status)
	}

	if filters.Priority != nil {
		argCount++
		query += fmt.Sprintf(" AND priority = $%d", argCount)
		args = append(args, *filters.Priority)
	}

	if filters.Search != nil && *filters.Search != "" {
		argCount++
		searchPattern := "%" + *filters.Search + "%"
		query += fmt.Sprintf(" AND (title ILIKE $%d OR description ILIKE $%d)", argCount, argCount)
		args = append(args, searchPattern)
	}

	if len(filters.Tags) > 0 {
		argCount++
		query += fmt.Sprintf(" AND tags && $%d", argCount)
		args = append(args, pq.Array(filters.Tags))
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	todos := []*models.Todo{}
	for rows.Next() {
		todo := &models.Todo{}
		err := rows.Scan(
			&todo.ID,
			&todo.Title,
			&todo.Description,
			&todo.Completed,
			&todo.Status,
			&todo.Priority,
			&todo.UserID,
			&todo.CreatedAt,
			&todo.UpdatedAt,
			&todo.CompletedAt,
			&todo.DueDate,
			&todo.Tags,
		)
		if err != nil {
			return nil, err
		}
		todos = append(todos, todo)
	}

	return todos, rows.Err()
}

func (r *TodoRepository) Update(ctx context.Context, todo *models.Todo) error {
	query := `
		UPDATE todos
		SET title = $1, description = $2, priority = $3, due_date = $4, tags = $5, updated_at = $6
		WHERE id = $7 AND user_id = $8
	`

	todo.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		todo.Title,
		todo.Description,
		todo.Priority,
		todo.DueDate,
		todo.Tags,
		todo.UpdatedAt,
		todo.ID,
		todo.UserID,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *TodoRepository) UpdateStatus(ctx context.Context, id uuid.UUID, userID uuid.UUID, completed bool) error {
	var query string
	var args []interface{}

	if completed {
		now := time.Now()
		query = `
			UPDATE todos
			SET completed = true, status = $1, completed_at = $2, updated_at = $3
			WHERE id = $4 AND user_id = $5
		`
		args = []interface{}{models.StatusCompleted, now, now, id, userID}
	} else {
		query = `
			UPDATE todos
			SET completed = false, status = $1, completed_at = NULL, updated_at = $2
			WHERE id = $3 AND user_id = $4
		`
		args = []interface{}{models.StatusPending, time.Now(), id, userID}
	}

	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *TodoRepository) Delete(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM todos WHERE id = $1 AND user_id = $2`
	
	result, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
