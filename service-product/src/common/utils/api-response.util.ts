// api-response.dto.ts
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponseBuilder<T, M = any> {
  success: boolean;
  data: T | null;
  meta?: M | null;
  error?: ApiError | null;
}

export class ApiResponse<T, M = any> implements ApiResponseBuilder<T, M> {
  success: boolean;
  data: T | null;
  meta: M | null;
  error: ApiError | null;

  constructor(
    success: boolean,
    data: T | null,
    meta: M | null = null,
    error: ApiError | null = null,
  ) {
    this.success = success;
    this.data = data;
    this.meta = meta;
    this.error = error;
  }

  static ok<T, M = any>(data: T | null = null, meta: M | null = null) {
    return new ApiResponse<T, M>(true, data, meta, null);
  }

  static error<T = null, M = any>(code: string, message: string, details?: any) {
    return new ApiResponse<T, M>(false, null, null, {
      code,
      message,
      details,
    });
  }
}
