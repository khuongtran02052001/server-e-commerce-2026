package http

import (
	"net/http"
	"strconv"

	blogDomain "module-shop/internal/domain/blog"

	"github.com/gin-gonic/gin"
)

type BlogHttpHandler struct {
	blogInput blogDomain.Service
	app       *gin.RouterGroup
}

func NewBlogHttpHandler(app *gin.RouterGroup, blogInput blogDomain.Service) *BlogHttpHandler {
	return &BlogHttpHandler{blogInput: blogInput, app: app}
}

func (h *BlogHttpHandler) RegisterBlogRoutes() {
	blogs := h.app.Group("/")
	blogs.GET("", h.FindAll)
	blogs.GET("/latest", h.Latest)
	blogs.GET("/slug/:slug", h.FindBySlug)

	blogs.POST("", h.Create) // add auth middleware here if needed
	blogs.PATCH("/:id", h.Update)
	blogs.DELETE("/:id", h.Remove)
}

func (h *BlogHttpHandler) FindAll(c *gin.Context) {
	list, err := h.blogInput.FindAll()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": list})
}

func (h *BlogHttpHandler) Latest(c *gin.Context) {
	limit := 4
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	list, err := h.blogInput.FindLatest(limit)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": list})
}

func (h *BlogHttpHandler) FindBySlug(c *gin.Context) {
	slug := c.Param("slug")
	item, err := h.blogInput.FindBySlug(slug)
	if err == blogDomain.ErrNotFound {
		c.JSON(404, gin.H{"error": "Blog not found"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": item})
}

func (h *BlogHttpHandler) Create(c *gin.Context) {
	var req blogDomain.CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	authorID := c.GetString("userID") // set từ auth middleware
	if authorID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	created, err := h.blogInput.Create(authorID, req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"data": created})
}

func (h *BlogHttpHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req blogDomain.UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	updated, err := h.blogInput.Update(id, req)
	if err == blogDomain.ErrNotFound {
		c.JSON(404, gin.H{"error": "Blog not found"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": updated})
}

func (h *BlogHttpHandler) Remove(c *gin.Context) {
	id := c.Param("id")
	ok, err := h.blogInput.Remove(id)
	if err == blogDomain.ErrNotFound {
		c.JSON(404, gin.H{"error": "Blog not found"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"data": ok})
}
