import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, getErrorMessage, getErrorStatusCode, isAppError } from './errors';

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
  const body: SuccessResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    body.message = message;
  }
  return NextResponse.json(body, { status });
}

export function errorResponse(error: unknown): NextResponse<ApiResponse<never>> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(issue.message);
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
      },
      { status: 400 }
    );
  }

  // Handle custom app errors
  if (isAppError(error)) {
    const body: ErrorResponse = {
      success: false,
      error: error.message,
      code: error.code,
    };
    if (error instanceof AppError && 'errors' in error) {
      body.details = error.errors as Record<string, string[]>;
    }
    return NextResponse.json(body, { status: error.statusCode });
  }

  // Handle generic errors (sanitized for production)
  console.error('Unhandled error:', error);
  return NextResponse.json(
    {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : getErrorMessage(error),
      code: 'INTERNAL_ERROR',
    },
    { status: getErrorStatusCode(error) }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]> & { pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
