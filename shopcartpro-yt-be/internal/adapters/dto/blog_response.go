package dto

import "time"

type AuthorResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

type BlogCategoryResponse struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Slug  string `json:"slug"`
}

type BlogResponse struct {
	ID           string                 `json:"id"`
	Title        string                 `json:"title"`
	Slug         string                 `json:"slug"`
	Excerpt      string                 `json:"excerpt"`
	Body         string                 `json:"body"`
	MainImageURL *string                `json:"mainImageUrl"`
	IsLatest     bool                   `json:"isLatest"`
	PublishedAt  *time.Time             `json:"publishedAt"`
	SeoTitle     *string                `json:"seoTitle"`
	SeoDesc      *string                `json:"seoDescription"`
	Author       AuthorResponse         `json:"author"`
	Categories   []BlogCategoryResponse `json:"categories"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
