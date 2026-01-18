package blogDomain

import (
	"encoding/json"
	"time"
)

type Blog struct {
	ID           string          `json:"id"`
	Title        string          `json:"title"`
	Slug         string          `json:"slug"`
	Excerpt      *string         `json:"excerpt"`
	Body         json.RawMessage `json:"body"` // ✅ domain clean, không phụ thuộc gorm
	MainImageURL *string         `json:"mainImageUrl"`

	IsLatest    bool       `json:"isLatest"`
	PublishedAt *time.Time `json:"publishedAt"`

	SeoTitle *string `json:"seoTitle"`
	SeoDesc  *string `json:"seoDescription"`

	AuthorID  string     `json:"authorId"` // ✅ microservice: chỉ giữ ID
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt"`
}

type BlogCategory struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Slug  string `json:"slug"`
}

type AuthorLite struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type BlogResponse struct {
	Blog
	Categories []BlogCategory `json:"categories"`
	Author     *AuthorLite    `json:"author,omitempty"` // optional: fill ở API layer
}

type CreateRequest struct {
	Title        string          `json:"title" binding:"required"`
	Slug         string          `json:"slug" binding:"required"`
	Excerpt      *string         `json:"excerpt"`
	Body         json.RawMessage `json:"body" binding:"required"` // client gửi JSON
	MainImageURL *string         `json:"mainImageUrl"`

	IsLatest    *bool   `json:"isLatest"`
	PublishedAt *string `json:"publishedAt"` // RFC3339

	SeoTitle *string `json:"seoTitle"`
	SeoDesc  *string `json:"seoDescription"`

	CategoryIDs []string `json:"categoryIds"`
}

type UpdateRequest struct {
	Title        *string          `json:"title"`
	Slug         *string          `json:"slug"`
	Excerpt      *string          `json:"excerpt"`
	Body         *json.RawMessage `json:"body"`
	MainImageURL *string          `json:"mainImageUrl"`

	IsLatest    *bool    `json:"isLatest"`
	PublishedAt **string `json:"publishedAt"` // nil=not provided, &nil=set null, &"..."=set value

	SeoTitle *string `json:"seoTitle"`
	SeoDesc  *string `json:"seoDescription"`

	CategoryIDs *[]string `json:"categoryIds"` // nil=not provided, non-nil=replace all
}
