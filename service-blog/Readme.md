````md
# Go Hexagonal Service (Gin + GORM + PostgreSQL)

Dự án này là một service viết bằng Go theo **Hexagonal Architecture (Ports & Adapters)**, phù hợp để mở rộng theo hướng **microservice**.

- **HTTP Framework**: Gin  
- **ORM**: GORM  
- **Database**: PostgreSQL  
- **Dev hot-reload**: Air  
- **Thiết kế**: Domain-centric + tách inbound/outbound adapters + dễ gen feature mới

---

## Mục tiêu kiến trúc

Hexagonal giúp bạn:
- Viết **domain/usecase độc lập** với framework/DB
- Dễ thay adapter: đổi DB (Postgres → MySQL) hoặc đổi inbound (HTTP → gRPC) mà domain gần như không đổi
- Dễ test: mock `Repository`/`Service` để test business logic

Trong project này:
- **Inbound adapter**: HTTP (Gin)
- **Outbound adapter**: Repository (GORM)
- **Domain**: Ports + Service (Usecase)
- **API adapter**: Presenter/Aggregator (map response riêng, có thể gọi service khác)

---

## Cây source code (tổng quan)

> Ví dụ minh hoạ dùng domain **`notification`** (chỉ là ví dụ, bạn có thể tạo domain mới bất kỳ).

