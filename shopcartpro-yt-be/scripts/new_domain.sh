#!/usr/bin/env sh
set -eu

DOMAIN_RAW="${1:-}"
if [ -z "$DOMAIN_RAW" ]; then
  echo "Usage: sh scripts/new_domain.sh <domain>"
  exit 1
fi

MODULE="$(awk 'NR==1 && $1=="module"{print $2}' go.mod 2>/dev/null || true)"
if [ -z "$MODULE" ]; then
  echo "❌ Cannot read module name from go.mod"
  exit 1
fi

# domain folder name: snake_case only
DOMAIN="$(echo "$DOMAIN_RAW" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9_-' | tr '-' '_' )"

# PascalCase helper: comment_like -> CommentLike
pascal() {
  echo "$1" | awk -F'_' '{
    for (i=1; i<=NF; i++) $i=toupper(substr($i,1,1)) substr($i,2);
    OFS=""; print $0
  }'
}

DP="$(pascal "$DOMAIN")"                 # CommentLike
LC="$(echo "$DP" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')"  # commentLike
PKG="${LC}Domain"                        # commentLikeDomain (style: blogDomain, notificationDomain)

DOMAIN_DIR="internal/domain/$DOMAIN"
API_DIR="internal/infrastructure/api"
REPO_DIR="internal/infrastructure/repository"
HTTP_DIR="internal/adapters/http"
MODEL_DIR="internal/adapters/models"
ROUTER_FILE="internal/router/router.go"

mkdir -p "$DOMAIN_DIR" "$API_DIR" "$REPO_DIR" "$HTTP_DIR" "$MODEL_DIR"

# ---------------------------
# Domain: port.go
# ---------------------------
PORT_FILE="$DOMAIN_DIR/port.go"
[ -f "$PORT_FILE" ] || cat > "$PORT_FILE" <<EOF
package $PKG

type Service interface {
	List() ([]${DP}Response, error)
	Create(request CreateRequest) (bool, error)
	FindByID(id string) (${DP}Response, error)
	Update(id string, request UpdateRequest) (bool, error)
	Remove(id string) (bool, error)
}

type Repository interface {
	FindAll() ([]${DP}Response, error)
	Insert(request CreateRequest) (bool, error)
	FindByID(id string) (${DP}Response, error)
	Update(id string, request UpdateRequest) (bool, error)
	SoftDelete(id string) (bool, error)
}
EOF

# ---------------------------
# Domain: type.go
# ---------------------------
TYPE_FILE="$DOMAIN_DIR/type.go"
[ -f "$TYPE_FILE" ] || cat > "$TYPE_FILE" <<EOF
package $PKG

import "errors"

var ErrNotFound = errors.New("${DOMAIN} not found")

