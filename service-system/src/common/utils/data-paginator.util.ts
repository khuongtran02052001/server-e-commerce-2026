// pagination.util.ts
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      lastPage: number;
      currentPage: number;
      perPage: number;
      prev: number | null;
      next: number | null;
    };
  };
}
export interface PaginationMeta {
  pagination: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
};

// paginator sẽ trả luôn ApiResponseDto<T[], PaginationMeta>
export type PaginateFunction = <T, K>(
  model: any,
  args?: K,
  options?: PaginateOptions,
) => Promise<PaginatedResult<T>>;

export const paginator = (defaultOptions: PaginateOptions): PaginateFunction => {
  return async (model, args: any = {}, options?: PaginateOptions) => {
    const page = Number(options?.page ?? defaultOptions.page ?? 1) || 1;
    const perPage = Number(options?.perPage ?? defaultOptions.perPage ?? 10) || 10;

    const skip = page > 0 ? perPage * (page - 1) : 0;
    const where = args?.where;

    const [total, data] = await Promise.all([
      model.count({ where }),
      model.findMany({
        ...args,
        take: perPage,
        skip,
      }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);

    const meta: PaginationMeta = {
      pagination: {
        total,
        lastPage,
        currentPage: page,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
    return {
      data,
      meta,
    };
  };
};

// instance dùng chung cho toàn project
export const dataPaginate: PaginateFunction = paginator({
  page: 1,
  perPage: 10,
});
