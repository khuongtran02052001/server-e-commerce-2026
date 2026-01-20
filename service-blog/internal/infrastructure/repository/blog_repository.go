package repository

import (
	"encoding/json"
	"errors"
	"time"

	"module-shop/internal/adapters/models"
	blogDomain "module-shop/internal/domain/blog"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type BlogRepository struct {
	db *gorm.DB
}

func NewBlogRepository(db *gorm.DB) *BlogRepository {
	return &BlogRepository{db: db.Debug()}
}

func (r *BlogRepository) Create(authorID string, req blogDomain.CreateRequest) (blogDomain.Blog, error) {
	var publishedAt *time.Time
	if req.PublishedAt != nil && *req.PublishedAt != "" {
		t, err := time.Parse(time.RFC3339, *req.PublishedAt)
		if err != nil {
			return blogDomain.Blog{}, err
		}
		publishedAt = &t
	}

	isLatest := false
	if req.IsLatest != nil {
		isLatest = *req.IsLatest
	}

	m := models.Blog{
		Title:          req.Title,
		Slug:           req.Slug,
		Excerpt:        req.Excerpt,
		Body:           datatypes.JSON(req.Body), // RawMessage is []byte, assignable to datatypes.JSON? -> need cast below
		MainImageURL:   req.MainImageURL,
		IsLatest:       isLatest,
		PublishedAt:    publishedAt,
		SeoTitle:       req.SeoTitle,
		SeoDescription: req.SeoDesc,
		AuthorID:       authorID,
	}

	// cast body
	m.Body = models.JSONFromRaw(req.Body)

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&m).Error; err != nil {
			return err
		}
		if len(req.CategoryIDs) > 0 {
			var cats []models.BlogCategory
			if err := tx.Where("id IN ?", req.CategoryIDs).Find(&cats).Error; err != nil {
				return err
			}
			if err := tx.Model(&m).Association("Categories").Replace(&cats); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return blogDomain.Blog{}, err
	}

	return mapDomainBlog(m), nil
}

func (r *BlogRepository) FindAll() ([]blogDomain.BlogResponse, error) {
	var rows []models.Blog
	err := r.db.
		Where("deleted_at IS NULL").
		Preload("Categories").
		Order("published_at DESC NULLS LAST").
		Order("created_at DESC").
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]blogDomain.BlogResponse, 0, len(rows))
	for _, m := range rows {
		out = append(out, mapBlogResponse(m))
	}
	return out, nil
}

func (r *BlogRepository) FindAllBlogCategories() ([]blogDomain.BlogCategory, error) {
	var rows []models.BlogCategory
	err := r.db.
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]blogDomain.BlogCategory, 0, len(rows))
	for _, m := range rows {
		out = append(out, blogDomain.BlogCategory{
			ID:    m.ID,
			Title: m.Title,
			Slug:  m.Slug,
		})
	}
	return out, nil
}

func (r *BlogRepository) FindLatest(limit int) ([]blogDomain.BlogResponse, error) {
	if limit <= 0 {
		limit = 4
	}
	var rows []models.Blog
	err := r.db.
		Where("deleted_at IS NULL").
		Where("published_at IS NOT NULL").
		Preload("Categories").
		Order("published_at DESC").
		Limit(limit).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]blogDomain.BlogResponse, 0, len(rows))
	for _, m := range rows {
		out = append(out, mapBlogResponse(m))
	}
	return out, nil
}

func (r *BlogRepository) FindBySlug(slug string) (blogDomain.BlogResponse, error) {
	var m models.Blog
	err := r.db.
		Where("deleted_at IS NULL").
		Where("slug = ?", slug).
		Preload("Categories").
		First(&m).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return blogDomain.BlogResponse{}, blogDomain.ErrNotFound
	}
	if err != nil {
		return blogDomain.BlogResponse{}, err
	}
	return mapBlogResponse(m), nil
}

func (r *BlogRepository) FindByID(id string) (blogDomain.Blog, error) {
	var m models.Blog
	err := r.db.Where("deleted_at IS NULL").Where("id = ?", id).First(&m).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return blogDomain.Blog{}, blogDomain.ErrNotFound
	}
	return mapDomainBlog(m), err
}