type ${DP}Response struct {
	ID string \`json:"id"\`
}

type CreateRequest struct {
	// TODO: add fields
}

type UpdateRequest struct {
	// TODO: add fields
}
EOF

# ---------------------------
# Domain: service.go
# ---------------------------
SERVICE_FILE="$DOMAIN_DIR/service.go"
[ -f "$SERVICE_FILE" ] || cat > "$SERVICE_FILE" <<EOF
package $PKG

type ${DP}Service struct {
	repository Repository
}

func New${DP}Service(r Repository) *${DP}Service {
	return &${DP}Service{repository: r}
}

func (s *${DP}Service) List() ([]${DP}Response, error) {
	return s.repository.FindAll()
}

func (s *${DP}Service) Create(request CreateRequest) (bool, error) {
	return s.repository.Insert(request)
}

func (s *${DP}Service) FindByID(id string) (${DP}Response, error) {
	return s.repository.FindByID(id)
}

func (s *${DP}Service) Update(id string, request UpdateRequest) (bool, error) {
	_, err := s.repository.FindByID(id)
	if err != nil {
		return false, err
	}
	return s.repository.Update(id, request)
}

func (s *${DP}Service) Remove(id string) (bool, error) {
	_, err := s.repository.FindByID(id)
	if err != nil {
		return false, err
	}
	return s.repository.SoftDelete(id)
}
EOF

# ---------------------------
# Models: adapters/models/<domain>.go
# ---------------------------
MODEL_FILE="$MODEL_DIR/${DOMAIN}.go"
[ -f "$MODEL_FILE" ] || cat > "$MODEL_FILE" <<EOF
package models

import "time"

type ${DP} struct {
	ID        string     \`gorm:"type:uuid;default:gen_random_uuid();primaryKey;column:id" json:"id"\`
	CreatedAt time.Time  \`gorm:"column:created_at;autoCreateTime" json:"createdAt"\`
	UpdatedAt time.Time  \`gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"\`
	DeletedAt *time.Time \`gorm:"column:deleted_at" json:"deletedAt"\`
}

func (${DP}) TableName() string { return "${DOMAIN}s" }
EOF

# ---------------------------
# Repository (gorm stub)
# ---------------------------
REPO_FILE="$REPO_DIR/${DOMAIN}_repository.go"
[ -f "$REPO_FILE" ] || cat > "$REPO_FILE" <<EOF
package repository

import (
	blogDomain "$MODULE/internal/domain/$DOMAIN"
	"gorm.io/gorm"
)

type ${DP}Repository struct {
	db *gorm.DB
}

func New${DP}Repository(db *gorm.DB) *${DP}Repository {
	return &${DP}Repository{db: db.Debug()}
}

func (r *${DP}Repository) FindAll() ([]blogDomain.${DP}Response, error) {
	return []blogDomain.${DP}Response{}, nil
}

func (r *${DP}Repository) Insert(request blogDomain.CreateRequest) (bool, error) {
	return true, nil
}

func (r *${DP}Repository) FindByID(id string) (blogDomain.${DP}Response, error) {
	return blogDomain.${DP}Response{ID: id}, nil
}

func (r *${DP}Repository) Update(id string, request blogDomain.UpdateRequest) (bool, error) {
	return true, nil
}

func (r *${DP}Repository) SoftDelete(id string) (bool, error) {
	return true, nil
}
EOF

# ---------------------------
# API adapter (wrap service, implement domain.Service)
# ---------------------------
API_FILE="$API_DIR/${DOMAIN}_api.go"
[ -f "$API_FILE" ] || cat > "$API_FILE" <<EOF
package api

import ${PKG} "$MODULE/internal/domain/$DOMAIN"

type ${DP}Api struct {
	service ${PKG}.${DP}Service
}

func New${DP}Api(service ${PKG}.${DP}Service) *${DP}Api {
	return &${DP}Api{service: service}
}

func (a *${DP}Api) List() ([]${PKG}.${DP}Response, error) {
	return a.service.List()
}

func (a *${DP}Api) Create(request ${PKG}.CreateRequest) (bool, error) {
	return a.service.Create(request)
}

func (a *${DP}Api) FindByID(id string) (${PKG}.${DP}Response, error) {
	return a.service.FindByID(id)
}

func (a *${DP}Api) Update(id string, request ${PKG}.UpdateRequest) (bool, error) {
	return a.service.Update(id, request)
}

func (a *${DP}Api) Remove(id string) (bool, error) {
	return a.service.Remove(id)
}
EOF

# ---------------------------
# HTTP handler
# ---------------------------
HTTP_FILE="$HTTP_DIR/${DOMAIN}.http.go"
[ -f "$HTTP_FILE" ] || cat > "$HTTP_FILE" <<EOF
package http

import (
	"net/http"

	${PKG} "$MODULE/internal/domain/$DOMAIN"

	"github.com/gin-gonic/gin"
)

type ${DP}HttpHandler struct {
	input ${PKG}.Service
	app   *gin.RouterGroup
}

func New${DP}HttpHandler(app *gin.RouterGroup, input ${PKG}.Service) *${DP}HttpHandler {
	return &${DP}HttpHandler{input: input, app: app}
}

func (h *${DP}HttpHandler) Register${DP}Routes() {
	g := h.app.Group("/$DOMAIN")
	g.GET("", h.List)
	g.POST("", h.Create)
	g.GET("/:id", h.FindByID)
	g.PATCH("/:id", h.Update)
	g.DELETE("/:id", h.Remove)
}

func (h *${DP}HttpHandler) List(c *gin.Context) {
	records, err := h.input.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": records})
}

func (h *${DP}HttpHandler) Create(c *gin.Context) {
	var req ${PKG}.CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ok, err := h.input.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ok})
}

func (h *${DP}HttpHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	res, err := h.input.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": res})
}

func (h *${DP}HttpHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req ${PKG}.UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ok, err := h.input.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ok})
}

func (h *${DP}HttpHandler) Remove(c *gin.Context) {
	id := c.Param("id")
	ok, err := h.input.Remove(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ok})
}
EOF

# ---------------------------
# Auto wire into router.go (requires markers)
# ---------------------------
if [ -f "$ROUTER_FILE" ]; then
  IMPORT_LINE="\t${PKG} \"${MODULE}/internal/domain/${DOMAIN}\""
  if ! grep -q "${MODULE}/internal/domain/${DOMAIN}" "$ROUTER_FILE"; then
    awk -v line="$IMPORT_LINE" '{print} /\[scaffold:domain_imports\]/{print line}' "$ROUTER_FILE" > "$ROUTER_FILE.tmp" && mv "$ROUTER_FILE.tmp" "$ROUTER_FILE"
  fi

  REPO_LINE="\t${LC}Repository := repository.New${DP}Repository(db.PG)"
  if ! grep -q "New${DP}Repository" "$ROUTER_FILE"; then
    awk -v line="$REPO_LINE" '{print} /\[scaffold:repo_init\]/{print line}' "$ROUTER_FILE" > "$ROUTER_FILE.tmp" && mv "$ROUTER_FILE.tmp" "$ROUTER_FILE"
  fi

  SERVICE_LINE="\t${LC}Service := ${PKG}.New${DP}Service(${LC}Repository)"
  if ! grep -q "New${DP}Service" "$ROUTER_FILE"; then
    awk -v line="$SERVICE_LINE" '{print} /\[scaffold:service_init\]/{print line}' "$ROUTER_FILE" > "$ROUTER_FILE.tmp" && mv "$ROUTER_FILE.tmp" "$ROUTER_FILE"
  fi

  API_LINE="\t${LC}Api := api.New${DP}Api(*${LC}Service)"
  if ! grep -q "New${DP}Api" "$ROUTER_FILE"; then
    awk -v line="$API_LINE" '{print} /\[scaffold:api_init\]/{print line}' "$ROUTER_FILE" > "$ROUTER_FILE.tmp" && mv "$ROUTER_FILE.tmp" "$ROUTER_FILE"
  fi

  HTTP_LINE="\thttp.New${DP}HttpHandler(app, ${LC}Api).Register${DP}Routes()"
  if ! grep -q "Register${DP}Routes" "$ROUTER_FILE"; then
    awk -v line="$HTTP_LINE" '{print} /\[scaffold:http_register\]/{print line}' "$ROUTER_FILE" > "$ROUTER_FILE.tmp" && mv "$ROUTER_FILE.tmp" "$ROUTER_FILE"
  fi
fi

command -v gofmt >/dev/null 2>&1 && gofmt -w \
  "$DOMAIN_DIR"/*.go \
  "$API_FILE" "$REPO_FILE" "$HTTP_FILE" \
  "$MODEL_FILE" \
  "$ROUTER_FILE" 2>/dev/null || true

echo "✅ Domain '$DOMAIN' created + wired into router.go"
