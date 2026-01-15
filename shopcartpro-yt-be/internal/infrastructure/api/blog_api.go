package api

import (
	blogDomain "module-shop/internal/domain/blog"
)

// AuthorClient là client gọi sang Auth/User service
type AuthorClient interface {
	FindLiteByID(authorID string) (*blogDomain.AuthorLite, error)
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
		author, _ := a.authorClient.FindLiteByID(res.AuthorID)
		res.Author = author
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
	if a.authorClient == nil {
		return
	}
	// đơn giản: gọi từng cái (sau này bạn tối ưu batch)
	for i := range list {
		author, _ := a.authorClient.FindLiteByID(list[i].AuthorID)
		list[i].Author = author
	}
}
