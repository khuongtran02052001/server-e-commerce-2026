// src/common/filters/all-exceptions.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma';
import { ApiResponse } from '../utils/api-response.util';
// (tuỳ chọn) nếu dùng Zod hoặc Prisma thì import thêm:
// import { ZodError } from 'zod';
// import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiResponse<null>;

    // 1) Nếu là HttpException của Nest (BadRequestException, NotFoundException, …)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // Nếu dev đã tự trả đúng ApiResponse rồi thì pass-through
      if (typeof res === 'object' && (res as any).success === false && 'error' in (res as any)) {
        body = res as any;
      } else {
        const resObj = typeof res === 'object' ? (res as any) : {};
        const rawMessage =
          typeof res === 'string' ? res : resObj.message || resObj.error || 'Http error';

        const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);

        body = ApiResponse.error(
          resObj.code || HttpStatus[status] || 'HTTP_ERROR',
          message,
          // nếu là lỗi validation (class-validator) nó có mảng message → cho vào details
          Array.isArray(resObj.message) ? resObj.message : resObj.details,
        );
        // body = {
        //   success: false,
        //   data: null,
        //   meta: null,
        //   error: {
        //     code: resObj.code || HttpStatus[status] || 'HTTP_ERROR',
        //     message,
        //     // nếu là lỗi validation (class-validator) nó có mảng message → cho vào details
        //     details: Array.isArray(resObj.message) ? resObj.message : resObj.details,
        //   },
        // };
      }
    }
    // else if (exception instanceof ZodError) {
    //   status = HttpStatus.BAD_REQUEST;
    //   body = {
    //     success: false,
    //     data: null,
    //     meta: null,
    //     error: {
    //       code: 'VALIDATION_ERROR',
    //       message: 'Validation failed',
    //       details: exception.issues,
    //     },
    //   };
    // }
    // 2) (tuỳ chọn) Nếu bạn muốn bắt riêng ZodError
    // else if (exception instanceof ZodError) {
    //   status = HttpStatus.BAD_REQUEST;
    //   body = {
    //     success: false,
    //     data: null,
    //     meta: null,
    //     error: {
    //       code: 'VALIDATION_ERROR',
    //       message: 'Validation failed',
    //       details: exception.issues,
    //     },
    //   };
    // }
    // 3) (tuỳ chọn) Nếu muốn xử lý riêng Prisma error
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(exception);
      status = HttpStatus.BAD_REQUEST;
      // body = {
      //   success: false,
      //   data: null,
      //   meta: null,
      //   error: {
      //     code: exception.code,
      //     message: 'Database error',
      //     details: exception.meta,
      //   },
      // };
      body = ApiResponse.error(exception.code, 'Database error', exception.meta);
    }
    // 4) Các lỗi còn lại
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      // body = {
      //   success: false,
      //   data: null,
      //   meta: null,
      //   error: {
      //     code: 'INTERNAL_SERVER_ERROR',
      //     message: 'Internal server error',
      //     details: null,
      //   },
      // };
      body = ApiResponse.error('INTERNAL_SERVER_ERROR', 'Internal server error', null);
    }

    response.status(status).json(body);
  }
}
