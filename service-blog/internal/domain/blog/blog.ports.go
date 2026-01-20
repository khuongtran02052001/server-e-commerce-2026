package blogDomain

type Service interface {
	Create(authorID string, req CreateRequest) (Blog, error)
	FindAll() ([]BlogResponse, error)
	FindAllBlogCategories() ([]BlogCategory, error)
	FindLatest(limit int) ([]BlogResponse, error)
	FindBySlug(slug string) (BlogResponse, error)
	Update(id string, req UpdateRequest) (Blog, error)
	Remove(id string) (bool, error)
}

type Repository interface {
	Create(authorID string, req CreateRequest) (Blog, error)
	FindAll() ([]BlogResponse, error)
	FindAllBlogCategories() ([]BlogCategory, error)
	FindLatest(limit int) ([]BlogResponse, error)
	FindBySlug(slug string) (BlogResponse, error)
	FindByID(id string) (Blog, error)
	Update(id string, req UpdateRequest) (Blog, error)
	SoftDelete(id string) (bool, error)
}
