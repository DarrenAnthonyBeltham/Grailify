package database

import (
	"database/sql"
	"grailify/backend/internal/model"
)

type UserRepo struct {
	DB *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{DB: db}
}

func (r *UserRepo) CreateUser(user *model.User) error {
	query := "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
	_, err := r.DB.Exec(query, user.Username, user.Email, user.PasswordHash, user.CreatedAt)
	return err
}

func (r *UserRepo) GetUserByEmail(email string) (*model.User, error) {
	query := "SELECT id, username, email, password_hash, created_at FROM users WHERE email = ?"
	row := r.DB.QueryRow(query, email)

	user := &model.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}