package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type TodoStatus string
type TodoPriority string

const (
	StatusPending   TodoStatus = "pending"
	StatusCompleted TodoStatus = "completed"
)

const (
	PriorityLow    TodoPriority = "low"
	PriorityMedium TodoPriority = "medium"
	PriorityHigh   TodoPriority = "high"
)

type Todo struct {
	ID          uuid.UUID     `json:"id" db:"id"`
	Title       string        `json:"title" db:"title" validate:"required,min=1,max=200"`
	Description *string       `json:"description" db:"description" validate:"omitempty,max=1000"`
	Completed   bool          `json:"completed" db:"completed"`
	Status      TodoStatus    `json:"status" db:"status"`
	Priority    TodoPriority  `json:"priority" db:"priority"`
	UserID      uuid.UUID     `json:"user_id" db:"user_id"`
	CreatedAt   time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at" db:"updated_at"`
	CompletedAt *time.Time    `json:"completed_at" db:"completed_at"`
	DueDate     *time.Time    `json:"due_date" db:"due_date"`
	Tags        pq.StringArray `json:"tags" db:"tags"`
}

type CreateTodoRequest struct {
	Title       string        `json:"title" validate:"required,min=1,max=200"`
	Description *string       `json:"description" validate:"omitempty,max=1000"`
	Priority    *TodoPriority `json:"priority" validate:"omitempty,oneof=low medium high"`
	DueDate     *time.Time    `json:"due_date"`
	Tags        []string      `json:"tags"`
}

type UpdateTodoRequest struct {
	Title       *string       `json:"title" validate:"omitempty,min=1,max=200"`
	Description *string       `json:"description" validate:"omitempty,max=1000"`
	Priority    *TodoPriority `json:"priority" validate:"omitempty,oneof=low medium high"`
	DueDate     *time.Time    `json:"due_date"`
	Tags        []string      `json:"tags"`
}

type TodoFilters struct {
	Status   *TodoStatus   `json:"status"`
	Priority *TodoPriority `json:"priority"`
	Search   *string       `json:"search"`
	Tags     []string      `json:"tags"`
}

// Scan implements sql.Scanner interface
func (t *TodoStatus) Scan(value interface{}) error {
	*t = TodoStatus(value.(string))
	return nil
}

// Value implements driver.Valuer interface
func (t TodoStatus) Value() (driver.Value, error) {
	return string(t), nil
}

// Scan implements sql.Scanner interface
func (p *TodoPriority) Scan(value interface{}) error {
	*p = TodoPriority(value.(string))
	return nil
}

// Value implements driver.Valuer interface
func (p TodoPriority) Value() (driver.Value, error) {
	return string(p), nil
}

// MarshalJSON for Tags
func (t Todo) MarshalJSON() ([]byte, error) {
	type Alias Todo
	tags := t.Tags
	if tags == nil {
		tags = []string{}
	}
	return json.Marshal(&struct {
		Tags []string `json:"tags"`
		*Alias
	}{
		Tags:  tags,
		Alias: (*Alias)(&t),
	})
}
