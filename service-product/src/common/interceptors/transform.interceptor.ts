import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../utils/api-response.util';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((body: any) => {
        // Nếu handler đã tự trả ApiResponse thì không wrap nữa
        if (body && typeof body === 'object' && 'success' in body) {
          return body;
        }

        // Nếu handler trả dạng { data, meta } thì tách ra
        if (body && typeof body === 'object' && ('data' in body || 'meta' in body)) {
          // return {
          //   success: true,
          //   data: body.data ?? null,
          //   meta: body.meta ?? null,
          //   error: null,
          // };
          return ApiResponse.ok(body.data ?? null, body.meta ?? null);
        }

        // Trường hợp đơn giản: trả data thẳng
        // return {
        //   success: true,
        //   data: body ?? null,
        //   meta: null,
        //   error: null,
        // };
        return ApiResponse.ok(body ?? null);
      }),
    );
  }
}