```bash
.
├─ cmd/
│  └─ server/
│     └─ main.go
├─ internal/
│  ├─ adapters/
│  │  ├─ db/
│  │  │  └─ db.go
│  │  ├─ http/
│  │  │  └─ notification.http.go
│  │  ├─ models/
│  │  │  └─ notification.go
│  │  └─ dto/
│  │     └─ notification_response.go (tuỳ chọn)
│  ├─ domain/
│  │  └─ notification/
│  │     ├─ port.go
│  │     ├─ type.go
│  │     └─ service.go
│  ├─ infrastructure/
│  │  ├─ api/
│  │  │  └─ notification_api.go
│  │  └─ repository/
│  │     └─ notification_repository.go
│  ├─ router/
│  │  └─ router.go
│  ├─ shared/
│  │  ├─ config/
│  │  │  └─ ...
│  │  └─ utils/
│  │     └─ ...
│  └─ scripts/
│     └─ new_domain.sh
├─ docker/
│  ├─ dockerfile.dev
│  └─ dockerfile.prod
├─ .air.toml
├─ docker-compose.yml
├─ Makefile
└─ README.md
````

---

## Giải thích từng folder & vai trò

### `cmd/server/`

Entry point để chạy service.

* **`main.go`**: load env, connect DB, migrate (nếu bật), init router và `Run()`.

---

### `internal/router/`

Nơi **wire dependency** (lắp ghép các thành phần theo Hex):

* tạo repository (outbound)
* tạo service (domain)
* tạo api adapter (presenter)
* đăng ký http routes (inbound)

---

### `internal/domain/<domain>/`

Trái tim của service. Không phụ thuộc Gin/GORM.

Ví dụ với `notification`:

* **`port.go`**
  Khai báo `Service` interface (inbound port) và `Repository` interface (outbound port).
* **`type.go`**
  Các request/response types, lỗi domain (ví dụ `ErrNotFound`), struct entity/data.
* **`service.go`**
  Usecase chính: struct `NotificationService` implement `Service`, gọi repo qua interface `Repository`.

> Nguyên tắc: domain **không import Gin/GORM**. Domain chỉ biết interface và data type.

---

### `internal/infrastructure/repository/`

Outbound adapter: implement `domain.Repository` bằng GORM.

* **`*_repository.go`**: query DB, preload relation (nếu có), soft delete,…

---

### `internal/infrastructure/api/`

API adapter / Presenter / Aggregator.

Tác dụng:

* map response theo format riêng (chuẩn hoá output)
* có thể gọi service khác để enrich data (microservice)
* giúp HTTP handler nhẹ và rõ

Ví dụ:

* **`notification_api.go`** wrap `notificationDomain.NotificationService` (hoặc interface `notificationDomain.Service`).

---

### `internal/adapters/http/`

Inbound adapter: HTTP handler (Gin).

* parse request (`ShouldBindJSON`, `Param`, `Query`)
* gọi `domain.Service` (thường qua API adapter)
* trả JSON response

Ví dụ:

* **`notification.http.go`**: register routes `/notification`, `/notification/:id`…

---

### `internal/adapters/models/`

Các model GORM (tương ứng table DB).

* nơi bạn định nghĩa struct với tag `gorm:"..."` để migrate/query.

---

### `internal/adapters/db/`

Kết nối database, init gorm config, pooling, log level…

* **`db.go`**: connect Postgres, trả về `*gorm.DB` hoặc wrapper `PostgresDB`.

---

### `internal/shared/`

Chứa các phần dùng chung:

* `config`: load env, đọc biến môi trường
* `utils`: middleware CORS, helper migrate, helper response,…

---

### `internal/scripts/`

Scripts hỗ trợ dev:

* **`new_domain.sh`**: generator tạo domain mới theo template + auto-wire vào router

---

## Luồng xử lý request (từ HTTP → DB)

Ví dụ request: `GET /v1/api/notification`

1. `router/router.go` đăng ký route và inject dependency
2. `adapters/http/notification.http.go` nhận request
3. `infrastructure/api/notification_api.go` map response/aggregate (nếu cần)
4. `domain/notification/service.go` xử lý usecase (business logic)
5. `infrastructure/repository/notification_repository.go` query DB bằng GORM
6. trả dữ liệu ngược về HTTP response

Tóm tắt:

```text
HTTP Handler → API Adapter → Domain Service → Repository → Database
```

---

## Chạy dự án (Dev)

### 1) Start bằng Docker Compose

```bash
docker compose up -d --build
```

### 2) Xem logs

```bash
docker compose logs -f dev
```

> Nếu bạn thay đổi schema/migration nhiều, có thể cần reset DB (xem mục “Reset DB”).

---

## Chạy dự án (Prod)

Build image prod và run container theo cấu hình của bạn (tuỳ CI/CD).
Dockerfile prod đã build binary và chạy trên Alpine.

---

## Reset database (khi đổi schema/migrate lớn)

Nếu bạn đang bind mount `./data_example:/var/lib/postgresql/data`:

```bash
docker compose down
rm -rf ./data_example/*
docker compose up -d --build
```

---

## Tạo domain mới bằng generator

Script: `internal/scripts/new_domain.sh`

Ví dụ tạo domain `comment`:

```bash
sh internal/scripts/new_domain.sh comment
```

Sau khi chạy, hệ thống sẽ:

* tạo folder `internal/domain/comment/` (port/type/service)
* tạo repository stub `internal/infrastructure/repository/comment_repository.go`
* tạo API adapter `internal/infrastructure/api/comment_api.go`
* tạo HTTP handler `internal/adapters/http/comment.http.go`
* tạo model `internal/adapters/models/comment.go`
* tự động **wire** vào `internal/router/router.go` (nếu router có marker scaffold)

---

## Router scaffold markers (bắt buộc để auto-wire)

Trong `internal/router/router.go`, cần có các marker:

```go
// [scaffold:domain_imports]
// [scaffold:repo_init]
// [scaffold:service_init]
// [scaffold:api_init]
// [scaffold:http_register]
```

Ví dụ khung router:

```go
import (
  // ...
  // [scaffold:domain_imports]
)

func InitRouter(db *postgresql.PostgresDB) *gin.Engine {
  // ...
  // [scaffold:repo_init]
  // [scaffold:service_init]
  // [scaffold:api_init]
  // [scaffold:http_register]
  return router
}
```

---

## Quy ước đặt tên (để dự án thống nhất)

* Domain folder: `internal/domain/<snake_case>`
* Package alias trong code: `<camelCase>Domain`

  * Ví dụ `notificationDomain`, `commentDomain`, `orderItemDomain`
* Repository struct: `<Pascal>Repository`
* Service struct: `<Pascal>Service`
* API adapter: `<Pascal>Api`
* HTTP handler: `<Pascal>HttpHandler`

---

## Gợi ý mở rộng (microservice-friendly)

Vì project hướng microservice, bạn nên:

* Domain chỉ giữ các field ID tham chiếu (ví dụ `userId`, `authorId`)
* Việc “lấy thêm data” (email, name) nên làm ở **API adapter** bằng cách gọi service khác
* Tránh join qua nhiều service trong repo (repo chỉ làm việc với DB nội bộ của service này)

---

## Ghi chú

* Nếu bạn thấy log kiểu `No .env file found`, nghĩa là trong code có chỗ cố load `.env` mặc định.

  * Khi chạy Docker Compose, biến môi trường đã được nạp từ `env_file`, nên log này có thể bỏ qua hoặc chỉnh code chỉ load `.env` khi chạy local.

---
