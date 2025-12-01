package response

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

func Success(w http.ResponseWriter, statusCode int, data interface{}, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func Error(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Message: message,
	})
}

func ValidationError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)

	var errors []string
	for _, err := range err.(validator.ValidationErrors) {
		errors = append(errors, err.Field()+" "+err.Tag())
	}

	json.NewEncoder(w).Encode(Response{
		Success: false,
		Message: "validation failed",
		Errors:  errors,
	})
}
