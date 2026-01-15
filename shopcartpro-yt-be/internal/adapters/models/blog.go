package models

import (
	"time"

	"gorm.io/datatypes"
)

type Blog struct {
	ID           string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey;column:id"`
	Title        string         `gorm:"column:title;not null"`
	Slug         string         `gorm:"column:slug;uniqueIndex;not null"`
	Excerpt      *string        `gorm:"column:excerpt"`
	Body         datatypes.JSON `gorm:"column:body;type:jsonb;not null"`
	MainImageURL *string        `gorm:"column:main_image_url"`

	IsLatest    bool       `gorm:"column:is_latest;default:false;index"`
	PublishedAt *time.Time `gorm:"column:published_at;index"`

	SeoTitle       *string `gorm:"column:seo_title"`
	SeoDescription *string `gorm:"column:seo_description"`

	AuthorID string `gorm:"column:author_id;type:uuid;index;not null"`

	// many-to-many qua join table rõ ràng
	Categories []BlogCategory `gorm:"many2many:blog_blog_categories;joinForeignKey:BlogID;joinReferences:CategoryID"`

	CreatedAt time.Time  `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time  `gorm:"column:updated_at;autoUpdateTime"`
	DeletedAt *time.Time `gorm:"column:deleted_at"`
}

func (Blog) TableName() string { return "blogs" }

type BlogCategory struct {
	ID    string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;column:id"`
	Title string `gorm:"column:title;not null"`
	Slug  string `gorm:"column:slug;uniqueIndex;not null"`

	Blogs []Blog `gorm:"many2many:blog_blog_categories;joinForeignKey:CategoryID;joinReferences:BlogID"`

	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime"`
}

func (BlogCategory) TableName() string { return "blog_categories" }

// Join table explicit: tên + 2 cột khoá chính
type BlogBlogCategory struct {
	BlogID     string `gorm:"column:blog_id;type:uuid;primaryKey"`
	CategoryID string `gorm:"column:category_id;type:uuid;primaryKey"`
}

func (BlogBlogCategory) TableName() string { return "blog_blog_categories" }
