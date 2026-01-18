package router

import (
	postgresql "module-shop/internal/adapters/db"
	"module-shop/internal/adapters/http"
	"module-shop/internal/infrastructure/api"
	"module-shop/internal/infrastructure/clients"
	"module-shop/internal/infrastructure/repository"
	"module-shop/internal/shared/config"
	"module-shop/internal/shared/utils"

	"github.com/gin-gonic/gin"
	// [scaffold:domain_imports]
	blogDomain "module-shop/internal/domain/blog"
)

func InitRouter(db *postgresql.PostgresDB) *gin.Engine {

	mode := config.GetEnv("GIN_MODE", "release")
	gin.SetMode(mode)

	router := gin.Default()
	router.Use(gin.Recovery())
	router.Use(utils.CORSMiddleware())
	router.Use(gin.Logger())

	app := router.Group("service-blog/v1/api")

	app.GET("/health-check", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	// [scaffold:repo_init]
	blogRepository := repository.NewBlogRepository(db.PG)

	// [scaffold:service_init]
	blogService := blogDomain.NewBlogService(blogRepository)

	// [scaffold:api_init]
	authorClient := clients.NewAuthorHTTPClientFromEnv()
	blogApi := api.NewBlogApi(*blogService, authorClient)

	// [scaffold:http_register]
	http.NewBlogHttpHandler(app, blogApi).RegisterBlogRoutes()

	return router
}
