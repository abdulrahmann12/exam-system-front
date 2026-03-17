/**
 * Standard API response envelope from backend.
 */
export interface BasicResponse<T = unknown> {
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Paginated response (when backend returns page/size/total).
 */
export interface PageResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
}

export type ApiResponse<T> = BasicResponse<T>;