func (r *BlogRepository) Update(id string, req blogDomain.UpdateRequest) (blogDomain.Blog, error) {
	var updated blogDomain.Blog

	err := r.db.Transaction(func(tx *gorm.DB) error {
		var m models.Blog
		if err := tx.Where("deleted_at IS NULL").Where("id = ?", id).First(&m).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return blogDomain.ErrNotFound
			}
			return err
		}

		updates := map[string]any{}

		if req.Title != nil {
			updates["title"] = *req.Title
		}
		if req.Slug != nil {
			updates["slug"] = *req.Slug
		}
		if req.Excerpt != nil {
			updates["excerpt"] = *req.Excerpt
		}
		if req.Body != nil {
			updates["body"] = []byte(*req.Body)
		}
		if req.MainImageURL != nil {
			updates["main_image_url"] = req.MainImageURL
		}
		if req.IsLatest != nil {
			updates["is_latest"] = *req.IsLatest
		}
		if req.PublishedAt != nil {
			if *req.PublishedAt == nil {
				updates["published_at"] = nil
			} else {
				t, err := time.Parse(time.RFC3339, **req.PublishedAt)
				if err != nil {
					return err
				}
				updates["published_at"] = &t
			}
		}
		if req.SeoTitle != nil {
			updates["seo_title"] = req.SeoTitle
		}
		if req.SeoDesc != nil {
			updates["seo_description"] = req.SeoDesc
		}

		if len(updates) > 0 {
			if err := tx.Model(&models.Blog{}).
				Where("id = ? AND deleted_at IS NULL", id).
				Updates(updates).Error; err != nil {
				return err
			}
		}

		if req.CategoryIDs != nil {
			var cats []models.BlogCategory
			if len(*req.CategoryIDs) > 0 {
				if err := tx.Where("id IN ?", *req.CategoryIDs).Find(&cats).Error; err != nil {
					return err
				}
			}
			if err := tx.Model(&m).Association("Categories").Replace(&cats); err != nil {
				return err
			}
		}

		var re models.Blog
		if err := tx.Where("id = ?", id).First(&re).Error; err != nil {
			return err
		}
		updated = mapDomainBlog(re)
		return nil
	})

	if errors.Is(err, blogDomain.ErrNotFound) {
		return blogDomain.Blog{}, blogDomain.ErrNotFound
	}
	return updated, err
}

func (r *BlogRepository) SoftDelete(id string) (bool, error) {
	now := time.Now()
	res := r.db.Model(&models.Blog{}).
		Where("id = ? AND deleted_at IS NULL", id).
		Update("deleted_at", &now)

	if res.Error != nil {
		return false, res.Error
	}
	if res.RowsAffected == 0 {
		return false, blogDomain.ErrNotFound
	}
	return true, nil
}

func mapDomainBlog(m models.Blog) blogDomain.Blog {
	return blogDomain.Blog{
		ID:           m.ID,
		Title:        m.Title,
		Slug:         m.Slug,
		Excerpt:      m.Excerpt,
		Body:         json.RawMessage(m.Body), // ✅ jsonb -> RawMessage
		MainImageURL: m.MainImageURL,
		IsLatest:     m.IsLatest,
		PublishedAt:  m.PublishedAt,
		SeoTitle:     m.SeoTitle,
		SeoDesc:      m.SeoDescription,
		AuthorID:     m.AuthorID,
		DeletedAt:    m.DeletedAt,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}

func mapBlogResponse(m models.Blog) blogDomain.BlogResponse {
	res := blogDomain.BlogResponse{
		Blog:       mapDomainBlog(m),
		Categories: make([]blogDomain.BlogCategory, 0, len(m.Categories)),
		Author:     nil, // ✅ microservice: fill ở API layer nếu cần
	}

	for _, c := range m.Categories {
		res.Categories = append(res.Categories, blogDomain.BlogCategory{
			ID:    c.ID,
			Title: c.Title,
			Slug:  c.Slug,
		})
	}

	return res
}
