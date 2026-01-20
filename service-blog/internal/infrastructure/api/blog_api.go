package api

import (
	blogDomain "module-shop/internal/domain/blog"
)

// AuthorClient là client gọi sang Auth/User service
type AuthorClient interface {
	BatchFindLiteByIDs(authorIDs []string) (map[string]blogDomain.AuthorLite, error)
}

type BlogApi struct {
	blogService  blogDomain.BlogService
	authorClient AuthorClient // optional
}

func NewBlogApi(blogService blogDomain.BlogService, authorClient AuthorClient) *BlogApi {
	return &BlogApi{blogService: blogService, authorClient: authorClient}
}

func (a *BlogApi) Create(authorID string, req blogDomain.CreateRequest) (blogDomain.Blog, error) {
	return a.blogService.Create(authorID, req)
}

func (a *BlogApi) FindAll() ([]blogDomain.BlogResponse, error) {
	list, err := a.blogService.FindAll()
	if err != nil {
		return nil, err
	}
	a.fillAuthors(list)
	return list, nil
}

func (a *BlogApi) FindAllBlogCategories() ([]blogDomain.BlogCategory, error) {
	list, err := a.blogService.FindAllBlogCategories()
	if err != nil {
		return nil, err
	}
	return list, nil
}

func (a *BlogApi) FindLatest(limit int) ([]blogDomain.BlogResponse, error) {
	list, err := a.blogService.FindLatest(limit)
	if err != nil {
		return nil, err
	}
	a.fillAuthors(list)
	return list, nil
}

func (a *BlogApi) FindBySlug(slug string) (blogDomain.BlogResponse, error) {
	res, err := a.blogService.FindBySlug(slug)
	if err != nil {
		return blogDomain.BlogResponse{}, err
	}
	if a.authorClient != nil && res.AuthorID != "" {
		m, _ := a.authorClient.BatchFindLiteByIDs([]string{res.AuthorID})
		if u, ok := m[res.AuthorID]; ok {
			u2 := u
			res.Author = &u2
		}
	}

	return res, nil
}

func (a *BlogApi) Update(id string, req blogDomain.UpdateRequest) (blogDomain.Blog, error) {
	return a.blogService.Update(id, req)
}

func (a *BlogApi) Remove(id string) (bool, error) {
	return a.blogService.Remove(id)
}

func (a *BlogApi) fillAuthors(list []blogDomain.BlogResponse) {
	if a.authorClient == nil || len(list) == 0 {
		return
	}

	ids := make([]string, 0, len(list))
	seen := map[string]struct{}{}

	for _, b := range list {
		if b.AuthorID == "" {
			continue
		}
		if _, ok := seen[b.AuthorID]; ok {
			continue
		}
		seen[b.AuthorID] = struct{}{}
		ids = append(ids, b.AuthorID)
	}

	m, err := a.authorClient.BatchFindLiteByIDs(ids)
	if err != nil {
		// graceful degrade: auth lỗi thì vẫn trả blog, author nil
		return
	}

	for i := range list {
		if u, ok := m[list[i].AuthorID]; ok {
			u2 := u
			list[i].Author = &u2
		}
	}
}
