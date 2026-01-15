package utils

import (
	"log"
	"os"
	"time"

	"gorm.io/gorm/logger"
)

// CustomLogger is a logger configuration for GORM that is easy to read and understand
var CustomLogger = logger.New(
	// Sử dụng log.New để in ra terminal với định dạng dễ hiểu hơn
	log.New(os.Stdout, "[GORM] ", log.LstdFlags|log.Lshortfile),

	// Cấu hình logger cho GORM
	logger.Config{
		// SlowThreshold là ngưỡng để xác định câu lệnh SQL nào là chậm
		// Ở đây là 200ms, có thể điều chỉnh tùy vào hiệu suất cần thiết
		SlowThreshold: 200 * time.Millisecond, // Log queries slower than this

		// Mức độ log: Thay đổi LogLevel nếu cần thêm thông tin
		// logger.Info: log tất cả thông tin, kể cả truy vấn thành công
		// logger.Warn: log cảnh báo và lỗi
		// logger.Error: chỉ log khi có lỗi
		LogLevel: logger.Info, // Change to logger.Info, logger.Warn, or logger.Error

		// Bật màu sắc để dễ phân biệt các loại log trong terminal (nếu terminal hỗ trợ)
		Colorful: true, // Enable colorful output
	},
)
