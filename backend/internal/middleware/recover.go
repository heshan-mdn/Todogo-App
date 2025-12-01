package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/rs/zerolog/log"
	"github.com/yourusername/todogo-backend/pkg/response"
)

func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Error().
					Interface("error", err).
					Bytes("stack", debug.Stack()).
					Msg("Panic recovered")

				response.Error(w, http.StatusInternalServerError, "internal server error")
			}
		}()

		next.ServeHTTP(w, r)
	})
}
