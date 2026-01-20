package blogDomain

import "errors"

var ErrNotFound = errors.New("blog not found")

type BlogService struct {
	repository Repository
}

func NewBlogService(r Repository) *BlogService {
	return &BlogService{repository: r}
}

func (s *BlogService) Create(authorID string, req CreateRequest) (Blog, error) {
	return s.repository.Create(authorID, req)
}

func (s *BlogService) FindAll() ([]BlogResponse, error) {
	return s.repository.FindAll()
}

func (s *BlogService) FindAllBlogCategories() ([]BlogCategory, error) {
	return s.repository.FindAllBlogCategories()
}

func (s *BlogService) FindOthersBySlug(slug string, limit int) ([]BlogResponse, error) {
	if limit <= 0 {
		limit = 4
	}
	return s.repository.FindOthersBySlug(slug, limit)
}

func (s *BlogService) FindLatest(limit int) ([]BlogResponse, error) {
	if limit <= 0 {
		limit = 4
	}
	return s.repository.FindLatest(limit)
}

func (s *BlogService) FindBySlug(slug string) (BlogResponse, error) {
	return s.repository.FindBySlug(slug)
}

func (s *BlogService) Update(id string, req UpdateRequest) (Blog, error) {
	_, err := s.repository.FindByID(id)
	if err != nil {
		return Blog{}, err
	}
	return s.repository.Update(id, req)
}

func (s *BlogService) Remove(id string) (bool, error) {
	_, err := s.repository.FindByID(id)
	if err != nil {
		return false, err
	}
	return s.repository.SoftDelete(id)
}
